---
tags:
  - Type-Specification
  - Context-Project
  - Topic-Automation
---

# 内容完成度分析脚本：使用与配置指南

`pyscript/completion_analyzer.py` 是 `CS4NCU` 项目的一个内部质量保证工具，旨在自动化地分析整个知识库的内容完成情况。

!!! declaration "设计目的"
    本脚本的核心任务是回答一个问题：“我们项目的哪些部分已经充实，哪些部分还是空架子？”

    它通过扫描 `mkdocs.yml` 中定义的导航结构，并逐一检查每个 Markdown 文件的内容量，为项目维护者和贡献者提供一份清晰、直观、可量化的进度报告。这有助于我们识别写作瓶颈，合理分配贡献力量，确保整个知识库的健康发展。

## 核心功能

-   **结构感知**：直接从 `mkdocs.yml` 的 `nav` 配置中读取项目结构，保证分析与网站导航完全一致。
-   **量化评估**：统计每个文件的字符数、词数和行数，并根据预设阈值评估其完成度（如“空白”、“内容极少”、“内容充实”等）。
-   **版本追溯**：自动获取当前的 Git commit 信息，并将其嵌入报告中，使每一份报告都能追溯到具体的代码版本。
-   **双格式输出**：生成两种格式的报告：
    1.  **Markdown (`.md`)**：供人类阅读的、格式美观的层级报告。
    2.  **CSV (`.csv`)**：供机器处理的、扁平化的数据表格，便于未来进行更深入的数据分析。
-   **高度可配**：所有关键参数（如输出路径、评估阈值）均可通过 `pyproject.toml` 文件或命令行参数进行配置。

---

## 使用指南

### 1. 环境准备

在运行脚本前，请确保你已经使用 `uv` 工具安装了项目所需的所有 Python 依赖。

```bash title="安装/同步所有依赖"
uv sync
```

### 2. 运行脚本

直接在项目根目录运行以下命令即可生成最新的报告：

```bash title="执行分析并生成报告"
uv run pyscript/completion_analyzer.py
```

脚本执行完毕后，会打印出报告的保存路径和一份简要的完成情况汇总。

**静默模式**：如果你只想生成报告文件而不在终端看到汇总信息，可以添加 `--quiet` 参数。

```bash
uv run pyscript/completion_analyzer.py --quiet
```

---

## 配置文件 (`pyproject.toml`)

为了方便管理，你可以将常用配置固化在项目根目录的 `pyproject.toml` 文件中。脚本会自动读取 `[tool.completion-analyzer]` 表下的配置。

```toml title="pyproject.toml"
[tool.completion-analyzer]
# --- 可选配置 ---

# Markdown 报告的输出路径
md_output = "docs/COMPLETION_REPORT.md"

# CSV 报告的输出路径
csv_output = "reports/completion_report.csv"

# “内容极少”的字符数阈值
# 低于此值，文章被认为是 minimal
min_chars = 50

# “内容充实”的字符数阈值
# 高于此值，文章被认为是 substantial
good_chars = 500
```

**配置优先级**：命令行参数 > `pyproject.toml` 文件 > 脚本内置默认值。

---

## 解读报告

!!! info "如何解读 Markdown 报告？"
    生成的 Markdown 报告 (`COMPLETION_REPORT.md`) 是你了解项目进度的主要窗口。

    -   **层级结构**：报告的标题层级完全复制自 `mkdocs.yml` 中的 `nav` 结构，让你对项目全貌一目了然。
    -   **进度计数器**：每个章节标题后面都会有一个 `(x/y)` 格式的进度计数器，例如 `(5/12)`，表示该章节下共有 12 篇文章，其中 5 篇被判断为“内容充实”。
    -   **任务清单**：
        -   `[x]` **已完成**：表示该文章的内容量已超过 `good_chars` 阈值，内容较为充实。
        -   `[ ]` **待办**：表示该文章不存在、为空，或内容量未达到 `good_chars` 阈值，需要进一步完善。
    -   **详细信息**：每篇文章后面都会跟着它的路径、当前字数和状态评估，方便你快速定位和判断。

CSV 报告则提供了更原始、更规整的数据，如果你需要对项目的写作进度进行长期的、数据驱动的跟踪分析，它将是你的得力助手。
