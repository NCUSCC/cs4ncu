---
tags:
  - 标签一
  - 标签二
  - 更多标签...
---

# MkDocs 功能与语法测试页

本页面用于测试和展示《CS for NCU 写作与风格指南》中提到的所有高级功能，以确保它们在当前配置下正常工作。

## 1. 提示框 (`admonition`)

这是由 `admonition` 扩展提供的功能，使用 `!!!` 语法。

!!! note "这是一个标准的 Note 提示框"
    它用于提供普通的补充说明。

!!! reminder "这是一个自定义的“提醒”提示框"
    我们的自定义 CSS 已经为它配置了独特的图标和颜色。

!!! danger "这是一个自定义的“危险”提示框"
    龙形图标和红色背景应该会正常显示。这是最高级别的警告。

---

## 2. 可折叠内容 (`details`)

这是由 `pymdownx.details` 扩展提供的功能，使用 `???` 语法。

??? "这是一个默认折叠的内容块 (点击展开)"
    这里的内容默认是隐藏的，非常适合放置不重要的补充信息或冗长的代码输出。

    - 这是一个列表项。
    - 甚至可以嵌套其他内容。
    
    ```python
    print("内容可以非常丰富！")
    ```

???+ "这是一个默认展开的内容块 (点击折叠)"
    使用 `???+` 语法，这个内容块在页面加载时就是展开状态，用户可以手动将其折叠。
    这对于那些比较重要，但仍希望用户可以选择性隐藏的内容很有用。

---

## 3. 标签页 (`tabbed`)

这是由 `pymdownx.tabbed` 扩展提供的功能，使用 `===` 语法。

=== "Windows"
    这是在 Windows 平台下的安装说明。
    ```powershell
    # 使用 Winget 安装
    winget install Python.Python.3
    ```

=== "macOS"
    这是在 macOS 平台下的安装说明。
    ```bash
    # 使用 Homebrew 安装
    brew install python@3.11
    ```

=== "Linux (Ubuntu/Debian)"
    这是在 Linux 平台下的安装说明。
    ```bash
    sudo apt update
    sudo apt install python3
    ```

---

## 4. 高级代码块 (`superfences` & `highlight`)

### 4.1. 指定语言高亮

```javascript
// 这是一个 JavaScript 代码块
const name = "CS for NCU";
function greet(who) {
  console.log(`Hello, ${who}!`);
}
greet(name);
```

### 4.2. 高亮特定代码行 (`hl_lines`)

```python hl_lines="3 6-8"
import os

# 第 3 行将被高亮
CONFIG_PATH = "/etc/cs4ncu/config.toml"

def load_config(path):
    # 第 6, 7, 8 行将被高亮
    if os.path.exists(path):
        print(f"Loading config from {path}")
        return True
    return False

load_config(CONFIG_PATH)
```

---

## 5. 任务列表 (`tasklist`)

这是由 `pymdownx.tasklist` 扩展提供的功能。

- [x] 确认所有插件已安装。
- [x] 编写测试文件。
- [ ] 验证所有功能是否正常工作。
- [ ] 将指南正式定稿。

---

## 6. Emoji (Unicode 直出)

这是由 `pymdownx.emoji` 提供的支持。

*   **指代物品**: 你的新电脑 💻 到了吗？我们需要键盘 ⌨️ 和鼠标 🖱️。
*   **表示状态**: 部署成功！🚀 任务完成 ✅。发生错误 ❌。
*   **表达情感**: 这是一个值得思考 🤔 的问题。项目启动啦 🎉！
*   **结构提示**: 💡 小技巧：... 🔗 相关链接：... ⚠️ 注意：...

---

## 7. 标签 (`tags`)

这个页面的标签（"功能测试", "语法示例", "指南"）应该会显示在文章标题的下方。这证明 `tags` 插件和 Frontmatter 功能正常。
