---
tags:
  - Topic-DevOps
  - Topic-GitHub
  - Type-Guide
  - Level-Intermediate
  - Action-Deployment
  - Context-Project
---

# 网站部署指南

本文档只描述仓库中当前**真实存在**的部署行为，事实来源为 `.github/workflows/deploy-docs.yml`。

## 触发条件

当前生产部署工作流支持两种触发方式：

1. **推送到 `main` 分支 (`push`)**
   - 当变更进入 `main` 后，会触发正式部署。
2. **手动触发 (`workflow_dispatch`)**
   - 维护者可在 GitHub Actions 页面手动执行一次部署。

除此之外，本文档不假定存在额外的预览部署工作流。

## 当前部署流程

部署工作流会按如下顺序执行：

1. 检出仓库代码。
2. 配置 Python 3.12 环境。
3. 安装 `uv` 并恢复依赖缓存。
4. 运行 `uv sync` 安装依赖。
5. 启用 `git-committers` 相关环境变量后执行严格构建。
6. 将生成的 `site/` 发布到 GitHub Pages。

其中，构建命令以严格模式为准：

```bash
uv run mkdocs build --clean --strict --verbose
```

## 这对贡献者意味着什么？

- 贡献者**不需要**在本地执行部署命令。
- 贡献者应重点关注本地预览与 PR 校验是否通过。
- 真正影响线上站点的自动部署，发生在变更进入 `main` 之后，或由维护者手动触发时。

## 本地建议验证

在发起 PR 前，建议至少执行以下命令：

```bash
uv sync
uv run mtag check
uv run mkdocs build --clean --strict --verbose
```

如果你修改了内容完成度分析相关逻辑，也可以补充执行：

```bash
uv run cana --quiet
```
