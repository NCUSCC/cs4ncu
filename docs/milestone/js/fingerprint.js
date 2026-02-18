/**
 * @file        fingerprint.js
 * @description 里程碑模块 — 匿名机器指纹生成
 *
 * @summary
 *   通过综合 Canvas 渲染差异、WebGL 渲染器信息、屏幕参数、
 *   浏览器环境特征等维度，生成一个**匿名且不可逆**的设备哈希。
 *   不采集任何可直接识别个人身份的信息（如 IP、Cookie）。
 *
 *   原理：不同的 GPU / 驱动 / 字体渲染引擎在绘制相同图形时
 *   会产生像素级差异，我们利用这些差异来区分设备。
 *
 * @depends     无外部依赖，使用 Web Crypto API (SHA-256)
 * @exports     Fingerprint.generate() → Promise<string>  (16 位十六进制)
 *
 * @author      NCUSCC & Community Contributors
 * @version     2.0.0
 */

const Fingerprint = (() => {
  'use strict';

  /**
   * SHA-256 哈希
   * 使用浏览器原生 Web Crypto API，无需第三方库
   * @param   {string} str - 待哈希的字符串
   * @returns {Promise<string>} 64 位十六进制哈希
   */
  async function sha256(str) {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 采集 Canvas 渲染指纹
   * 通过绘制文本、矩形、弧线等元素，利用 GPU 渲染差异生成特征
   * @returns {string} Canvas 的 DataURL 或错误标记
   */
  function collectCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');

      // 多种绘制操作以最大化渲染差异
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);       // 矩形填充
      ctx.fillStyle = '#069';
      ctx.fillText('CS4NCU Milestone 🎓', 2, 15);  // Unicode + Emoji
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Fingerprint', 4, 30);  // 半透明文本

      // 弧线绘制（增加 GPU 路径渲染差异）
      ctx.beginPath();
      ctx.arc(50, 25, 20, 0, Math.PI * 2);
      ctx.stroke();

      return canvas.toDataURL();
    } catch (e) {
      return 'canvas-error';
    }
  }

  /**
   * 采集 WebGL 渲染器信息
   * 不同显卡 / 驱动会报告不同的 vendor 和 renderer 字符串
   * @returns {string[]} WebGL 特征数组
   */
  function collectWebGLInfo() {
    const results = [];
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        // 尝试获取未遮蔽的渲染器信息
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          results.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
          results.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
        }
        results.push(gl.getParameter(gl.VERSION));
      }
    } catch (e) {
      results.push('webgl-error');
    }
    return results;
  }

  /**
   * 采集设备与浏览器环境特征
   * 这些参数组合起来可以大幅缩小设备识别范围
   * @returns {string[]} 环境特征数组
   */
  function collectEnvironmentFeatures() {
    return [
      `${screen.width}x${screen.height}`,               // 屏幕分辨率
      String(screen.colorDepth),                         // 颜色深度
      String(window.devicePixelRatio),                   // 设备像素比
      navigator.language,                                // 浏览器语言
      String(navigator.hardwareConcurrency || 'unknown'),// CPU 核心数
      Intl.DateTimeFormat().resolvedOptions().timeZone,   // 时区
      navigator.platform,                                // 操作系统平台
    ];
  }

  /**
   * 生成最终的匿名指纹
   * 将所有维度的特征合并后进行 SHA-256 哈希
   * @returns {Promise<string>} 16 位十六进制指纹（取 SHA-256 前 16 位）
   */
  async function generate() {
    const components = [];

    // 维度 1：Canvas 渲染差异
    components.push(collectCanvasFingerprint());

    // 维度 2：WebGL 渲染器
    components.push(...collectWebGLInfo());

    // 维度 3：设备环境
    components.push(...collectEnvironmentFeatures());

    // 合并所有维度并哈希
    const raw = components.join('|||');
    const hash = await sha256(raw);

    // 取前 16 位作为显示用的简短指纹
    return hash.substring(0, 16);
  }

  // ---- 公开 API ----
  return Object.freeze({ generate });
})();
