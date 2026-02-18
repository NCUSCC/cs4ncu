# 里程碑留言墙 (Milestone)

> 在时间的方尖碑上，刻下你的铭文。

## 模块概述

这是一个**完全独立**的纯前端留言墙模块，以水平滚动的时间线形式呈现，滚动时伴随春夏秋冬的背景与粒子特效变化。它不依赖项目主站的任何 CSS 或 JS，可以安全地放入 `docs/` 目录而不影响 MkDocs 构建流程。

## 目录结构

```
docs/milestone/
├── index.html              # 主入口 HTML（纯骨架，无内联样式/脚本）
├── css/
│   └── milestone.css       # 完整样式表（遵循项目 CSS 架构哲学）
├── js/
│   ├── config.js           # 全局配置常量（布局参数、学期规则、调色板等）
│   ├── fingerprint.js      # 匿名机器指纹生成（Canvas + WebGL + 设备特征）
│   ├── seasons.js          # 四季系统（背景渐变 + 粒子特效）
│   ├── storage.js          # 数据存储层（远程 CSV fetch + localStorage）
│   ├── timeline.js         # 水平时间轴引擎（卡片渲染 + 拖拽/滚轮交互）
│   ├── modal.js            # 留言弹窗（输入验证 + 频率限制）
│   └── app.js              # 主入口（编排初始化 + 顶层事件绑定）
├── data/
│   └── messages.csv        # 共享留言数据（部署后可被 fetch 读取）
└── README.md               # 本文件
```

### JS 加载顺序（必须严格遵守）

```
config.js → fingerprint.js → seasons.js → storage.js → timeline.js → modal.js → app.js
```

每个模块通过 IIFE + `Object.freeze` 暴露为全局常量，形成清晰的依赖链。

## 数据存储策略

采用 **「远程 CSV + 本地 localStorage」** 混合方案：

| 操作     | 数据源                | 说明                                         |
| :------- | :-------------------- | :------------------------------------------- |
| **读取** | `data/messages.csv`   | 仓库中的 CSV 文件，通过 `fetch()` 加载共享留言 |
| **读取** | `localStorage`        | 浏览器本地存储，保存当前访客的新增留言         |
| **写入** | `localStorage`        | 新留言实时写入浏览器本地                       |
| **持久化** | 手动 CSV 导入/导出  | 管理员导出 → 提交到仓库 → 所有访客可见         |

### 管理员工作流

```
1. 打开里程碑页面
2. 点击右上角「导出 CSV」→ 下载 CSV 文件
3. 将下载的 CSV 重命名为 messages.csv
4. 替换项目中的 docs/milestone/data/messages.csv
5. 提交 PR 并合并到 main → 自动部署 → 所有访客可见新留言
```

## 核心特性

### 匿名指纹系统

通过 Canvas 渲染差异 + WebGL 渲染器信息 + 屏幕/设备参数，生成 SHA-256 哈希的前 16 位作为匿名标识。不采集 IP、Cookie 或任何可直接识别个人身份的信息。

### 学期频率限制

- **春季学期**：1–6 月
- **秋季学期**：7–12 月
- 每个指纹每学期限留言一次，限制记录存储在 `localStorage`

### 四季视觉系统

滚动时间线时背景在四季之间平滑过渡：

| 季节 | 色调       | 粒子效果       |
| :--- | :--------- | :------------- |
| 春   | 嫩绿       | 粉色花瓣飘落   |
| 夏   | 暖金       | 萤火虫明灭闪烁 |
| 秋   | 橙红       | 落叶飘零       |
| 冬   | 冰蓝       | 雪花轻落       |

## 部署

将整个 `milestone/` 目录放入 `docs/` 下即可：

```bash
# 从项目根目录
cp -r milestone/ docs/milestone/
```

MkDocs 构建时，非 `.md` 文件会被原样复制到输出目录。部署后访问地址：

```
https://cs4ncu.space/milestone/
```

> **注意**：此页面不会出现在 MkDocs 的导航栏中（因为它不是 `.md` 文件）。如需从主站导航到此页面，可在任意 `.md` 文件中添加链接：`[里程碑](../milestone/index.html)`

## 本地开发预览

```bash
# 方式一：直接用浏览器打开
open docs/milestone/index.html

# 方式二：启动本地服务器（推荐，确保 CSV fetch 正常）
cd docs/milestone && python -m http.server 8080
# 然后访问 http://localhost:8080

# 方式三：通过 MkDocs
mkdocs serve
# 访问 http://127.0.0.1:8000/milestone/
```
