# Pull Request 校验工作流指南

本文档描述仓库中当前真实存在的 PR 校验流程，事实来源为 `.github/workflows/pr-validation.yml`。

## 触发条件

PR 校验工作流会在以下场景运行：

- `pull_request`
- 事件类型：`opened`、`synchronize`、`reopened`
- 目标分支：`main`

## 校验目标

当前工作流聚焦于三件事：

1. **变更检测**：只有当变更影响到文档、配置、工具或校验工作流本身时，才继续执行后续构建。
2. **依赖同步**：运行 `uv sync`，确保 CI 环境与项目声明一致。
3. **质量校验**：先执行标签检查，再执行严格模式构建。

## 实际执行步骤

当工作流判断本次 PR 需要校验时，会按顺序执行：

1. 检出 PR 对应代码。
2. 计算与基线相比的变更文件。
3. 判断是否命中文档站点相关路径。
4. 设置 Python 3.12。
5. 安装 `uv` 并恢复依赖缓存。
6. 运行：

```bash
uv sync
uv run mtag check
uv run mkdocs build --clean --strict --verbose
```

## 本地模拟 CI 的推荐命令

在提交 PR 前，建议你在本地按接近 CI 的方式验证：

```bash
uv sync
uv run mtag check
uv run mkdocs build --clean --strict --verbose
```

如果你的改动涉及完成度分析逻辑或其生成结果，也可以补充：

```bash
uv run cana --quiet
```

## 常见关注点

### 为什么有时 PR 不会继续构建？

因为工作流先做了文件变更检测。若本次改动没有命中 `docs/`、`mkdocs.yml`、`tools/` 或 PR 校验工作流自身，就会跳过后续步骤。

### 当前并不存在什么？

为避免误解，这里明确说明：

- 当前仓库**没有** `pr-preview.yml`
- 当前仓库**没有** `cleanup-pr-preview.yml`
- 当前文档不再假定存在自动预览站点、PR 关闭后清理预览目录等能力

## 对贡献者的建议

- 文档改动优先本地预览：`uv run mkdocs serve`
- 提交前至少执行一次严格构建
- 若修改标签相关内容，记得运行 `uv run mtag check`
