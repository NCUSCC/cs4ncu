# 开发者指南：代码块功能与样式定制

## 概述

!!! danger 注意
    **本文档为 ai 生成的草案**

为了提升本指南中代码示例的可读性和功能性，我们对 MkDocs 的代码块进行了深度定制。本文档记录了相关的配置决策和实现方法，以便所有贡献者都能理解和维护。

核心目标有两个：
1.  **功能最大化**：启用 Material for MkDocs 提供的所有代码块增强功能，如复制按钮、代码注解、行高亮等。
2.  **视觉统一性**：为所有代码块应用一套美观、一致的 **Rosé Pine** 风格主题，无论在日间还是夜间模式下，都能提供最佳的阅读体验。

---

## 1. 启用全部代码块功能

我们通过在 `mkdocs.yml` 文件中配置 `markdown_extensions` 来启用所有高级功能。这确保了我们的 Markdown 文件可以支持更丰富的代码展示形式。

### 核心配置

以下是 `mkdocs.yml` 中与代码块相关的最终配置：

```yaml title="mkdocs.yml"
markdown_extensions:
  # ... 其他扩展 ...

  # --- 代码与高亮核心扩展 ---
  - pymdownx.superfences      # 强大的代码围栏，是添加标题、注解等功能的基础
  - pymdownx.snippets         # 允许从外部文件直接嵌入代码片段
  - pymdownx.inlinehilite     # 支持行内代码高亮，如 `#!python print()`
  - pymdownx.highlight:
      anchor_linenums: true     # 为行号添加锚点，可以链接到特定行
      line_spans: __span        # 生成用于链接的 span
      pygments_lang_class: true # 为代码块添加语言类名，方便 CSS 选择
```

**配置解读**:
- `pymdownx.superfences`: 基础，让我们可以在代码块上添加标题、行号等属性。
- `pymdownx.snippets`: 非常有用，可以直接引用项目中的真实代码文件，避免复制粘贴和内容不同步。
- `pymdownx.inlinehilite`: 增强行文中的代码可读性。
- `pymdownx.highlight`: 语法高亮的核心，完整的配置确保了行号链接等高级功能的实现。

---

## 2. 定制 Rosé Pine 代码主题

为了打造独特的视觉风格，我们没有使用 Material for MkDocs 的默认高亮颜色，而是实现了一套完整的 Rosé Pine 主题。

### 实现方式

我们通过一个自定义的 CSS 文件来覆盖默认的颜色变量。

- **文件位置**: `docs/stylesheets/extra.css`
- **引用方式**: 在 `mkdocs.yml` 中通过 `extra_css` 字段加载。

```yaml title="mkdocs.yml"
extra_css:
  - 'stylesheets/extra.css'
```

### 核心样式

`extra.css` 文件的关键部分是定义了一系列 CSS 变量，将 Rosé Pine 的调色板映射到 Material for MkDocs 的代码高亮系统中。

```css title="docs/stylesheets/extra.css (部分)"
/* :root 选择器确保这些变量全局可用 */
:root {
  /* --- Rosé Pine 主题颜色 --- */
  --md-code-bg-color:           #faf4ed; /* 代码块背景色 (Base) */
  --md-code-fg-color:           #575279; /* 默认文字颜色 (Text) */

  /* --- 语法高亮 --- */
  --md-code-hl-keyword-color:     #907aa9;  /* 关键字 (Iris) */
  --md-code-hl-string-color:      #ea9d34;  /* 字符串 (Gold) */
  --md-code-hl-function-color:    #d7827e;  /* 函数名 (Rose) */
  --md-code-hl-comment-color:     #9893a5;  /* 注释 (Muted) */
  /* ... 等等 ... */
}

/* 我们为日间和夜间模式设置了相同的主题，以保证代码阅读体验的一致性 */
[data-md-color-scheme="default"] {
  @extend :root;
}
[data-md-color-scheme="slate"] {
  @extend :root;
}
```
*（注：实际 CSS 文件为每个模式单独设置了变量，但值为相同，以确保覆盖成功）*

**设计决策**：我们选择在日间和夜间模式下保持代码块主题不变。这是因为对于技术文档，代码本身的可读性和一致性比跟随页面背景变化更重要。

---

## 3. 如何使用这些功能 (贡献者指南)

在编写文档时，你可以使用以下语法来充分利用这些功能。

### 添加标题、行号和高亮

````markdown
```py title="utils.py" linenums="10" hl_lines="11 13-14"
# 这个代码块会从第 10 行开始编号
# 第 11 行和 13-14 行会被高亮
def my_function(a, b):
    if a > b:
        print("a is greater")
    else:
        print("b is greater or equal")
```
````

### 添加代码注解

这是一个非常强大的功能，用于解释特定代码行。

````markdown
```yaml
theme:
  features:
    - content.code.annotate # (1)
```

1.  这一行启用了代码注解功能。注解内容可以包含任何 Markdown 格式。
````

---

## 4. 如何维护或修改

如果未来需要调整代码块的颜色：

1.  **定位文件**: 打开 `docs/stylesheets/extra.css`。
2.  **找到变量**: 找到你想要修改的颜色对应的 CSS 变量。例如，要修改字符串的颜色，就找到 `--md-code-hl-string-color`。
3.  **修改色值**: 将其值修改为你想要的十六进制颜色码。
4.  **同步模式**: 确保在 `[data-md-color-scheme="default"]` 和 `[data-md-color-scheme="slate"]` 两个规则块下都做了同样的修改，以保持一致性。
````