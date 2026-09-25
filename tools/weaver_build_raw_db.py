"""
原始数据库构建脚本。

生成文件：`tools/data/raw_database.json`，请勿手动编辑。
如需更新，请运行本脚本重新生成。
"""

import typer
import json
import re
from pathlib import Path
from ruamel.yaml import YAML, YAMLError
from rich.console import Console

# --- 配置 ---
ROOT_DIR = Path(__file__).parent.parent
DOCS_DIR = ROOT_DIR / "docs"
DATA_DIR = ROOT_DIR / "tools" / "data"
RAW_DB_PATH = DATA_DIR / "raw_database.json"
WEAVERIGNORE_PATH = ROOT_DIR / ".weaverignore"

# --- 初始化 ---
app = typer.Typer()
yaml = YAML(typ="safe")
console = Console()


def load_ignore_patterns() -> list[str]:
    """加载 .weaverignore 文件中的忽略规则"""
    if not WEAVERIGNORE_PATH.exists():
        return []
    patterns = []
    with open(WEAVERIGNORE_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                patterns.append(line)
    return patterns


def is_ignored(path: Path, patterns: list[str]) -> bool:
    """检查文件路径是否匹配任何忽略规则"""
    for pattern in patterns:
        if path.match(pattern):
            return True
    return False


def extract_frontmatter(content: str) -> (dict | None, str):
    """从文件内容中分离 frontmatter 和正文"""
    fm_match = re.search(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL | re.MULTILINE)
    if not fm_match:
        return None, content
    frontmatter_str = fm_match.group(1)
    main_content = content[fm_match.end() :]
    try:
        return yaml.load(frontmatter_str), main_content
    except YAMLError:
        return None, content


# --- 核心优化：智能摘要提取函数 ---
def extract_intro_summary(content: str) -> str:
    """
    智能提取摘要：跳过提示框，找到第一个有效段落。
    """
    # 1. 按行分割正文内容
    lines = content.strip().split("\n")

    in_admonition_block = False
    first_paragraph = ""

    for line in lines:
        stripped_line = line.strip()

        # 2. 跳过提示框 (admonition)
        if stripped_line.startswith(("!!!", "???")):
            in_admonition_block = True
            continue
        if in_admonition_block:
            # 如果在提示框内，检查是否已经结束（即，不再有缩进）
            if not line.startswith(("    ", "\t")):
                in_admonition_block = False
            else:
                continue

        # 3. 跳过标题、列表、分隔符等非段落内容
        if not stripped_line or stripped_line.startswith(
            ("#", "*", "-", ">", "|", "`")
        ):
            continue

        # 4. 找到了第一个有效段落！
        # 简单校验长度，过滤掉太短的无意义行
        if len(stripped_line) > 20:  # 长度阈值，可以调整
            first_paragraph = stripped_line
            break  # 找到后立即退出循环

    return first_paragraph


def extract_headings(content: str) -> list[str]:
    """提取所有的二级和三级标题"""
    headings = re.findall(r"^(##|###)\s+(.*)", content, re.MULTILINE)
    return [h[1].strip() for h in headings]


@app.command(help="构建原始数据库，提取所有文章的元数据和摘要。")
def build_raw_db():
    """扫描 docs/ 目录，提取每篇文章的关键信息，生成 `tools/data/raw_database.json`。"""
    # (主函数逻辑保持不变，此处省略以保持简洁)
    # ... 你可以从上一个版本复制 build_raw_db 函数的完整内容 ...
    database = []

    console.log("[bold cyan]🚀 开始扫描项目文章...[/bold cyan]")

    ignore_patterns = load_ignore_patterns()
    if ignore_patterns:
        console.log(
            f"[dim] 已加载 {len(ignore_patterns)} 条忽略规则从 .weaverignore[/dim]"
        )

    all_files = list(DOCS_DIR.rglob("*.md"))
    processed_files = 0

    with console.status("[bold green] 正在处理文件...[/bold green]") as status:
        for md_file in all_files:
            relative_path = md_file.relative_to(ROOT_DIR)

            if is_ignored(relative_path, ignore_patterns):
                continue

            processed_files += 1
            status.update(f"正在处理：{relative_path}")

            content = md_file.read_text(encoding="utf-8")
            frontmatter, main_content = extract_frontmatter(content)

            if frontmatter is None or not isinstance(frontmatter, dict):
                console.log(f"[yellow] 跳过（格式不规范）:[/yellow] {relative_path}")
                continue

            title = frontmatter.get("title", "无标题")
            tags = frontmatter.get("tags", [])
            intro_summary = extract_intro_summary(main_content)  # 调用新的智能提取函数
            headings = extract_headings(main_content)

            article_data = {
                "filepath": relative_path.as_posix(),
                "title": title,
                "tags": tags,
                "intro_summary": intro_summary,
                "headings": headings,
            }
            database.append(article_data)

    console.log(
        f"[bold green]✅ 文件扫描完成！共发现 {len(all_files)} 个文件，实际处理 {processed_files} 个，成功提取 {len(database)} 篇文章。[/bold green]"
    )

    DATA_DIR.mkdir(exist_ok=True)

    with open(RAW_DB_PATH, "w", encoding="utf-8") as f:
        json.dump(database, f, indent=2, ensure_ascii=False)

    console.log(f"[bold blue]💾 原始数据库已成功保存到：{RAW_DB_PATH}[/bold blue]")


if __name__ == "__main__":
    app()
