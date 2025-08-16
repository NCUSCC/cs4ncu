---
tags:
  - Topic-CSS
  - Type-Guide
  - Level-Intermediate
  - Action-Building
  - Context-Project
---

# CSS 架构设计指南

本文档详细说明了 `CS for NCU` 项目的自定义 CSS 体系，旨在帮助任何贡献者快速理解、定位并修改网站的视觉样式。

我们的 CSS 架构设计的核心哲学是：**模块化、可维护性与职责分离**。我们坚决避免将所有样式代码堆砌在单一的巨大文件中。

---

## 体系概览：三位一体的协作模式

我们的样式系统由三个核心部分协同工作，共同构成了项目的视觉基础：

1.  **`mkdocs.yml`（配置文件）**：作为“**总开关**”，它告诉 MkDocs 我们的自定义样式入口在哪里，并激活日夜间模式的自定义颜色方案。
2.  **`css/extra.css`（主入口文件）**：作为“**调度中心**”，它本身不包含任何样式规则，唯一的职责是按预设的顺序，加载所有模块化的 CSS 文件。
3.  **`css/*.css`（模块化文件）**：作为“**功能模块**”，每个文件都承载着特定的样式职责（如变量、布局、组件等），是实际编写代码的地方。

---

## 1. 总开关：`mkdocs.yml` 的配置

一切始于 `mkdocs.yml`。我们需要在这里进行两项关键配置：

### a. 链接主入口文件

我们通过 `extra_css` 字段，告诉 MkDocs 加载我们的“调度中心”。

```yaml title="mkdocs.yml"
extra_css:
  - 'css/extra.css'
```

### b. 激活自定义调色板

为了让主题听从我们 CSS 文件中的颜色定义，必须将 `palette` 中的 `primary` 和 `accent` 设置为 `custom`。这相当于告诉主题：“放弃你的内置颜色，使用我自定义的方案”。

```yaml title="mkdocs.yml"
theme:
  palette:
    # 日间模式
    - scheme: default
      primary: custom  # <-- 激活自定义颜色
      accent: custom   # <-- 激活自定义颜色
      toggle:
        icon: material/brightness-7
        name: 切换到夜间模式

    # 夜间模式
    - scheme: slate
      primary: custom  # <-- 激活自定义颜色
      accent: custom   # <-- 激活自定义颜色
      toggle:
        icon: material/brightness-4
        name: 切换到日间模式
```

---

## 2. 调度中心：`css/extra.css` 的作用

这个文件是整个 CSS 架构的心脏，但它非常简洁。它的唯一任务就是**按顺序导入**所有功能模块。

```css title="css/extra.css"
/**
 * @file        extra.css
 * @description 主自定义样式表入口 (Main Custom Stylesheet Entrypoint)。
 * @author      南昌大学超算俱乐部 (NCUSCC)
 * @version     2.0.0
 *
 * @summary
 *   此文件作为所有自定义 CSS 模块的加载器。
 *   请不要在此文件中直接编写样式规则，应将规则添加到对应的模块化文件中。
 *   加载顺序经过精心设计，以确保正确的样式覆盖和依赖关系。
 */

@import "00-variables.css";    /* 核心：定义全局颜色、字体等设计变量 */
@import "01-layout.css";       /* 结构：定义网站主要布局元素的样式 */
@import "02-components.css";   /* 组件：定义通用 UI 组件的样式 */
@import "03-admonitions.css";  /* 插件：定义 admonition (提示框) 等插件的特定样式 */
@import "99-fixes.css";        /* 修复：包含高优先级的样式，用于修正或覆盖特定问题 */
```

!!! alert "请注意"
    **永远不要**直接在 `extra.css` 文件中编写样式。请将你的代码添加到下面描述的相应模块中。

---

## 3. 功能模块：职责分离的文件

我们通过数字前缀来强制规定文件的加载顺序，确保依赖关系正确（例如，变量必须在所有其他文件之前加载）。

| 文件名 | 核心职责 | 应该在这里做什么？ |
| :--- | :--- | :--- |
| **`00-variables.css`** | **设计变量（Design Tokens）** | 定义所有全局 CSS 变量，如颜色、字体、圆角大小等。**这是实现一键换肤的核心。** |
| **`01-layout.css`** | **布局（Layout）** | 编写影响网站整体结构的样式，例如页头（`header`）、侧边栏（`sidebar`）、页脚（`footer`）。 |
| **`02-components.css`** | **组件（Components）** | 定义可复用的通用 UI 元素样式，如链接（`a`）、表格（`table`）、代码块（`code`）。 |
| **`03-admonitions.css`** | **插件样式（Plugins）** | 专门存放针对特定插件的深度定制样式，目前主要是提示框（`admonition`）。 |
| **`99-fixes.css`** | **修复与覆盖（Fixes & Overrides）** | 存放那些用于修复特定 Bug 或强制覆盖主题默认样式的“补丁”代码。高优先级。 |

### 日夜间模式的实现

我们的日夜间模式完全由 `00-variables.css` 文件控制。我们使用 `[data-md-color-scheme]` 属性选择器来为两种模式定义不同的变量值。

??? example "点击查看 `00-variables.css` 中的日夜间模式实现"
    ```css title="css/00-variables.css"
    /* 日间模式 (默认) */
    [data-md-color-scheme="default"] {
      --md-primary-fg-color:        #005BAC; /* 主前景色 (深蓝) */
      --md-default-bg-color:        #FFFFFF; /* 默认背景色 (白) */
      /* ... 其他日间模式变量 ... */
    }

    /* 夜间模式 */
    [data-md-color-scheme="slate"] {
      --md-primary-fg-color:        #90C8FF; /* 主前景色 (亮蓝) */
      --md-default-bg-color:        #121212; /* 默认背景色 (深灰) */
      /* ... 其他夜间模式变量 ... */
    }
    ```
    当用户切换模式时，`<html>` 标签上的 `data-md-color-scheme` 属性值会从 `default` 变为 `slate`，从而自动应用第二套变量，实现主题切换。

---

## 如何贡献样式？

**场景**：你想修改网站中所有链接在夜间模式下的颜色。

1.  **定位文件**：链接属于“组件”，但它的颜色由“变量”控制。所以，你应该打开 `css/00-variables.css`。
2.  **找到变量**：在文件中找到控制链接颜色的变量，例如 `--md-accent-fg-color`。
3.  **修改代码**：在 `[data-md-color-scheme="slate"]` 规则块内，修改或添加该变量的值。
4.  **预览**：运行 `mkdocs serve`，切换到夜间模式，查看你的修改是否生效。

这套架构旨在让样式贡献变得简单、直观且不易出错。
