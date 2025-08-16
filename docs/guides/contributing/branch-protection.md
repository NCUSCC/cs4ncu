---
tags:
  - Topic-GitHub
  - Type-Specification
  - Level-Intermediate
  - Action-Collaboration
  - Context-Project
---

# 我们的 Git 工作流与分支保护

为了保持 `main` 分支的绝对稳定和项目历史的清晰，我们建立了一套明确的协作流程。

这些不仅仅是口头约定，它们由 GitHub 的分支保护规则强制执行，以确保一个对**所有人（包括项目管理员）**都公平、一致的贡献环境。

---

### `main` 分支的核心保护规则

我们的 `main` 分支受到以下 GitHub 设置的保护：

**1. 所有变更必须通过拉取请求 (Pull Request)**

我们不允许任何人直接向 `main` 分支推送代码。所有修改，无论大小，都必须通过 PR 的方式提交，以便进行讨论和审查。

*   **GitHub 设置**: `Require a pull request before merging` 已启用。

**2. PR 必须经过审查批准**

一个 PR 在合并前，必须获得至少一名项目维护者的审查和明确批准 (Approve)。这确保了每一行代码都经过了复核。

*   **GitHub 设置**: `Require approvals` 已设置为 1。

**3. 更新后需要重新审查**

如果一个 PR 在被批准后，贡献者又推送了新的代码，那么之前的批准状态会自动失效。这保证了最终合并的代码就是被审查过的代码。

*   **GitHub 设置**: `Dismiss stale pull request approvals when new commits are pushed` 已启用。

**4. 保持干净、线性的提交历史**

我们通过“压缩合并”的方式来合并 PR。这意味着一个 PR 中的多次零散提交（比如“修复错字”、“调整格式”）会被合并成一个有意义的、完整的提交记录，最终进入 `main` 分支。

*   **GitHub 设置**: `Require linear history` 已启用，我们约定使用 **Squash and merge**。

---

### 标准贡献流程

这是将你的贡献融入项目的唯一路径，对所有人都一样：

1.  **Fork** 仓库到你自己的 GitHub 账户。
2.  从 `main` 分支**创建**一个新的、有描述性的分支。
3.  在新分支上**提交**你的修改。
4.  向主仓库的 `main` 分支发起一个 **Pull Request**。
5.  **等待审查**、回应可能有的反馈，直到你的 PR 被批准和合并。

感谢你理解并遵循这个流程，这能帮助我们共同维护一个高质量、可追溯的开源项目。