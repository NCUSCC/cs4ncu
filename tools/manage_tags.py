# ==============================================================================
#  Universal Tag Manager for cs4ncu
#  Version: 3.0 (Intelligent Edition)
#  Author: GitHub Copilot (guided by ywh555hhh)
#  Date: 2025-08-27
#
#  Standard entrypoint: `uv run mtag`
#  Generated output: `docs/tags.md`，请勿手动编辑。
#
#  Features:
#  - Strict format and prefix validation.
#  - Canonical case validation for all tags.
#  - Fuzzy matching to detect and suggest corrections for typos.
#  - Interactive 'sync' mode for management.
#  - Non-interactive 'check' mode for CI/CD.
#  - Automatic regeneration of the tags index file.
#
#  Dependencies: PyYAML, python-frontmatter, rapidfuzz
# ==============================================================================

import sys
import yaml
import frontmatter
from pathlib import Path
from collections import defaultdict
from rapidfuzz import fuzz, process

# --- 配置 (Configuration) ---
ROOT_DIR = Path(__file__).parent.parent
DOCS_DIR = ROOT_DIR / "docs"
TAG_DICTIONARY_FILE = ROOT_DIR / "tag_dictionary.yml"
TAGS_INDEX_FILE = DOCS_DIR / "tags.md"
FUZZY_MATCH_THRESHOLD = 80  # 相似度阈值 (0-100), 80 是一个比较好的起点
# ---


def load_tag_dictionary() -> tuple[dict, set, set, dict]:
    """
    加载标签词典。
    返回:
        - 原始字典。
        - 所有合法标签的集合 (区分大小写)。
        - 所有合法前缀的集合。
        - 从小写标签到其官方大小写形式的映射字典。
    """
    if not TAG_DICTIONARY_FILE.exists():
        print(f"❌ 错误：标签词典文件未找到：{TAG_DICTIONARY_FILE}")
        sys.exit(1)

    with open(TAG_DICTIONARY_FILE, "r", encoding="utf-8") as f:
        dictionary = yaml.safe_load(f)

    all_valid_tags = set()
    valid_prefixes = set(dictionary.keys())
    lowercase_to_canonical_map = {}

    for tags in dictionary.values():
        if tags:
            for tag in tags:
                all_valid_tags.add(tag)
                lowercase_to_canonical_map[tag.lower()] = tag

    print(
        f"📖 从 {TAG_DICTIONARY_FILE} 加载了 {len(all_valid_tags)} 个合法标签和 {len(valid_prefixes)} 个前缀。"
    )
    return dictionary, all_valid_tags, valid_prefixes, lowercase_to_canonical_map


def find_best_fuzzy_match(tag: str, all_valid_tags: list) -> tuple[str | None, int]:
    """使用模糊匹配为未知标签寻找最佳建议。"""
    if not all_valid_tags:
        return None, 0
    # WRatio 对于处理不同长度的字符串非常有效
    best_match, score, _ = process.extractOne(tag, all_valid_tags, scorer=fuzz.WRatio)
    if score >= FUZZY_MATCH_THRESHOLD:
        return best_match, int(score)
    return None, 0


def validate_and_find_issues(
    all_valid_tags: set, valid_prefixes: set, lowercase_map: dict
) -> tuple[dict, dict, dict]:
    """
    扫描所有 MD 文件并发现三类问题:
    1. 格式错误的标签 (malformed_tags)
    2. 大小写错误的标签 (case_error_tags)
    3. 未知标签 (unknown_tags), 可能包含拼写建议
    """
    print("\n🔍 开始扫描 Markdown 文件以寻找标签问题...")
    malformed_tags = defaultdict(list)
    case_error_tags = defaultdict(list)
    unknown_tags = {}

    valid_tags_list = list(all_valid_tags)

    for md_file in DOCS_DIR.rglob("*.md"):
        if md_file.samefile(TAGS_INDEX_FILE):
            continue
        try:
            post = frontmatter.load(md_file)
            tags_in_file = post.get("tags")
            if not tags_in_file or not isinstance(tags_in_file, list):
                continue

            relative_path = str(md_file.relative_to(ROOT_DIR))

            for tag in tags_in_file:
                # 阶段一：格式验证
                parts = tag.split("-", 1)
                if (
                    len(parts) != 2
                    or not parts[0]
                    or not parts[1]
                    or parts[0] not in valid_prefixes
                ):
                    malformed_tags[tag].append(relative_path)
                    continue

                # 阶段二：精确匹配和大小写验证
                if tag in all_valid_tags:
                    continue
                if tag.lower() in lowercase_map:
                    canonical = lowercase_map[tag.lower()]
                    if tag not in case_error_tags:
                        case_error_tags[tag] = {"files": [], "canonical": canonical}
                    case_error_tags[tag]["files"].append(relative_path)
                    continue

                # 阶段三：未知标签，进行模糊匹配
                if tag not in unknown_tags:
                    suggestion, score = find_best_fuzzy_match(tag, valid_tags_list)
                    unknown_tags[tag] = {
                        "files": [],
                        "suggestion": suggestion,
                        "score": score,
                    }
                unknown_tags[tag]["files"].append(relative_path)

        except Exception as e:
            print(f"⚠️ 在处理文件 {md_file} 时发生错误：{e}")
            pass

    print(
        f"🏁 扫描完成。发现 {len(malformed_tags)} 个格式错误，{len(case_error_tags)} 个大小写错误，以及 {len(unknown_tags)} 个未知标签。"
    )
    return malformed_tags, case_error_tags, unknown_tags


def report_critical_errors(malformed_tags: dict, case_error_tags: dict) -> bool:
    """报告需要手动修复的严重错误（格式和大小写）。"""
    has_errors = False
    if malformed_tags:
        has_errors = True
        print("\n--- 🚨 严重错误：发现格式不规范的标签 ---")
        print("这些标签不符合 '前缀 - 值' 规范，或者前缀无效。请务必手动修正它们！")
        for tag, files in malformed_tags.items():
            print(f"\n- 格式错误的标签：[ {tag} ]")
            print(f"  出现在：{', '.join(files)}")
        print("\n----------------------------------------")

    if case_error_tags:
        has_errors = True
        print("\n--- 🚨 严重错误：发现大小写不正确的标签 ---")
        print("这些标签已在词典中定义，但大小写不匹配。请修正为官方形式。")
        for tag, details in case_error_tags.items():
            canonical_version = details["canonical"]
            file_list = details["files"]
            print(f"\n- 错误形式：[ {tag} ] (正确形式应为：[ {canonical_version} ])")
            print(f"  出现在：{', '.join(file_list)}")
        print("\n----------------------------------------")

    return has_errors


def interactive_unknown_tag_management(unknown_tags: dict, dictionary: dict) -> bool:
    """交互式地管理未知标签，提供智能建议。"""
    if not unknown_tags:
        return False

    print("\n--- 交互式未知标签管理 ---")
    dictionary_changed = False

    for tag, details in unknown_tags.items():
        files = details["files"]
        suggestion = details["suggestion"]
        score = details["score"]

        print(f"\n❓ 发现未知标签：[ {tag} ]")
        print(f"   出现在：{', '.join(sorted(list(set(files))))}")

        options = "[a]dd as new, [i]gnore"
        if suggestion:
            print(f"   🤔 你是不是想输入 '{suggestion}'？ (相似度：{score}%)")
            options = f"[r]eplace, {options}"

        choice = input(f"   请选择：({options}): ").lower()

        if choice == "i":
            continue

        elif choice == "a":
            prefix = tag.split("-")[0]
            if prefix in dictionary:
                dictionary.setdefault(prefix, []).append(tag)
                print(f"   ✅ 已将新标签 '{tag}' 添加到 '{prefix}' 分类。")
                dictionary_changed = True
            else:
                print(f"   ❌ 无法添加，前缀 '{prefix}' 无效。")

        elif choice == "r" and suggestion:
            print(f"   👉 请在以上文件中，手动将 '{tag}' 修改为 '{suggestion}'。")
            print(f"   这是一个安全措施，防止脚本意外修改你的文件内容。")

    if dictionary_changed:
        print(f"\n💾 正在保存新添加的标签到 {TAG_DICTIONARY_FILE}...")
        for category in dictionary:
            if dictionary[category]:
                dictionary[category] = sorted(list(set(dictionary[category])))
        with open(TAG_DICTIONARY_FILE, "w", encoding="utf-8") as f:
            yaml.dump(dictionary, f, allow_unicode=True, sort_keys=False, indent=2)

    return dictionary_changed


def generate_index_file(dictionary: dict):
    """根据标签词典重新生成 docs/tags.md。"""
    print(f"\n🚀 正在生成新的标签索引文件：{TAGS_INDEX_FILE}...")
    content = """<!-- 本页为生成文件，请勿手动编辑。如需更新，请运行 `uv run mtag sync`。 -->
# 标签索引

这里是本站点的所有内容标签，按不同维度进行分类展示。您可以点击任意标签，查看所有关联的文章。

---
"""
    category_map = {
        "Topic": "📚 按主题 (Topic)",
        "Type": "📄 按类型 (Type)",
        "Level": "📈 按级别 (Level)",
        "Action": "⚡️ 按行为 (Action)",
        "Context": "🎯 按场景 (Context)",
    }

    for category, header in category_map.items():
        if category in dictionary and dictionary[category]:
            content += f"\n## {header}\n\n"
            sorted_tags = sorted(dictionary[category])
            tags_list_str = ""
            for i, tag in enumerate(sorted_tags):
                tags_list_str += f'"{tag}"'
                if i < len(sorted_tags) - 1:
                    tags_list_str += ", "
                if (i + 1) % 5 == 0 and len(sorted_tags) > 5:
                    tags_list_str += "\n"
            content += (
                f"<!-- material/tags {{ include: [\n{tags_list_str}\n] }} -->\n\n---\n"
            )

    with open(TAGS_INDEX_FILE, "w", encoding="utf-8") as f:
        f.write(content)
    print("✅ 标签索引文件生成完毕！")


def main_sync():
    """“同步”模式：完整地发现、报告、交互式管理并生成所有内容。"""
    dictionary, all_valid, prefixes, lower_map = load_tag_dictionary()
    malformed, case_errors, unknown = validate_and_find_issues(
        all_valid, prefixes, lower_map
    )

    has_critical_errors = report_critical_errors(malformed, case_errors)
    if has_critical_errors:
        print("\n❗️ 请先修正以上格式和大小写错误，然后再重新运行脚本。")
        sys.exit(1)

    if not unknown:
        print("\n✨ 未发现新的未知标签。所有标签均符合规范。")
        if sys.stdin.isatty():
            choice = input("   是否需要强制重新生成 tags.md 文件？([y]es/[n]o): ").lower()
            if choice == "y":
                generate_index_file(dictionary)
        else:
            print("   检测到非交互环境，自动重新生成 tags.md 文件。")
            generate_index_file(dictionary)
        return

    dictionary_changed = interactive_unknown_tag_management(unknown, dictionary)

    if dictionary_changed:
        final_dictionary, _, _, _ = load_tag_dictionary()
        generate_index_file(final_dictionary)
    else:
        print("\nℹ️ 你未添加任何新标签，因此词典和索引文件未被更新。")


def main_check():
    """“检查”模式：仅报告错误，用于 CI。"""
    print("--- 正在以 'check' 模式运行 ---")
    dictionary, all_valid, prefixes, lower_map = load_tag_dictionary()
    malformed, case_errors, unknown = validate_and_find_issues(
        all_valid, prefixes, lower_map
    )

    has_critical_errors = report_critical_errors(malformed, case_errors)
    has_unknown = bool(unknown)

    if has_unknown:
        print("\n--- 🟡 警告：发现未在词典中定义的标签 ---")
        for tag, details in unknown.items():
            suggestion_text = ""
            if details["suggestion"]:
                suggestion_text = f" (你是不是想写：{details['suggestion']}?)"
            print(f"- 未知标签：[ {tag} ]{suggestion_text}")
            print(f"  出现在：{', '.join(details['files'])}")
        print("\n----------------------------------------")

    if has_critical_errors or has_unknown:
        print(
            "\n💡 检查失败。请在本地运行 `uv run mtag sync` 来处理这些问题。"
        )
        sys.exit(1)
    else:
        print("\n--- 标签健康检查报告 ---")
        print("🎉 恭喜！所有文件的标签都符合规范。")
        sys.exit(0)


def main():
    """主路由器，根据命令行参数选择执行模式。"""
    args = sys.argv[1:]
    if "check" in args:
        main_check()
    elif "sync" in args:
        main_sync()
    else:
        print("ℹ️ 未指定模式，默认执行 'sync' 交互模式。")
        print("   (可使用 'check' 模式进行 CI 检查)")
        main_sync()


if __name__ == "__main__":
    main()
