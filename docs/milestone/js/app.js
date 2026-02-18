/**
 * @file        app.js
 * @description 里程碑模块 — 应用主入口
 *
 * @summary
 *   作为 "指挥官"，负责：
 *   1. 编排各子模块的初始化顺序
 *   2. 绑定顶层 UI 事件（留言按钮、CSV 导入/导出）
 *   3. 启动粒子动画循环
 *   4. 管理加载屏幕的生命周期
 *
 *   加载顺序要求（由 index.html 保证）：
 *     config.js → fingerprint.js → seasons.js → storage.js
 *     → timeline.js → modal.js → app.js
 *
 * @depends     所有子模块
 * @author      NCUSCC & Community Contributors
 * @version     2.0.0
 */

const MilestoneApp = (() => {
  'use strict';

  // ---- 全局状态 ----
  let fingerprint = '';     // 当前访客的匿名指纹
  let allMessages = [];     // 所有留言（远程 CSV + 本地 localStorage 合并）

  // ===========================================================
  //  Toast 通知
  // ===========================================================

  let toastTimer = null;

  /**
   * 显示轻量 Toast 提示
   * @param {string} text - 提示文本
   * @param {number} [duration=2500] - 显示时长（ms）
   */
  function showToast(text, duration = 2500) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = text;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  // ===========================================================
  //  留言按钮状态管理
  // ===========================================================

  /** 根据本学期留言状态更新 "刻下铭文" 按钮 */
  function updateComposeButton() {
    const btn = document.getElementById('compose-btn');
    if (!btn) return;

    if (Storage.hasPosted(fingerprint)) {
      btn.disabled = true;
      btn.textContent = '✦ 本学期已留言';
    } else {
      btn.disabled = false;
      btn.textContent = '✦ 刻下铭文';
    }
  }

  // ===========================================================
  //  留言提交后的刷新流程
  // ===========================================================

  /**
   * 留言提交成功后的回调
   * 重新加载数据 → 重新渲染 → 滚动到最新位置
   */
  async function onMessageSubmitted(/* msg */) {
    showToast('铭文已镌刻 ✦');

    // 重新加载（合并远程 + 本地）
    allMessages = await Storage.loadAll();

    // 重新渲染并滚动到末尾
    Timeline.render(allMessages);
    Timeline.scrollToEnd();

    // 更新按钮状态
    updateComposeButton();
  }

  // ===========================================================
  //  CSV 管理（顶栏按钮）
  // ===========================================================

  /** 导出所有留言为 CSV */
  function handleExportCSV() {
    if (allMessages.length === 0) {
      showToast('暂无数据可导出');
      return;
    }
    const success = Storage.exportCSV(allMessages);
    if (success) showToast('CSV 导出成功');
  }

  /** 从 CSV 文件导入留言 */
  function handleImportCSV(event) {
    Storage.importCSV(event, async (count) => {
      if (count === -1) {
        showToast('CSV 解析失败，请检查文件格式');
        return;
      }

      showToast(`成功导入 ${count} 条新留言`);

      // 重新加载并渲染
      allMessages = await Storage.loadAll();
      Timeline.render(allMessages);
      Timeline.scrollToEnd();
    });
  }

  // ===========================================================
  //  粒子动画循环
  // ===========================================================

  /** requestAnimationFrame 驱动的主循环 */
  function animationLoop(time) {
    requestAnimationFrame(animationLoop);
    Seasons.animateParticles(time, Timeline.getScrollProgress);
  }

  // ===========================================================
  //  初始化主流程
  // ===========================================================

  async function init() {
    try {
      // 第 1 步：生成匿名机器指纹
      fingerprint = await Fingerprint.generate();

      // 第 2 步：加载全部留言（远程 CSV + localStorage）
      allMessages = await Storage.loadAll();

      // 第 3 步：初始化粒子系统
      Seasons.initParticles();
      requestAnimationFrame(animationLoop);

      // 第 4 步：渲染时间轴与卡片
      Timeline.render(allMessages);

      // 第 5 步：设置时间轴拖拽 / 滚轮交互
      Timeline.setupInteractions();

      // 第 6 步：设置留言弹窗
      Modal.setupListeners(fingerprint, onMessageSubmitted);

      // 第 7 步：绑定顶层按钮事件
      bindTopLevelEvents();

      // 第 8 步：更新按钮状态
      updateComposeButton();

      // 第 9 步：初始季节背景
      Seasons.updateBackground(Timeline.getScrollProgress());

      // 第 10 步：滚动到最新留言
      if (allMessages.length > 0) {
        Timeline.scrollToEnd();
      }

      // 第 11 步：关闭加载屏幕
      setTimeout(() => {
        const loading = document.getElementById('loading-screen');
        if (loading) loading.classList.add('hidden');
      }, 1200);

    } catch (err) {
      console.error('[MilestoneApp] 初始化失败:', err);
      // 即使出错也关闭加载屏幕，避免用户被卡住
      const loading = document.getElementById('loading-screen');
      if (loading) loading.classList.add('hidden');
    }
  }

  /** 绑定不属于任何子模块的顶层 UI 事件 */
  function bindTopLevelEvents() {
    // "刻下铭文" 按钮
    const composeBtn = document.getElementById('compose-btn');
    if (composeBtn) {
      composeBtn.addEventListener('click', () => {
        const opened = Modal.open(fingerprint);
        if (!opened) {
          showToast('你在本学期已留过言，下学期再来吧 ✦');
        }
      });
    }

    // CSV 导出按钮
    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', handleExportCSV);
    }

    // CSV 导入按钮（触发隐藏的 file input）
    const importBtn = document.getElementById('import-csv-btn');
    const importInput = document.getElementById('csv-import');
    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => importInput.click());
      importInput.addEventListener('change', handleImportCSV);
    }

    // 窗口大小变化 → 重新渲染
    window.addEventListener('resize', () => {
      Timeline.render(allMessages);
      Seasons.resizeCanvas();
    });
  }

  // ---- 启动 ----
  init();

  // ---- 公开 API（供调试或扩展使用） ----
  return Object.freeze({
    showToast,
    getFingerprint: () => fingerprint,
    getMessages: () => [...allMessages],
  });
})();
