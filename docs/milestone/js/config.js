/**
 * @file        config.js
 * @description 里程碑模块 — 全局配置常量
 *
 * @summary
 *   集中管理所有可调参数，包括时间轴布局、学期判定规则、
 *   存储键名、CSV 远程路径等。修改此文件即可调整全局行为，
 *   无需深入各业务模块。
 *
 * @author      NCUSCC & Community Contributors
 * @version     2.0.0
 */

const MilestoneConfig = (() => {
  'use strict';

  // ---- 时间轴布局参数 ----
  const LAYOUT = Object.freeze({
    CARD_SPACING: 280,          // 卡片之间的水平间距（px）
    TRACK_PADDING: 200,         // 时间轴两端的留白（px）
    CARD_BASE_BOTTOM: 110,      // 卡片底部距页面底部的最小高度（px）
    CARD_VERTICAL_RANGE: 250,   // 卡片上下交错的浮动范围（px）
    CARD_WIDTH: 220,            // 卡片默认宽度（px）
    CARD_WIDTH_MOBILE: 170,     // 移动端卡片宽度（px）
  });

  // ---- 学期判定规则 ----
  const SEMESTER = Object.freeze({
    /**
     * 学期划分方式：
     *   1–6 月  → 春季学期
     *   7–12 月 → 秋季学期
     */
    SPRING_MONTHS: [1, 2, 3, 4, 5, 6],
    AUTUMN_MONTHS: [7, 8, 9, 10, 11, 12],
    SPRING_LABEL: '春季',
    AUTUMN_LABEL: '秋季',
  });

  // ---- 存储键名 ----
  const STORAGE_KEYS = Object.freeze({
    MESSAGES: 'milestone_messages',           // localStorage 中留言数据的键
    SEMESTER_PREFIX: 'milestone_semester_',    // 学期频率限制键前缀
  });

  // ---- CSV 远程路径 ----
  // MkDocs 构建后，docs/milestone/data/messages.csv
  // 会被部署到 {site_url}/milestone/data/messages.csv
  const CSV = Object.freeze({
    REMOTE_PATH: './data/messages.csv',       // 相对于 index.html 的路径
    EXPORT_FILENAME_PREFIX: '里程碑留言',      // 导出文件名前缀
  });

  // ---- 粒子系统 ----
  const PARTICLES = Object.freeze({
    COUNT: 40,                  // 目标粒子数量
    SEASON_SWITCH_RATE: 0.02,   // 季节切换时粒子重置概率（每帧）
  });

  // ---- 留言字数限制 ----
  const MESSAGE = Object.freeze({
    MAX_LENGTH: 200,            // 最大字数
    WARN_THRESHOLD: 180,        // 字数警告阈值
  });

  // ---- 四季调色板 ----
  const SEASON_PALETTE = Object.freeze({
    spring: {
      bgStart: '#e8f5e9', bgEnd: '#c8e6c9',
      accent: '#66bb6a',  text: '#2e7d32',
      cardBg: '#e8f5e9',  name: '春',
    },
    summer: {
      bgStart: '#fff8e1', bgEnd: '#ffecb3',
      accent: '#ffb300',  text: '#e65100',
      cardBg: '#fff8e1',  name: '夏',
    },
    autumn: {
      bgStart: '#fbe9e7', bgEnd: '#ffccbc',
      accent: '#e64a19',  text: '#bf360c',
      cardBg: '#fbe9e7',  name: '秋',
    },
    winter: {
      bgStart: '#e3f2fd', bgEnd: '#bbdefb',
      accent: '#42a5f5',  text: '#1565c0',
      cardBg: '#e3f2fd',  name: '冬',
    },
  });

  // 按顺序排列的季节键，方便循环
  const SEASON_ORDER = Object.freeze(['spring', 'summer', 'autumn', 'winter']);

  // ---- 公开 API ----
  return Object.freeze({
    LAYOUT,
    SEMESTER,
    STORAGE_KEYS,
    CSV,
    PARTICLES,
    MESSAGE,
    SEASON_PALETTE,
    SEASON_ORDER,
  });
})();
