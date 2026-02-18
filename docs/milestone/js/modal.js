/**
 * @file        modal.js
 * @description 里程碑模块 — 留言弹窗（模态框）
 *
 * @summary
 *   管理"刻下铭文"弹窗的全部交互：
 *   - 打开 / 关闭动画
 *   - 字数统计与实时验证
 *   - 提交留言（写入 Storage → 刷新 Timeline）
 *   - 留言频率检查（每学期一次）
 *
 * @depends     config.js      (MilestoneConfig)
 *              storage.js     (Storage)
 *              timeline.js    (Timeline)
 * @exports     Modal.open(fingerprint)
 *              Modal.close()
 *              Modal.setupListeners(fingerprint, onSubmitDone)
 *
 * @author      NCUSCC & Community Contributors
 * @version     2.0.0
 */

const Modal = (() => {
  'use strict';

  const { MESSAGE } = MilestoneConfig;

  // ---- DOM 元素引用（惰性获取） ----
  const el = {
    get overlay()  { return document.getElementById('modal-overlay'); },
    get input()    { return document.getElementById('msg-input'); },
    get counter()  { return document.getElementById('char-count'); },
    get submitBtn(){ return document.getElementById('submit-btn'); },
    get fpDisplay(){ return document.getElementById('fp-display'); },
  };

  // ---- 内部状态 ----
  let currentFingerprint = '';
  let onSubmitCallback = null;  // 提交成功后的外部回调

  // ===========================================================
  //  打开 / 关闭
  // ===========================================================

  /**
   * 打开留言弹窗
   * @param {string} fingerprint - 当前访客的匿名指纹
   * @returns {boolean} 是否成功打开（可能因频率限制而失败）
   */
  function open(fingerprint) {
    currentFingerprint = fingerprint;

    // 频率检查
    if (Storage.hasPosted(fingerprint)) {
      return false;  // 由调用方负责提示用户
    }

    // 重置表单状态
    if (el.input) el.input.value = '';
    if (el.counter) {
      el.counter.textContent = `0 / ${MESSAGE.MAX_LENGTH}`;
      el.counter.classList.remove('warn');
    }
    if (el.submitBtn) el.submitBtn.disabled = true;
    if (el.fpDisplay) el.fpDisplay.textContent = fingerprint;

    // 显示弹窗
    if (el.overlay) el.overlay.classList.add('visible');

    // 自动聚焦输入框
    setTimeout(() => { if (el.input) el.input.focus(); }, 300);

    return true;
  }

  /** 关闭留言弹窗 */
  function close() {
    if (el.overlay) el.overlay.classList.remove('visible');
  }

  // ===========================================================
  //  输入验证
  // ===========================================================

  /** 实时更新字数统计和提交按钮状态 */
  function handleInput() {
    const len = el.input ? el.input.value.length : 0;

    if (el.counter) {
      el.counter.textContent = `${len} / ${MESSAGE.MAX_LENGTH}`;
      el.counter.classList.toggle('warn', len > MESSAGE.WARN_THRESHOLD);
    }

    if (el.submitBtn) {
      el.submitBtn.disabled = (len === 0 || len > MESSAGE.MAX_LENGTH);
    }
  }

  // ===========================================================
  //  提交
  // ===========================================================

  /** 提交留言 */
  function handleSubmit() {
    if (!el.input) return;

    const content = el.input.value.trim();
    if (!content || content.length > MESSAGE.MAX_LENGTH) return;

    // 二次频率检查（防御并发提交）
    if (Storage.hasPosted(currentFingerprint)) {
      close();
      return;
    }

    // 构造留言对象
    const msg = {
      fingerprint: currentFingerprint,
      content,
      timestamp: new Date().toISOString(),
      semester: Storage.getCurrentSemester(),
    };

    // 写入存储并标记已留言
    Storage.addMessage(msg);
    Storage.markPosted(currentFingerprint);

    // 关闭弹窗
    close();

    // 通知外部刷新
    if (typeof onSubmitCallback === 'function') {
      onSubmitCallback(msg);
    }
  }

  // ===========================================================
  //  事件绑定
  // ===========================================================

  /**
   * 一次性设置弹窗相关的所有事件监听
   * @param {string}   fingerprint  - 访客指纹
   * @param {Function} onSubmitDone - 提交成功后的回调 (msg) => void
   */
  function setupListeners(fingerprint, onSubmitDone) {
    currentFingerprint = fingerprint;
    onSubmitCallback = onSubmitDone;

    // 输入框字数统计
    if (el.input) {
      el.input.addEventListener('input', handleInput);
    }

    // 提交按钮
    if (el.submitBtn) {
      el.submitBtn.addEventListener('click', handleSubmit);
    }

    // 取消按钮
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', close);
    }

    // 点击遮罩层关闭
    if (el.overlay) {
      el.overlay.addEventListener('click', (e) => {
        if (e.target === el.overlay) close();
      });
    }

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  // ---- 公开 API ----
  return Object.freeze({
    open,
    close,
    setupListeners,
  });
})();
