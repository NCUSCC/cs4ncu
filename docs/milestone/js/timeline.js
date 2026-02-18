/**
 * @file        timeline.js
 * @description 里程碑模块 — 水平时间轴引擎
 *
 * @summary
 *   负责：
 *   1. 根据留言数据计算时间轴长度并渲染卡片 / 连接线 / 刻度
 *   2. 处理鼠标拖拽、触摸滑动、滚轮等横向滚动交互
 *   3. 同步更新进度条和季节背景
 *
 * @depends     config.js  (MilestoneConfig)
 *              seasons.js (Seasons)
 * @exports     Timeline.render(messages)
 *              Timeline.setupInteractions()
 *              Timeline.getScrollProgress()
 *              Timeline.scrollToEnd()
 *
 * @author      NCUSCC & Community Contributors
 * @version     2.0.0
 */

const Timeline = (() => {
  'use strict';

  const { LAYOUT, SEASON_PALETTE } = MilestoneConfig;

  // ---- 内部状态 ----
  let scrollOffset = 0;         // 当前水平偏移量（px）
  let isDragging = false;       // 是否正在拖拽
  let dragStartX = 0;           // 拖拽起始 X
  let dragStartOffset = 0;      // 拖拽开始时的偏移
  let currentMessages = [];     // 当前留言数据引用
  let scrollHintHidden = false; // 滚动引导是否已隐藏

  // ===========================================================
  //  布局计算
  // ===========================================================

  /** 计算时间轴总宽度 */
  function getTrackWidth() {
    return Math.max(
      window.innerWidth,
      currentMessages.length * LAYOUT.CARD_SPACING + LAYOUT.TRACK_PADDING * 2
    );
  }

  /** 获取最大可滚动偏移 */
  function getMaxScroll() {
    return Math.max(0, getTrackWidth() - window.innerWidth);
  }

  /**
   * 获取当前滚动进度 (0~1)
   * 供外部模块（如季节系统）调用
   */
  function getScrollProgress() {
    const max = getMaxScroll();
    return max > 0 ? Math.min(1, Math.max(0, scrollOffset / max)) : 0;
  }

  // ===========================================================
  //  DOM 渲染
  // ===========================================================

  /**
   * HTML 转义，防止 XSS 注入
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * 格式化日期为 YYYY.MM.DD
   * @param {string} isoStr - ISO 格式时间字符串
   * @returns {string}
   */
  function formatDate(isoStr) {
    const d = new Date(isoStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }

  /**
   * 渲染所有留言卡片到时间轴
   * @param {Array} messages - 按时间排序的留言数组
   */
  function render(messages) {
    currentMessages = messages;

    const viewport = document.getElementById('timeline-viewport');
    const track = document.getElementById('timeline-track');
    const base = document.getElementById('obelisk-base');
    const emptyState = document.getElementById('empty-state');

    if (!viewport || !track) return;

    // 清除旧的动态元素
    viewport.querySelectorAll('.message-card, .card-connector, .timeline-tick')
      .forEach(el => el.remove());

    // 空状态处理
    if (emptyState) {
      emptyState.style.display = messages.length === 0 ? 'block' : 'none';
    }

    // 设置轨道和基座宽度
    const trackWidth = getTrackWidth();
    track.style.width = trackWidth + 'px';
    if (base) base.style.width = trackWidth + 'px';

    // 逐条渲染
    messages.forEach((msg, index) => {
      const x = LAYOUT.TRACK_PADDING + index * LAYOUT.CARD_SPACING;

      // 卡片上下交错排列（三段循环），营造视觉韵律
      const yOffset = [0, LAYOUT.CARD_VERTICAL_RANGE * 0.5, LAYOUT.CARD_VERTICAL_RANGE][index % 3];
      const cardBottom = LAYOUT.CARD_BASE_BOTTOM + yOffset;

      // 根据卡片在时间轴上的位置计算其所属季节色彩
      const cardProgress = messages.length > 1 ? index / (messages.length - 1) : 0;
      const { from, to, blend } = Seasons.getSeasonBlend(cardProgress);
      const colFrom = SEASON_PALETTE[from];
      const colTo = SEASON_PALETTE[to];
      const cardBg = Seasons.lerpColor(colFrom.cardBg, colTo.cardBg, blend);
      const cardText = Seasons.lerpColor(colFrom.accent, colTo.accent, blend);

      // ---- 连接线：卡片 → 时间轴 ----
      const connector = document.createElement('div');
      connector.className = 'card-connector';
      connector.style.left = (x + LAYOUT.CARD_WIDTH / 2) + 'px';
      connector.style.bottom = '80px';
      connector.style.height = (cardBottom - 84) + 'px';
      viewport.appendChild(connector);

      // ---- 时间刻度 ----
      const tick = document.createElement('div');
      tick.className = 'timeline-tick';
      tick.style.left = (x + LAYOUT.CARD_WIDTH / 2) + 'px';
      tick.innerHTML = `
        <div class="tick-line"></div>
        <div class="tick-label">${formatDate(msg.timestamp)}</div>
      `;
      viewport.appendChild(tick);

      // ---- 留言卡片 ----
      const card = document.createElement('div');
      card.className = 'message-card';
      card.style.left = x + 'px';
      card.style.bottom = cardBottom + 'px';
      // 带透明度的季节色背景
      card.style.background = cardBg.replace('rgb', 'rgba').replace(')', ',0.82)');
      card.style.color = cardText;
      card.style.animationDelay = (index * 0.05) + 's';

      card.innerHTML = `
        <div class="card-content">${escapeHtml(msg.content)}</div>
        <div class="card-meta">
          <span class="fingerprint-icon">🔒 ${msg.fingerprint.substring(0, 6)}…</span>
          <span>${msg.semester}</span>
        </div>
      `;
      viewport.appendChild(card);
    });
  }

  // ===========================================================
  //  滚动控制
  // ===========================================================

  /** 将当前偏移量应用到 DOM */
  function applyScroll() {
    const viewport = document.getElementById('timeline-viewport');
    if (!viewport) return;

    // 限制滚动范围
    scrollOffset = Math.max(0, Math.min(scrollOffset, getMaxScroll()));

    // GPU 加速的 transform 位移
    viewport.style.transform = `translateX(${-scrollOffset}px)`;

    // 同步进度条
    const fill = document.getElementById('progress-bar-fill');
    if (fill) {
      fill.style.width = (getScrollProgress() * 100) + '%';
    }

    // 同步季节背景
    Seasons.updateBackground(getScrollProgress());

    // 首次滚动后隐藏引导提示
    if (!scrollHintHidden && scrollOffset > 50) {
      scrollHintHidden = true;
      const hint = document.getElementById('scroll-hint');
      if (hint) hint.classList.add('hidden');
    }
  }

  /** 滚动到最右端（最新留言处） */
  function scrollToEnd() {
    scrollOffset = getMaxScroll();
    applyScroll();
  }

  // ===========================================================
  //  交互事件绑定
  // ===========================================================

  function setupInteractions() {
    const app = document.getElementById('app');
    if (!app) return;

    // ---- 鼠标拖拽 ----
    app.addEventListener('mousedown', (e) => {
      // 不干扰按钮、输入框、弹窗等交互元素
      if (e.target.closest('#modal-overlay, button, textarea, input, .admin-btn')) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartOffset = scrollOffset;
      app.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      scrollOffset = dragStartOffset + (dragStartX - e.clientX);
      applyScroll();
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        const appEl = document.getElementById('app');
        if (appEl) appEl.style.cursor = 'grab';
      }
    });

    // ---- 触摸滑动（移动端） ----
    app.addEventListener('touchstart', (e) => {
      if (e.target.closest('#modal-overlay, button, textarea, input')) return;
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartOffset = scrollOffset;
    }, { passive: true });

    app.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      scrollOffset = dragStartOffset + (dragStartX - e.touches[0].clientX);
      applyScroll();
    }, { passive: true });

    app.addEventListener('touchend', () => { isDragging = false; });

    // ---- 滚轮 → 映射为水平滚动 ----
    app.addEventListener('wheel', (e) => {
      e.preventDefault();
      scrollOffset += e.deltaY * 1.2;
      applyScroll();
    }, { passive: false });
  }

  // ---- 公开 API ----
  return Object.freeze({
    render,
    setupInteractions,
    getScrollProgress,
    scrollToEnd,
    applyScroll,
  });
})();
