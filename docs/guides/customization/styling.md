---
tags:
  - 定制化
  - CSS
  - 开发
  - 贡献指南
---

# 自定义样式 (CSS) 指南

欢迎来到 `CS for NCU` 的样式定制指南！🎉 本文档将详细阐述我们项目的 `CSS` 架构，解释其设计哲学，并提供清晰的实战演练，指导你如何安全、高效地修改或扩展网站的视觉样式。

!!! declaration "设计哲学：为何如此设计？"
    我们设计的 `CSS` 架构遵循两大核心原则：**模块化 (Modularity)** 与 **可维护性 (Maintainability)**。我们深知，一个混乱的样式表是项目长期发展的噩梦。因此，我们放弃了将所有代码堆砌在单一文件中的做法，转而采用了一套分工明确、易于理解的文件结构。

---

## 1. 文件结构详解

我们的所有自定义样式都存放在 `docs/css/` 目录下。这套结构的核心是**职责分离**：每个文件只做一件事。

| 文件名 | 核心职责 | 修改时机 |
| :--- | :--- | :--- |
| `extra.css` | **主入口文件** | **几乎从不修改。** 它的唯一作用是按顺序 `@import` 其他所有 `CSS` 模块。 |
| `00-variables.css` | **设计变量 (Design Tokens)** | 当你需要**调整全局配色方案**（如主色、强调色、背景色）时。 |
| `01-layout.css` | **布局样式 (Layout)** | 当你需要修改**网站结构元素**（如导航栏、目录、页眉）的样式时。 |
| `02-components.css` | **组件样式 (Components)** | 当你需要修改**通用 UI 元素**（如链接、表格、常规按钮）的样式时。 |
| `03-admonitions.css` | **提示框样式 (Admonitions)** | 当你需要**修改或新增自定义提示框**类型时。 |
| `99-fixes.css` | **问题修复 (Fixes)** | 当遇到需要**强制覆盖**的特定样式问题（通常需要 `!important`）时。 |

!!! reminder "为何使用数字前缀？"
    使用 `00-`, `01-` 这样的数字前缀，是为了**强制规定文件的加载顺序**，并让这种顺序在文件浏览器中一目了然。这比单纯的字母排序更可靠，直观地传达了“00 号最先，99 号最后”的依赖关系。

---

## 2. 实战演练：如何修改样式 🎨

???+ "点击查看三种常见的修改场景"

    === "场景一：我想改变网站的主题色"

        这是一个最常见的需求。

        1.  **定位文件**：打开 `docs/css/00-variables.css`。这是我们存放所有颜色变量的“调色板”。
        2.  **找到变量**：找到你希望修改的颜色方案，比如日间模式 `[data-md-color-scheme="default"]`。
        3.  **修改值**：修改对应的 `CSS` 变量值。例如，想把主背景色变得更深：
            ```css hl_lines="3"
            /* 00-variables.css */
            [data-md-color-scheme="default"] {
              --md-primary-bg-color: #003366; /* 从 #112D4E 修改为更深的海军蓝 */
              /* ... 其他颜色变量 ... */
            }
            ```
        4.  **保存并预览**：保存文件，`mkdocs serve` 会自动重新加载，你就能在浏览器中看到新的主题色了。

    === "场景二：我想让所有引用块 `>` 都有左侧边框"

        这是一个新增组件样式的需求。

        1.  **定位文件**：打开 `docs/css/02-components.css`。因为 `blockquote`（引用块）是一个通用的内容组件。
        2.  **添加新规则**：在文件末尾添加新的 `CSS` 规则。
            ```css
            /* 02-components.css */

            /* --- 引用块样式 --- */
            .md-typeset blockquote {
              border-left: 4px solid var(--md-accent-fg-color);
              background-color: rgba(0, 0, 0, 0.02);
              padding-left: 1rem;
            }
            ```
            💡 **小技巧**：我们在这里使用了 `--md-accent-fg-color` 这个全局变量，确保了引用块的边框颜色能跟随主题的强调色自动变化，非常智能！

    === "场景三：我想新增一个“待办事项”提示框"

        这是一个高级定制，完美展示了我们架构的扩展性。

        1.  **定位文件**：打开 `docs/css/03-admonitions.css`。所有与提示框相关的都在这里。
        2.  **遵循“配方”**:
            *   **第一步：准备材料**
                *   **起名**: `todo`
                *   **找图标**: 在 [Tabler Icons](https://tabler.io/icons) 找到 `checklist` 图标并转换成 Data URI。
                *   **选颜色**: 标题栏背景用淡绿色，图标用深绿色。
            *   **第二步：修改 CSS**
                1.  在 `03-admonitions.css` 文件顶部的 `:root` 中，添加新的图标变量。
                2.  在文件末尾，复制一个现有的类型块（比如 `author` 的），将其所有相关部分改为 `todo`，并填上新颜色。

        ??? "点击查看完整的“配方”代码"
            ```css
            /* 03-admonitions.css */

            /* 1. 在 :root 中添加新图标 */
            :root {
              /* ... 其他图标 ... */
              --md-admonition-icon--todo: url('data:image/svg+xml,...'); /* 粘贴转换后的 SVG */
            }

            /* ... 其他类型 ... */

            /* 2. 在文件末尾添加新类型定义 */
            /* --- 自定义类型：todo (待办事项) --- */
            .md-typeset .admonition.todo,
            .md-typeset details.todo {
              background-color: var(--md-admonition-bg-color);
            }
            .md-typeset .todo > .admonition-title,
            .md-typeset .todo > summary {
              background-color: rgba(22, 163, 74, 0.15);
            }
            .md-typeset .todo > .admonition-title::before,
            .md-typeset .todo > summary::before {
              background-color: #16A34A;
              -webkit-mask-image: var(--md-admonition-icon--todo);
                      mask-image: var(--md-admonition-icon--todo);
            }
            ```

---

## 3. 注释规范

一份好的样式表，其注释和代码同等重要。

**核心原则**：注释应当解释“**为什么**”这么做，而不仅仅是“**是什么**”。

#### 块级注释 (文件头与重要部分)

我们采用 JSDoc 风格的块级注释来描述文件和重要代码块。

```css
/**
 * @file        [文件名]
 * @description [一句话描述这个文件的作用]
 * @summary
 *   [更详细的说明，可以分点。解释设计思路、注意事项等。]
 * @version     [版本号，可选]
 */
```

#### 行内/区域注释

对于具体的规则，使用标准的 `/* ... */` 注释来解释其目的。

```css
/*
 * 修复：仓库链接在 :visited 状态下颜色错误。
 * 问题：浏览器默认样式会覆盖主题颜色。
 * 解决：使用 !important 强制覆盖。
 */
.md-source:visited .md-source__repository {
  color: var(--md-primary-fg-color) !important;
}
```

---

> 通过这套精心设计的 `CSS` 架构和规范，我们希望为 `CS for NCU` 项目的长期发展和协作，打下坚实而优雅的基础。感谢你的贡献！🙏