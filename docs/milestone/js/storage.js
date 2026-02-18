/**
 * @file        storage.js
 * @description 里程碑模块 — 数据存储层
 *
 * @summary
 *   采用「远程 CSV + 本地 localStorage」混合存储策略：
 *
 *   读取流程：
 *     1. 从 GitHub Pages 上的 data/messages.csv fetch 共享留言
 *     2. 从 localStorage 读取本地新增留言
 *     3. 合并去重，按时间排序
 *
 *   写入流程：
 *     新留言写入 localStorage（纯前端，无需后端）
 *
 *   管理员工作流：
 *     导出 CSV → 提交到仓库 data/messages.csv → 所有访客可见
 *
 * @depends     config.js (MilestoneConfig)
 * @exports     Storage.loadAll()            → Promise<Array>
 *              Storage.saveLocal(messages)   → void
 *              Storage.addMessage(msg)       → void
 *              Storage.exportCSV(messages)   → void
 *              Storage.importCSV(event, cb)  → void
 *              Storage.getCurrentSemester()  → string
 *              Storage.hasPosted(fp)         → boolean
 *              Storage.markPosted(fp)        → void
 *
 * @author      NCUSCC & Community Contributors
 * @version     2.0.0
 */

const Storage = (() => {
  'use strict';

  const { STORAGE_KEYS, CSV, SEMESTER } = MilestoneConfig;

  // ===========================================================
  //  学期工具
  // ===========================================================

  /**
   * 获取当前学期标识
   * @returns {string} 格式为 "2025-春季" 或 "2025-秋季"
   */
  function getCurrentSemester() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const label = SEMESTER.SPRING_MONTHS.includes(month)
      ? SEMESTER.SPRING_LABEL
      : SEMESTER.AUTUMN_LABEL;
    return `${year}-${label}`;
  }

  /**
   * 检查指定指纹在本学期是否已留言
   * @param   {string} fingerprint
   * @returns {boolean}
   */
  function hasPosted(fingerprint) {
    const key = STORAGE_KEYS.SEMESTER_PREFIX + getCurrentSemester();
    const posted = JSON.parse(localStorage.getItem(key) || '[]');
    return posted.includes(fingerprint);
  }

  /**
   * 记录指定指纹在本学期已留言
   * @param {string} fingerprint
   */
  function markPosted(fingerprint) {
    const key = STORAGE_KEYS.SEMESTER_PREFIX + getCurrentSemester();
    const posted = JSON.parse(localStorage.getItem(key) || '[]');
    if (!posted.includes(fingerprint)) {
      posted.push(fingerprint);
      localStorage.setItem(key, JSON.stringify(posted));
    }
  }

  // ===========================================================
  //  localStorage 操作
  // ===========================================================

  /** 从 localStorage 读取本地留言 */
  function loadLocal() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('[Storage] localStorage 读取失败:', e);
      return [];
    }
  }

  /**
   * 保存留言数组到 localStorage
   * @param {Array} messages - 仅保存本地新增的留言
   */
  function saveLocal(messages) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }

  /**
   * 新增一条留言到 localStorage
   * @param {Object} msg - { fingerprint, content, timestamp, semester }
   */
  function addMessage(msg) {
    const local = loadLocal();
    local.push(msg);
    saveLocal(local);
  }

  // ===========================================================
  //  远程 CSV 读取
  // ===========================================================

  /**
   * 解析 CSV 文本为留言对象数组
   * CSV 格式：序号,匿名指纹,留言内容,时间戳,学期
   *
   * @param   {string} text - CSV 原始文本
   * @returns {Array}  解析后的留言数组
   */
  function parseCSV(text) {
    const results = [];
    const lines = text.split('\n').filter(l => l.trim());

    // 跳过 BOM 和表头
    const startIdx = lines.findIndex(l => /^\d+,/.test(l.replace(/^\uFEFF/, '')));
    if (startIdx === -1) return results;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].replace(/^\uFEFF/, '');

      // 正则匹配 CSV 行：支持双引号包裹的内容字段
      const match = line.match(/^(\d+),([^,]+),("(?:[^"]|"")*"|[^,]*),([^,]+),(.+)$/);
      if (match) {
        let content = match[3].trim();
        // 去除包裹的双引号并还原转义
        if (content.startsWith('"') && content.endsWith('"')) {
          content = content.slice(1, -1).replace(/""/g, '"');
        }

        results.push({
          fingerprint: match[2].trim(),
          content,
          timestamp: match[4].trim(),
          semester: match[5].trim(),
        });
      }
    }

    return results;
  }

  /**
   * 从 GitHub Pages fetch 远程 CSV
   * 如果 fetch 失败（如 404 或离线），静默降级为空数组
   * @returns {Promise<Array>}
   */
  async function fetchRemoteCSV() {
    try {
      const response = await fetch(CSV.REMOTE_PATH, {
        cache: 'no-cache',  // 确保获取最新版本
      });

      if (!response.ok) {
        // 404 是正常的（CSV 文件尚未创建时）
        if (response.status !== 404) {
          console.warn(`[Storage] CSV fetch 失败: HTTP ${response.status}`);
        }
        return [];
      }

      const text = await response.text();
      return parseCSV(text);
    } catch (e) {
      // 网络错误或离线模式，静默降级
      console.warn('[Storage] 无法加载远程 CSV（可能离线或文件不存在）:', e.message);
      return [];
    }
  }

  // ===========================================================
  //  合并加载（远程 CSV + localStorage）
  // ===========================================================

  /**
   * 加载所有留言：合并远程 CSV 与本地数据，去重后按时间排序
   * 去重规则：同一 fingerprint + timestamp 视为同一条留言
   * @returns {Promise<Array>}
   */
  async function loadAll() {
    const [remoteMsgs, localMsgs] = await Promise.all([
      fetchRemoteCSV(),
      Promise.resolve(loadLocal()),
    ]);

    // 以 "fingerprint|timestamp" 为键进行去重
    const seen = new Set();
    const merged = [];

    // 远程数据优先（它代表已提交到仓库的 "官方" 数据）
    for (const msg of remoteMsgs) {
      const key = `${msg.fingerprint}|${msg.timestamp}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(msg);
      }
    }

    // 再合并本地新增
    for (const msg of localMsgs) {
      const key = `${msg.fingerprint}|${msg.timestamp}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(msg);
      }
    }

    // 按时间正序排列
    merged.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return merged;
  }

  // ===========================================================
  //  CSV 导出（管理员用）
  // ===========================================================

  /**
   * 将留言数组导出为 CSV 文件并触发浏览器下载
   * @param {Array} messages - 待导出的留言数组
   */
  function exportCSV(messages) {
    if (!messages || messages.length === 0) return false;

    // BOM 头确保 Excel 正确识别 UTF-8 中文
    let csv = '\uFEFF序号,匿名指纹,留言内容,时间戳,学期\n';

    messages.forEach((msg, i) => {
      // 双引号转义
      const content = '"' + (msg.content || '').replace(/"/g, '""') + '"';
      csv += `${i + 1},${msg.fingerprint},${content},${msg.timestamp},${msg.semester}\n`;
    });

    // 创建 Blob 并触发下载
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `${CSV.EXPORT_FILENAME_PREFIX}_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    return true;
  }

  // ===========================================================
  //  CSV 导入（管理员用）
  // ===========================================================

  /**
   * 从文件导入 CSV 并与现有数据合并
   * @param {Event}    event    - file input 的 change 事件
   * @param {Function} callback - 导入完成后的回调 (importedCount, allMessages)
   */
  function importCSV(event, callback) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const imported = parseCSV(e.target.result);
        const local = loadLocal();

        // 去重合并
        const existingSet = new Set(local.map(m => `${m.fingerprint}|${m.timestamp}`));
        let count = 0;

        for (const msg of imported) {
          const key = `${msg.fingerprint}|${msg.timestamp}`;
          if (!existingSet.has(key)) {
            local.push(msg);
            existingSet.add(key);
            count++;
          }
        }

        // 排序并保存
        local.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        saveLocal(local);

        if (typeof callback === 'function') callback(count, local);
      } catch (err) {
        console.error('[Storage] CSV 导入失败:', err);
        if (typeof callback === 'function') callback(-1, []);
      }
    };

    reader.readAsText(file, 'utf-8');
    // 重置 input 以允许重复选择同一文件
    event.target.value = '';
  }

  // ---- 公开 API ----
  return Object.freeze({
    loadAll,
    loadLocal,
    saveLocal,
    addMessage,
    exportCSV,
    importCSV,
    parseCSV,
    getCurrentSemester,
    hasPosted,
    markPosted,
  });
})();
