# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览
- 这是一个基于 **MkDocs + Material for MkDocs** 的文档站点仓库，站点内容是“寻路之南”。
- Python 运行时要求是 **3.12+**，依赖通过 **uv** 管理。
- 仓库的核心不是传统应用代码，而是：
  - `docs/`：站点内容、静态资源、自定义样式与脚本
  - `mkdocs.yml`：站点导航、主题、插件、额外资源的中心配置
  - `tools/`：为内容仓库服务的自动化脚本（标签管理、完成度分析、原始数据库生成）

## 常用命令

### 安装依赖
```bash
uv sync
```

### 本地开发预览
```bash
uv run mkdocs serve
```
启动后访问命令行输出的本地地址（通常是 `http://127.0.0.1:8000`）。

### 严格模式构建（最接近 CI 的本地验证）
```bash
uv run mkdocs build --clean --strict --verbose
```
`--strict` 很重要：构建警告会直接导致失败。

### 标签系统检查
```bash
uv run mtag check
```

### 标签系统交互式同步
```bash
uv run mtag sync
```
该命令会扫描 `docs/` 下的 Markdown 文件，检查 frontmatter 中的标签，并在需要时更新标签词典与标签索引页。

### 内容完成度报告
```bash
uv run cana
```
可选静默模式：
```bash
uv run cana --quiet
```

### Docker 本地预览
```bash
docker compose up --build
```

### 启用 git-committers 插件进行本地构建/预览
默认本地关闭。只有在需要预览贡献者信息时才启用：
```bash
export ENABLE_COMMITTERS=true
export GITHUB_TOKEN=your_token
uv run mkdocs serve
```

### 关于“测试”
- 当前仓库**没有独立的单元测试目录或 pytest 测试套件**。
- 最重要的验证方式是：
  - `uv run mkdocs build --clean --strict --verbose`
  - `uv run mtag check`
- 因此也不存在“运行单个测试文件”的标准命令；如果需要做最小范围验证，通常是修改后直接用 `mkdocs serve` 本地预览，或跑标签检查脚本。

## 高层架构

### 1. 内容站点层
- `docs/` 是站点的主要内容源。
- Markdown 页面通常带有 YAML frontmatter，尤其是 `tags:` 字段。
- 站点内容按主题组织在 `docs/` 下的多个内容分区中，例如通识课程、技能模块、昌大专属内容、社区与共建等。
- `docs/css/`、`docs/javascripts/`、`docs/assets/` 存放前端资源；这些资源由 `mkdocs.yml` 挂接到站点中。

### 2. 配置中心
- `mkdocs.yml` 是整个站点的**单一配置中心**，负责：
  - 导航树 `nav`
  - Material 主题与功能开关
  - 插件配置（尤其是 `search`、`tags`、`git-committers`）
  - `extra_css` / `extra_javascript`
- 任何新增页面如果要出现在站点导航中，通常都需要同步修改 `mkdocs.yml`。

### 3. 自动化脚本层 (`tools/`)
- `tools/manage_tags.py`
  - 扫描 `docs/**/*.md`
  - 校验 frontmatter 中的标签格式、大小写与词典合法性
  - `sync` 模式下可更新 `tag_dictionary.yml`，并重新生成生成文件 `docs/tags.md`
- `tools/completion_analyzer.py`
  - 读取 `mkdocs.yml` 的 `nav`
  - 统计页面内容量与完成度
  - 输出 CSV 和 Markdown 报告
  - Markdown 生成文件为 `docs/COMPLETION_REPORT.md`
  - 输出路径和阈值在 `pyproject.toml` 的 `[tool.completion-analyzer]` 中配置
- `tools/weaver_build_raw_db.py`
  - 扫描文档与 frontmatter
  - 提取标题、标签、摘要、标题层级等元数据
  - 生成文件 `tools/data/raw_database.json`
  - 会遵守 `.weaverignore`

### 4. CI / 部署层
- `.github/workflows/pr-validation.yml`
  - 针对发往 `main` 的 PR 运行
  - 先做文件变更检测
  - 然后执行 `uv sync`
  - 运行 `uv run mtag check`
  - 最后运行 `uv run mkdocs build --clean --strict --verbose`
- `.github/workflows/deploy-docs.yml`
  - 在 `main` 分支 push 时部署
  - 也支持 `workflow_dispatch`
  - 使用 GitHub Pages 发布 `site/`
  - 部署时会启用 `git-committers` 插件（通过环境变量）

## 重要约定
- **不要手动维护 `tag_dictionary.yml`。** 标签规范文档明确要求通过 `uv run mtag sync` 进行管理。
- **`docs/tags.md` 是生成文件。** 如果标签体系变更，优先通过标签脚本重建，而不是手工编辑。
- **`docs/COMPLETION_REPORT.md` 是生成文件。** 如需更新，请运行 `uv run cana`。
- **`tools/data/raw_database.json` 是生成文件。** 如需更新，请运行对应构建脚本，而不是手工编辑。
- 标签遵循 `Prefix-Value` 格式，前缀来自五个固定维度：`Topic`、`Type`、`Level`、`Action`、`Context`。
- 本仓库的很多“结构性信息”并不分散在目录命名里，而是集中在 `mkdocs.yml` 的 `nav` 中；理解内容结构时优先读 `mkdocs.yml`。
- `tools/completion_analyzer.py` 依赖 `mkdocs.yml` 的导航结构，因此改动导航时要注意是否会影响完成度报告。
- `git-committers` 插件本地默认关闭；如果本地构建时忘了配置 `ENABLE_COMMITTERS`/`GITHUB_TOKEN`，通常不是 bug。
- 因为 CI 使用 `mkdocs build --strict`，所以**坏链接、无效引用、部分构建警告都应视为阻塞问题**。

## 修改内容时的工作方式
- 纯内容修改：通常改 `docs/` 下对应页面，必要时更新 `mkdocs.yml` 导航。
- 新增页面：除创建 Markdown 文件外，通常还要补充 frontmatter 标签，并把页面接入 `mkdocs.yml`。
- 修改标签体系：优先查看 `docs/community/contributing/workflow/tag.md`，然后运行 `uv run mtag sync`。
- 修改完成度分析逻辑：同时查看 `tools/completion_analyzer.py` 和 `pyproject.toml` 中的 `[tool.completion-analyzer]` 配置。
- 修改部署/验证行为：查看 `.github/workflows/pr-validation.yml` 与 `.github/workflows/deploy-docs.yml`，因为它们定义了仓库的真实质量门槛与上线流程。
