#!/usr/bin/env python3
"""
内容完成情况分析脚本 (v2.1)

从 mkdocs.yml 和 docs 目录分析每个小节的完成情况，
统计字数并做简单判断，输出 CSV 和 Markdown 格式的报告。

特性:
- 从 pyproject.toml 读取配置
- 命令行参数可覆盖配置
- 将 Git commit 信息添加到报告中
- Markdown 报告采用顶格对齐格式
"""

import sys
import csv
import re
import yaml
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

# 尝试导入依赖，并在失败时给出明确提示
try:
    import tomllib  # Python 3.11+
except ImportError:
    try:
        import tomli as tomllib
    except ImportError:
        print(
            "错误：缺少 toml 解析库。请运行 `uv add tomli` (Python < 3.11) 或升级 Python。",
            file=sys.stderr,
        )
        sys.exit(1)

try:
    import git
except ImportError:
    print("错误：缺少 GitPython 库。请运行 `uv add gitpython`。", file=sys.stderr)
    sys.exit(1)

# --- 辅助函数 ---


def load_config(repo_path: Path, args: argparse.Namespace) -> Dict[str, Any]:
    """加载配置，优先级：命令行参数 > pyproject.toml > 默认值"""
    # 1. 默认值
    defaults = {
        "md_output": "docs/reports/COMPLETION_REPORT.md",
        "csv_output": "reports/completion_report.csv",
        "min_chars": 50,
        "good_chars": 500,
    }

    # 2. 从 pyproject.toml 加载
    config = defaults.copy()
    pyproject_path = repo_path / "pyproject.toml"
    if pyproject_path.exists():
        with open(pyproject_path, "rb") as f:
            pyproject_data = tomllib.load(f)
            tool_config = pyproject_data.get("tool", {}).get("completion-analyzer", {})
            config.update(tool_config)

    # 3. 命令行参数覆盖
    cli_args = {key: value for key, value in vars(args).items() if value is not None}
    config.update(cli_args)

    return config


def get_commit_info(repo_path: Path) -> Dict[str, str]:
    """获取 Git 仓库的 commit 信息"""
    try:
        repo = git.Repo(repo_path, search_parent_directories=True)
        commit = repo.head.commit
        short_hash = commit.hexsha[:7]

        remote_url, commit_link = "", ""
        try:
            remote_url = repo.remotes.origin.url
            if remote_url.endswith(".git"):
                remote_url = remote_url[:-4]
            remote_url = re.sub(r"git@([^:]+):", r"https://\1/", remote_url)
            commit_link = f"{remote_url}/commit/{commit.hexsha}"
        except Exception:
            pass

        return {
            "hash": commit.hexsha,
            "short_hash": short_hash,
            "message": commit.message.strip().split("\n")[0],
            "author": commit.author.name,
            "date": commit.committed_datetime.strftime("%Y-%m-%d %H:%M:%S"),
            "link": commit_link,
        }
    except git.InvalidGitRepositoryError:
        return {"error": "不是一个有效的 Git 仓库"}
    except Exception as e:
        return {"error": f"获取 Git 信息时出错：{e}"}


# --- 主分析类 ---


class CompletionAnalyzer:
    def __init__(self, config: Dict[str, Any]):
        self.repo_path = Path(config["repo_path"]).resolve()
        self.mkdocs_path = self.repo_path / "mkdocs.yml"
        self.docs_path = self.repo_path / "docs"
        self.skills_index_path = self.docs_path / "skills" / "index.md"

        self.min_chars_threshold = int(config["min_chars"])
        self.good_chars_threshold = int(config["good_chars"])

    def load_mkdocs_config(self) -> Dict:
        try:
            with open(self.mkdocs_path, "r", encoding="utf-8") as f:
                content = f.read()
                content = re.sub(r"!!python/name:[^\s\n]+", '""', content)
                return yaml.safe_load(content)
        except Exception as e:
            print(f"错误：无法加载或解析 mkdocs.yml: {e}", file=sys.stderr)
            return {}

    def parse_nav_tree(self, nav_structure: List) -> List[Dict[str, Any]]:
        tree = []

        def _parse_recursive(item: Any):
            if isinstance(item, dict):
                for title, content in item.items():
                    if isinstance(content, str):
                        return {"type": "file", "title": title, "path": content}
                    elif isinstance(content, list):
                        children = [_parse_recursive(sub_item) for sub_item in content]
                        return {
                            "type": "section",
                            "title": title,
                            "children": [c for c in children if c],
                        }
            elif isinstance(item, str):
                title = Path(item).stem.replace("-", " ").replace("_", " ").title()
                return {"type": "file", "title": title, "path": item}
            return None

        if not isinstance(nav_structure, list):
            return []
        for nav_item in nav_structure:
            if node := _parse_recursive(nav_item):
                tree.append(node)
        return tree

    def parse_todo_checklist(self) -> Dict[str, bool]:
        todo_status = {}
        if not self.skills_index_path.exists():
            return todo_status
        try:
            content = self.skills_index_path.read_text(encoding="utf-8")
            pattern = (
                r'- \[([ x])\]\s*(?:\*\*)?[`"]?([^`"]*?)[`"]?(?:\*\*)?\s*\(`([^)]+)`\)'
            )
            matches = re.findall(pattern, content, re.MULTILINE)
            for is_done, _, file_path in matches:
                todo_status[file_path] = is_done.lower() == "x"
        except Exception as e:
            print(f"警告：解析 TODO 清单时出错：{e}", file=sys.stderr)
        return todo_status

    def analyze_file(self, file_path: str) -> Dict[str, Any]:
        full_path = self.docs_path / file_path
        result = {
            "file_path": file_path,
            "exists": False,
            "char_count": 0,
            "word_count": 0,
            "line_count": 0,
            "status": "missing",
            "completion_level": "none",
        }
        if full_path.is_file():
            try:
                content = full_path.read_text(encoding="utf-8")
                result.update(
                    {
                        "exists": True,
                        "char_count": len(content),
                        "word_count": len(re.findall(r"\w+", content)),
                        "line_count": len(content.splitlines()),
                    }
                )
                if result["char_count"] == 0:
                    result.update({"status": "empty", "completion_level": "none"})
                elif result["char_count"] < self.min_chars_threshold:
                    result.update({"status": "minimal", "completion_level": "low"})
                elif result["char_count"] < self.good_chars_threshold:
                    result.update({"status": "basic", "completion_level": "medium"})
                else:
                    result.update({"status": "substantial", "completion_level": "high"})
            except Exception as e:
                print(f"错误：读取文件 {file_path} 失败：{e}", file=sys.stderr)
                result["status"] = "error"
        return result

    def generate_report_tree(self) -> List[Dict[str, Any]]:
        config = self.load_mkdocs_config()
        nav_structure = config.get("nav", [])
        if not nav_structure:
            print("错误：mkdocs.yml 中未找到 'nav' 配置。", file=sys.stderr)
            return []
        report_tree = self.parse_nav_tree(nav_structure)
        todo_status = self.parse_todo_checklist()
        processed_files = set()

        def _analyze_node(node: Dict[str, Any]):
            if node["type"] == "file":
                if (file_path := node["path"]) in processed_files:
                    return
                processed_files.add(file_path)
                analysis = self.analyze_file(file_path)
                node.update(analysis)
                node["category"] = self.categorize_file(file_path)
                node["manual_status"] = todo_status.get(file_path)
                if node["manual_status"] is True:
                    node["final_status"] = "completed"
                elif node["manual_status"] is False:
                    node["final_status"] = "todo"
                else:
                    node["final_status"] = node["status"]
                node["size_assessment"] = self.assess_content_size(node["char_count"])
            elif node["type"] == "section" and "children" in node:
                for child in node["children"]:
                    _analyze_node(child)

        for root_node in report_tree:
            _analyze_node(root_node)
        return report_tree

    def _flatten_report_tree(self, report_tree: List[Dict]) -> List[Dict]:
        flat_list = []

        def _traverse(node):
            if node["type"] == "file":
                flat_list.append(node)
            elif node["type"] == "section" and "children" in node:
                for child in node["children"]:
                    _traverse(child)

        for node in report_tree:
            _traverse(node)
        return flat_list

    def categorize_file(self, file_path: str) -> str:
        parts = Path(file_path).parts
        if not parts:
            return "其他"
        top_level, sub_dir = parts[0], parts[1] if len(parts) > 1 else None
        if top_level == "skills" and sub_dir:
            return {
                "mindset": "认知与心智",
                "learning": "学会学习",
                "communication": "沟通与协作",
                "tools": "工具与系统",
                "growth": "成长与规划",
            }.get(sub_dir, "第零点五课堂")
        return {
            "course": "核心课程",
            "skills": "第零点五课堂",
            "ncu": "昌大专属",
            "guides": "项目共建",
            "before": "开始之前",
            "aboutus": "关于我们",
        }.get(top_level, "其他")

    def assess_content_size(self, char_count: int) -> str:
        if char_count == 0:
            return "空白"
        if char_count < 50:
            return "极少"
        if char_count < 200:
            return "较少"
        if char_count < 500:
            return "适中"
        if char_count < 1000:
            return "较多"
        if char_count < 2000:
            return "丰富"
        return "非常丰富"

    def save_to_csv(self, report_list: List[Dict[str, Any]], output_path_str: str):
        output_path = self.repo_path / output_path_str
        output_path.parent.mkdir(parents=True, exist_ok=True)
        fieldnames = [
            "title",
            "file_path",
            "category",
            "exists",
            "char_count",
            "word_count",
            "line_count",
            "status",
            "completion_level",
            "manual_status",
            "final_status",
            "size_assessment",
        ]
        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(report_list)
        print(f"✅ CSV 报告已保存到：{output_path.relative_to(self.repo_path)}")

    def save_to_markdown(
        self, report_tree: List[Dict], output_path_str: str, commit_info: Dict
    ):
        """将报告树保存为美观的、顶格对齐的 Markdown 文件"""
        output_path = self.repo_path / output_path_str
        output_path.parent.mkdir(parents=True, exist_ok=True)

        header = [
            f"# 内容完成情况报告",
            f"> 报告生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n",
        ]
        if "error" not in commit_info:
            commit_link_md = (
                f"[`{commit_info['short_hash']}`]({commit_info['link']})"
                if commit_info.get("link")
                else f"`{commit_info['short_hash']}`"
            )
            header.extend(
                [
                    "## 报告上下文",
                    f"- **版本来源**: {commit_link_md} - *{commit_info['message']}*",
                    f"- **生成脚本**: `{Path(sys.argv[0]).name}`\n",
                ]
            )
        else:
            header.append(f"_{commit_info['error']}_\n")

        header.extend(
            [
                "## 完成度概览",
                "- `[ ]` 表示待办或内容不足",
                "- `[x]` 表示已完成或内容充实\n",
            ]
        )
        lines = header

        def _render_node_md(node: Dict, level: int):
            # --- 修改点在这里 ---
            if node["type"] == "file":
                is_complete = (
                    node.get("final_status") == "completed"
                    or node.get("status") == "substantial"
                )
                checkbox = "[x]" if is_complete else "[ ]"
                details = (
                    f"{node.get('char_count', 0)}字，{node.get('final_status', '未知')}"
                )
                # 移除缩进
                lines.append(
                    f"- {checkbox} **{node.get('title', '无标题')}** (`{node.get('path', '')}`) - *{details}*"
                )

            elif node["type"] == "section":
                files = self._flatten_report_tree([node])
                total = len(files)
                completed = (
                    sum(
                        1
                        for f in files
                        if f.get("final_status") == "completed"
                        or f.get("status") == "substantial"
                    )
                    if total > 0
                    else 0
                )
                progress = f"({completed}/{total})" if total > 0 else ""
                # 移除缩进，并使用标题级别体现层次
                heading_level = min(level + 2, 6)  # 从##开始，最深到######
                lines.append(
                    f"\n{'#' * heading_level} {node.get('title', '未命名章节')} {progress}"
                )
                if "children" in node:
                    for child in node["children"]:
                        # 递归调用，层级 +1
                        _render_node_md(child, level + 1)

        for root_node in report_tree:
            # 初始层级为 0
            _render_node_md(root_node, 0)

        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))

        print(f"✅ Markdown 报告已保存到：{output_path.relative_to(self.repo_path)}")

    def print_summary(self, report_list: List[Dict[str, Any]]):
        total_files = len(report_list)
        if total_files == 0:
            print("\n=== 完成情况汇总 ===")
            print("没有找到任何文件进行分析。请检查 mkdocs.yml 的 'nav' 配置。")
            return

        existing_files = sum(1 for r in report_list if r.get("exists"))
        substantial_files = sum(
            1 for r in report_list if r.get("status") == "substantial"
        )

        print("\n=== 📊 完成情况汇总 ===")
        print(f"总文件数 (来自 nav): {total_files}")
        print(f"已存在文件：{existing_files} ({existing_files/total_files*100:.1f}%)")
        print(
            f"内容充实的文件 (>{self.good_chars_threshold}字): {substantial_files} ({substantial_files/total_files*100:.1f}%)"
        )


def main():
    parser = argparse.ArgumentParser(
        description="分析 MkDocs 项目的内容完成情况，并生成报告。"
    )
    parser.add_argument(
        "--repo-path", type=str, default=".", help="仓库根目录路径 (默认：当前工作目录)"
    )
    parser.add_argument(
        "--md-output", type=str, help="Markdown 报告的输出路径 (覆盖 pyproject.toml)"
    )
    parser.add_argument(
        "--csv-output", type=str, help="CSV 报告的输出路径 (覆盖 pyproject.toml)"
    )
    parser.add_argument(
        "--min-chars", type=int, help="“内容极少”的字符数阈值 (覆盖配置)"
    )
    parser.add_argument(
        "--good-chars", type=int, help="“内容充实”的字符数阈值 (覆盖配置)"
    )
    parser.add_argument(
        "--quiet", action="store_true", help="静默模式，只输出报告生成信息"
    )

    args = parser.parse_args()

    repo_path = Path(args.repo_path).resolve()
    config = load_config(repo_path, args)
    config["repo_path"] = repo_path

    analyzer = CompletionAnalyzer(config)

    if not args.quiet:
        print(f"🚀 正在分析项目：{repo_path.name}")

    report_tree = analyzer.generate_report_tree()

    if not report_tree:
        print("分析中止，未生成任何报告。", file=sys.stderr)
        return

    report_list = analyzer._flatten_report_tree(report_tree)
    commit_info = get_commit_info(repo_path)

    analyzer.save_to_markdown(report_tree, config["md_output"], commit_info)
    analyzer.save_to_csv(report_list, config["csv_output"])

    if not args.quiet:
        analyzer.print_summary(report_list)
    else:
        print("报告生成完毕。")


if __name__ == "__main__":
    main()
