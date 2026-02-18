/**
 * @file        seasons.js
 * @description 里程碑模块 — 四季视觉系统
 *
 * @summary
 *   负责两件事：
 *   1. 根据滚动进度平滑过渡四季背景渐变
 *   2. 管理与渲染季节粒子特效（花瓣 / 萤火虫 / 落叶 / 雪花）
 *
 * @depends     config.js (MilestoneConfig)
 * @exports     Seasons.updateBackground(progress)
 *              Seasons.initParticles()
 *              Seasons.animateParticles(timestamp)
 *
 * @author      NCUSCC & Community Contributors
 * @version     2.0.0
 */

const Seasons = (() => {
  'use strict';

  const { SEASON_PALETTE, SEASON_ORDER, PARTICLES } = MilestoneConfig;

  // ---- 内部状态 ----
  let particlesCtx = null;  // Canvas 2D 上下文
  let particles = [];       // 活跃粒子数组

  // ===========================================================
  //  颜色工具函数
  // ===========================================================

  /**
   * 线性插值两个 hex 颜色
   * @param {string} hex1 - 起始颜色 (#rrggbb)
   * @param {string} hex2 - 结束颜色 (#rrggbb)
   * @param {number} t    - 插值因子 (0~1)
   * @returns {string} 插值后的 rgb() 字符串
   */
  function lerpColor(hex1, hex2, t) {
    const parse = (hex, start) => parseInt(hex.slice(start, start + 2), 16);
    const r = Math.round(parse(hex1, 1) + (parse(hex2, 1) - parse(hex1, 1)) * t);
    const g = Math.round(parse(hex1, 3) + (parse(hex2, 3) - parse(hex1, 3)) * t);
    const b = Math.round(parse(hex1, 5) + (parse(hex2, 5) - parse(hex1, 5)) * t);
    return `rgb(${r},${g},${b})`;
  }

  // ===========================================================
  //  季节混合计算
  // ===========================================================

  /**
   * 根据滚动进度 (0~1) 计算当前的季节混合状态
   * 每半个滚动长度经历完整的春→夏→秋→冬循环
   *
   * @param   {number} progress - 滚动进度 (0~1)
   * @returns {{ from: string, to: string, blend: number, name: string }}
   *          from/to = 季节键名, blend = 混合比例, name = 显示名称
   */
  function getSeasonBlend(progress) {
    const scaled = (progress * 2) % 1;   // 循环映射
    const idx = scaled * 4;               // 映射到 4 个季节区间
    const fromIdx = Math.floor(idx) % 4;
    const toIdx = (fromIdx + 1) % 4;
    const blend = idx % 1;

    const fromKey = SEASON_ORDER[fromIdx];
    const toKey = SEASON_ORDER[toIdx];

    return {
      from: fromKey,
      to: toKey,
      blend,
      name: blend < 0.5
        ? SEASON_PALETTE[fromKey].name
        : SEASON_PALETTE[toKey].name,
    };
  }

  // ===========================================================
  //  背景更新
  // ===========================================================

  /**
   * 更新页面背景渐变与季节指示器
   * @param {number} progress - 当前滚动进度 (0~1)
   */
  function updateBackground(progress) {
    const { from, to, blend, name } = getSeasonBlend(progress);
    const colFrom = SEASON_PALETTE[from];
    const colTo = SEASON_PALETTE[to];

    // 插值背景渐变的起止色
    const bgStart = lerpColor(colFrom.bgStart, colTo.bgStart, blend);
    const bgEnd = lerpColor(colFrom.bgEnd, colTo.bgEnd, blend);
    const accent = lerpColor(colFrom.accent, colTo.accent, blend);

    // 应用到 DOM
    const bgEl = document.getElementById('season-bg');
    if (bgEl) {
      bgEl.style.background = `linear-gradient(135deg, ${bgStart} 0%, ${bgEnd} 100%)`;
    }

    // 更新顶部季节指示器
    const nameEl = document.getElementById('season-name');
    const dotEl = document.querySelector('#season-indicator .dot');
    if (nameEl) nameEl.textContent = name;
    if (dotEl) dotEl.style.background = accent;
  }

  // ===========================================================
  //  粒子系统
  // ===========================================================

  /**
   * 单个粒子对象
   * 根据所属季节呈现不同的视觉效果：
   *   春 → 粉色花瓣，缓慢飘落，水平摆动
   *   夏 → 金色萤火虫，微微浮动，明灭闪烁
   *   秋 → 橙红落叶，较快飘落，大幅漂移
   *   冬 → 白色雪花，轻盈飘落
   */
  class Particle {
    constructor(canvasW, canvasH, season) {
      this.reset(canvasW, canvasH, season);
    }

    /** 重置/初始化粒子属性 */
    reset(canvasW, canvasH, season) {
      this.season = season;
      this.x = Math.random() * canvasW;
      this.y = Math.random() * canvasH * -1;   // 从屏幕上方生成
      this.opacity = Math.random() * 0.6 + 0.2;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 2;

      // 各季节独立参数
      switch (season) {
        case 'spring':
          this.color = `${200 + Math.random() * 55},${130 + Math.random() * 60},${160 + Math.random() * 60}`;
          this.speedX = (Math.random() - 0.5) * 0.8;
          this.speedY = Math.random() * 0.8 + 0.2;
          this.size = Math.random() * 5 + 3;
          break;
        case 'summer':
          this.color = `255,${200 + Math.random() * 55},${50 + Math.random() * 50}`;
          this.speedX = (Math.random() - 0.5) * 0.3;
          this.speedY = Math.random() * 0.3 + 0.05;
          this.size = Math.random() * 3 + 1;
          this.pulsePhase = Math.random() * Math.PI * 2;  // 萤火虫明灭相位
          break;
        case 'autumn':
          this.color = `${200 + Math.random() * 55},${80 + Math.random() * 80},${20 + Math.random() * 40}`;
          this.speedX = (Math.random() - 0.5) * 1.5;
          this.speedY = Math.random() * 1.2 + 0.5;
          this.size = Math.random() * 6 + 3;
          break;
        case 'winter':
          this.color = `${220 + Math.random() * 35},${230 + Math.random() * 25},255`;
          this.speedX = (Math.random() - 0.5) * 0.5;
          this.speedY = Math.random() * 0.6 + 0.2;
          this.size = Math.random() * 4 + 1;
          break;
      }
    }

    /** 每帧更新位置 */
    update(canvasW, canvasH, time) {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;

      // 夏季萤火虫：正弦函数驱动明灭
      if (this.season === 'summer') {
        this.opacity = 0.3 + Math.sin(time * 0.003 + this.pulsePhase) * 0.4;
      }

      // 边界回绕
      if (this.y > canvasH + 20) { this.y = -20; this.x = Math.random() * canvasW; }
      if (this.x < -20) this.x = canvasW + 20;
      if (this.x > canvasW + 20) this.x = -20;
    }

    /** 绘制到 Canvas */
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation * Math.PI / 180);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`;

      switch (this.season) {
        case 'spring':
          // 椭圆花瓣
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'summer':
          // 发光萤火虫
          ctx.shadowColor = `rgba(${this.color},0.5)`;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          break;
        case 'autumn':
          // 椭圆落叶
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size, this.size * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'winter':
          // 圆形雪花
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fill();
          break;
      }

      ctx.restore();
    }
  }

  /** 初始化粒子画布 */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    particlesCtx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  /** 画布尺寸跟随窗口 */
  function resizeCanvas() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /**
   * 粒子动画主循环（由 requestAnimationFrame 驱动）
   * @param {number} time         - 高精度时间戳
   * @param {Function} getProgress - 获取当前滚动进度的回调
   */
  function animateParticles(time, getProgress) {
    const canvas = document.getElementById('particles-canvas');
    if (!particlesCtx || !canvas) return;

    particlesCtx.clearRect(0, 0, canvas.width, canvas.height);

    // 确定当前季节
    const progress = typeof getProgress === 'function' ? getProgress() : 0;
    const { from, to, blend } = getSeasonBlend(progress);
    const currentSeason = blend < 0.5 ? from : to;

    // 补充粒子至目标数量
    while (particles.length < PARTICLES.COUNT) {
      particles.push(new Particle(canvas.width, canvas.height, currentSeason));
    }

    // 更新 & 绘制
    particles.forEach(p => {
      // 季节切换时概率性重置部分粒子，实现自然过渡
      if (p.season !== currentSeason && Math.random() < PARTICLES.SEASON_SWITCH_RATE) {
        p.reset(canvas.width, canvas.height, currentSeason);
      }
      p.update(canvas.width, canvas.height, time);
      p.draw(particlesCtx);
    });
  }

  // ---- 公开 API ----
  return Object.freeze({
    getSeasonBlend,
    lerpColor,
    updateBackground,
    initParticles,
    resizeCanvas,
    animateParticles,
  });
})();
