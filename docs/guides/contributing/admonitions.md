---
tags:
  - Topic-CSS
  - Topic-Markdown
  - Type-Tutorial
  - Level-Intermediate
  - Action-Writing
  - Context-Project
---
# 自定义提示框

本文档旨在清晰说明 `03-admonitions.css` 的设计思想，并提供修改和扩展的具体具体步骤。

## 核心设计哲学：一套结构，两套调色板

这个文件的设计极其优雅，其核心思想是**将结构与颜色彻底分离**。

!!! declaration "设计原则：结构与颜色分离"
    - **一套结构**：所有提示框（如边距、图标大小、标题栏高度）的**结构样式是全局共享的**。这意味着你只需要在一个地方修改，所有类型的提示框都会同步更新。
    - **两套调色板**：我们利用 CSS 变量，为**日间模式**和**夜间模式**分别定义了两套独立的颜色方案。当用户切换主题时，网站会自动应用对应的调色板，而无需加载任何额外的 CSS。

这种设计带来了极高的可维护性和代码复用率。

---

## 文件结构剖析

该文件严格按照以下三个部分组织，请务必遵循此结构：

1.  **`全局定义 (Global Definitions)`**
    - **内容**：存放所有**与颜色无关**的全局资源。
    - **当前用途**：定义所有自定义提示框的 **SVG 图标**。因为图标在日夜间模式下是共享的，所以在这里全局定义。

2.  **`颜色方案定义 (Color Scheme Definitions)`**
    - **内容**：**整个文件的心脏**。这里定义了所有提示框在两种模式下的颜色变量。
    - **实现方式**：
        - 使用 `[data-md-color-scheme="default"]` 选择器定义**日间模式**的颜色。
        - 使用 `[data-md-color-scheme="slate"]` 选择器定义**夜间模式**的颜色。

3.  **`样式应用 (Style Application)`**
    - **内容**：将前面定义的**变量应用到实际的 CSS 规则**中。
    - **特点**：这里的代码块像“模板”一样，只负责使用变量，不包含任何写死的颜色值。

---

## 维护与扩展指南

请根据你的意图，在文件的**指定区域**进行修改。

=== "场景一：修改提示框颜色"
    这是最常见的需求。例如，修改“危险”提示框在夜间模式下的颜色。

    1.  **定位**：滚动到文件的 **`2.2 夜间模式 (Slate Scheme)`** 部分。
    2.  **修改**：找到 `--admonition-danger-color` 和 `--admonition-danger-color-rgb` 这两个变量。
    3.  **操作**：直接修改它们的颜色值即可。所有使用这些变量的地方都会自动更新。

    ```css hl_lines="3 4" title="位于 2.2 夜间模式部分"
    [data-md-color-scheme="slate"] {
      /* ... 其他颜色 ... */
      --admonition-danger-color: #E57373;       /* 修改这里 */
      --admonition-danger-color-rgb: 229, 115, 115; /* 和这里 */
      /* ... 其他颜色 ... */
    }
    ```

=== "场景二：更换提示框图标"
    例如，更换“例子”提示框的图标。

    1.  **定位**：滚动到文件的 **`1. 全局定义 (Global Definitions)`** 部分。
    2.  **修改**：找到 `--md-admonition-icon--example` 变量。
    3.  **操作**：将其 `url(...)` 中的内容替换为新的 SVG 数据即可。

    !!! tip "SVG 转换工具"
        推荐使用 [URL-encoder for SVG](https://yoksel.github.io/url-encoder/) 这类工具来转换你的新 SVG 图标。

=== "场景三：添加全新提示框类型"
    这是最复杂的操作，但只需遵循以下“三步曲”即可。以添加 `success` 类型为例：

    1.  **第一步：添加图标**
        在 **`1. 全局定义`** 部分，仿照现有格式，添加一个新的图标变量。
        ```css title="1. 全局定义"
        :root {
          /* ... 其他图标 ... */
          --md-admonition-icon--success: url("..."); /* 你的新图标 SVG 数据 */
        }
        ```

    2.  **第二步：定义颜色**
        在 **`2.1 日间模式`** 和 **`2.2 夜间模式`** 两个部分，都为 `success` 添加对应的颜色变量。
        ```css title="2. 颜色方案定义"
        /* 日间 */
        [data-md-color-scheme="default"] {
            /* ... */
            --admonition-success-color: #4CAF50;
            --admonition-success-color-rgb: 76, 175, 80;
        }

        /* 夜间 */
        [data-md-color-scheme="slate"] {
            /* ... */
            --admonition-success-color: #A5D6A7;
            --admonition-success-color-rgb: 165, 214, 167;
        }
        ```

    3.  **第三步：应用样式**
        在 **`3. 样式应用`** 部分，**完整复制**任意一个现有类型（如 `example`）的样式块。
        将复制后代码块中所有的 `.example` **批量替换**为 `.success`，并将图标变量 `--md-admonition-icon--example` 替换为 `--md-admonition-icon--success`。

    !!! success "大功告成！"
        你已成功添加并适配了全新的提示框类型。
