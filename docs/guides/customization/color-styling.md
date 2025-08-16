---
tags:
  - CSS
---

# 颜色主题定制指南

网站的所有颜色都集中在 `00-variables.css` 文件中进行管理。这种方法利用 CSS 变量（CSS Variables），使主题修改变得简单和安全。

该文件分为**日间模式**（`default`）和**夜间模式**（`slate`）两部分，您可以为两种模式分别设置颜色。

## 如何修改颜色

### 步骤 1：定位文件

首先，请在项目样式文件夹中找到并打开 `docs\css\00-variables.css` 文件。

### 步骤 2：选择模式

根据您想修改的模式，找到对应的 CSS 规则块：

-   `[data-md-color-scheme="default"]`：**日间模式**
-   `[data-md-color-scheme="slate"]`：**夜间模式**

### 步骤 3：查找并修改颜色变量

在选定的模式下，找到您想要修改的颜色所对应的 CSS 变量。文件中的注释可以帮助您快速理解每个变量的用途。

!!! example "示例：修改夜间模式下代码块的字符串颜色"
    1.  找到 `[data-md-color-scheme="slate"]` 规则块。
    2.  在其中找到 `--md-code-hl-string-color` 变量。
    3.  将现有的颜色值（`#f6c177`）替换为您想要的新颜色。

    ```css title="docs/css/00-variables.css" linenums="1" hl_lines="8"
    [data-md-color-scheme="slate"] {
      /* ... 其他变量 ... */

      /* 代码语法高亮颜色 (Rosé Pine Moon) */
      --md-code-hl-keyword-color:     #c4a7e7;
      --md-code-hl-operator-color:    #908caa;
      --md-code-hl-function-color:    #eb6f92;
      --md-code-hl-string-color:      #f6c177;  /* <- 将这里的 #f6c177 修改为您想要的颜色 */
      --md-code-hl-number-color:      #f6c177;
      /* ... 其他变量 ... */
    }
    ```

### 步骤 4：保存并预览

修改完成后，保存文件并刷新您的网站页面，即可看到效果。

---

!!! reminder "关键提示"
    - **保持一致**：如果您希望日间和夜间模式的某个颜色保持一致或同步修改，请确保在两个规则块中都修改了对应的变量。
    - **参考注释**：充分利用文件中的注释（如 `/* 关键字 (Iris) */` 或 `/* 页面主背景色 */`）来定位您需要修改的颜色。