---
tags:
  - Topic-Git
  - Topic-GitHub
  - Type-Guide
  - Level-Beginner
  - Action-Collaboration
  - Context-Project
---

# 如何向 CS for NCU 贡献

首先，我们由衷地感谢您愿意为 `CS for NCU` 项目贡献自己的一份力量！❤️

这个项目是一个由社区驱动的知识库，您的每一次贡献，无论是修正一个错字、分享一段经验，还是优化一行代码，都是在为后来的昌大学子点亮一盏灯。

为了让协作更加高效顺畅，我们制定了这份贡献指南。请不必担心流程复杂，我们将引导您完成每一步。

---

## 贡献的核心哲学：万事始于 Issue

为了确保每一项工作都有据可循、避免重复劳动，我们约定：**任何形式的贡献，都请从一个 GitHub Issue 开始。**

-   **如果你有一个新想法或发现一个错误**：请先[检查现有的 Issues](https://github.com/ncuscc/cs4ncu/issues)，确认没有其他人提出过。如果没有，请创建一个新的 Issue，清晰地描述您的建议或问题。
-   **如果你想参与贡献**：请浏览[标记为 `good first issue` 或 `help wanted` 的 Issues](https://github.com/ncuscc/cs4ncu/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22%2C%22help+wanted%22)，这些是我们推荐新人上手的任务。
-   **如果你想写些什么**：请浏览[内容进度记录](https://github.com/NCUSCC/cs4ncu/issues/8)确认是否有其他人已经在写类似话题了，以避免与现有选题重复。如遇相似主题，您可在相关 Issue 下方参与讨论、寻求合作，或撰写不同视角的衍生内容。我们欢迎并珍视每一位贡献者带来的多元视角。
!!! tip "沟通是关键"
    对于较大的改动或全新的内容章节，我们强烈建议您在创建 Issue 后，加入我们的 [:fontawesome-brands-discord: Discord 社区服务器](https://discord.gg/Rux6DHRStP)进行讨论。这能帮助我们更好地对齐目标，确保您的宝贵时间被用在最有效的地方。

在您选定或创建了一个 Issue 后，请在评论区留言，例如“我来认领这个任务！”（`I'd like to work on this!`），管理员会为您分配任务。

## 两条贡献路径：选择最适合你的方式

我们深知贡献者来自不同背景，因此提供了两条路径，您可以根据自己的情况选择：

1.  **内容贡献**：为项目添砖加瓦，撰写文章、分享经验。
2.  **开发贡献**：优化网站功能、修复 Bug、改进构建流程等。

---

### A. 内容贡献

这是项目最核心的贡献方式。根据您对 Git 和 GitHub 的熟悉程度，我们为您设计了两种协作模式：

#### 路径一：我是写作能手，但不熟悉代码与 Git

没关系！我们绝不希望技术门槛成为分享知识的阻碍。

**您的工作流程：**

1.  **沟通**：同样地，先通过 Issue 与我们确认您想撰写的主题。
2.  **创作**：在您最喜欢的编辑器（如 Word, Typora, VS Code 等）中完成您的文章草稿。
3.  **提交**：将您的 `.md` 或 `.docx` 文件通过邮件发送给项目管理员。
    -   **邮箱地址**：`teapot1de@qq.com`
    -   **邮件标题**：`[CS for NCU 贡献] - <您的文章标题>`
    -   **邮件正文**：请附上相关的 Issue 链接。
4.  **协作**：我们会有一位管理员与您对接，协助您完成后续的格式调整、Git 提交、Pull Request 创建等所有技术流程。您可以选择全程参与学习，也可以全权委托我们发布。

!!! success "我们的承诺"
    无论您选择哪种方式，我们都会确保您的署名权，并对您的贡献表示最诚挚的感谢。

#### 路径二：我熟悉 Git 与 Markdown

太棒了！您可以像大多数开源项目一样，通过标准的 Pull Request 流程来贡献内容。

**您的工作流程：**

1.  **认领 Issue**：在您想处理的 Issue 下留言，并等待管理员确认。
2.  **Fork 仓库**：点击仓库右上角的 "Fork" 按钮，将项目复刻到您自己的 GitHub 账户下。
3.  **Clone 到本地**：`git clone https://github.com/YOUR_USERNAME/cs4ncu.git`
4.  **创建新分支**：`git checkout -b feature/your-meaningful-branch-name`
5.  **本地创作与测试**：
    -   **[《搭建基础环境》](./development-setup.md)**。  
    -   在 `docs/` 目录下创建或修改相应的 `.md` 文件。
    -   打开 `mkdocs.yml` 文件，在其中 nav: 部分，仿照现有格式，添加新页面的标题和相对路径。
    -   **重要**：请务必遵守我们的 **[《写作规范》](./writing-guide.md)**。
    -   在项目根目录下运行 `uv run mkdocs serve`，通过访问 `http://127.0.0.1:8000` 在本地实时预览您的修改效果。
6.  **提交代码**：
    -   `git add .`
    -   `git commit -m "feat: 添加关于XXX的指南 (closes #123)"` (请遵循良好的 Commit Message 规范，并关联 Issue)
    -   `git push origin feature/your-meaningful-branch-name`
7.  **创建 Pull Request (PR)**：回到您 Fork 的 GitHub 仓库页面，点击 "Contribute" -> "Open pull request"，将您的分支合并到主仓库的 `main` 分支。

!!! tip "不必追求完美！"
    我们深知写作规范细节繁多。初期请不必过于担心，大胆地提交您的 PR 吧！我们遵循 **“先合并，再完善”** 的原则。即使排版或格式有些许瑕疵，我们也非常乐意在 Code Review 阶段与您一同修改，或者在合并后由维护者进行润色。**您的内容价值永远是第一位的。**

简单了解 [Mkdocs](https://www.mkdocs.org/) 框架可以帮助你的参与到项目中来。

### B. 开发贡献

如果您对网站本身的功能感兴趣，例如：

-   优化 CSS 样式
-   添加新的 MkDocs 插件并配置
-   编写脚本自动化某些流程
-   修复网站的显示 Bug

您的贡献流程与 **内容贡献的路径二** 完全一致。我们同样欢迎您通过 Issue 发起讨论，然后通过 Pull Request 提交您的代码。

---

再次感谢您的时间和热情！让我们一起，把 `CS for NCU` 建设得更好。
