---
tags:
  - Context-Project
---
# 调整图片样式

!!! danger 未完工
    本文正在建设中

## 操作方法

要自定义图注（Caption）的样式，直接修改主题的 CSS 文件即可。

找到并编辑文件 `docs\css\02-components.css`，在其中添加或修改 `figcaption` 的样式规则。

```css title="docs\css\02-components.css"
figcaption {
  text-align: center; /* 文本居中 */
  font-style: italic;  /* 设为斜体 */
  font-size: 0.7em;   /* 调整字体大小 */
}
```

### 效果演示

应用以上 CSS 规则后，下图的图注样式将会改变。

![Image title](https://dummyimage.com/600x400/){ width="300" }
/// caption
这里是图注释
///

## 布局建议：优先使用右对齐

在进行图文混排时，将图片设置为右对齐 (`align=right`) 通常能获得更美观的布局效果。

![Image title](https://dummyimage.com/600x400/eee/aaa){ align=right width="300"}

当图片靠右时，左侧的文字段落能保持左边界对齐，这使得阅读流更加顺畅自然。

相比之下，左对齐的图片可能会因空行等问题，破坏文本的整体感，影响美观。因此，在实践中建议优先使用右对齐的图片。

还有更多相关设置，请参考[这个文档](https://squidfunk.github.io/mkdocs-material/reference/images/#image-alignment-left)

期待后续有人能继续更新

保持更新
