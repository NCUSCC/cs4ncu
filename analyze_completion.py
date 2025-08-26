#!/usr/bin/env python3
"""
内容完成情况分析脚本

从 mkdocs.yml 和 docs 目录分析每个小节的完成情况，
统计字数并做简单判断，输出 CSV 格式的报告。
"""

import os
import yaml
import csv
import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional


class CompletionAnalyzer:
    def __init__(self, repo_path: str = "."):
        self.repo_path = Path(repo_path)
        self.mkdocs_path = self.repo_path / "mkdocs.yml"
        self.docs_path = self.repo_path / "docs"
        self.skills_index_path = self.docs_path / "skills" / "index.md"
        
        # 字符数阈值，超过此值认为内容较为完整
        self.min_chars_threshold = 50
        self.good_chars_threshold = 500
        
    def load_mkdocs_config(self) -> Dict:
        """加载 mkdocs.yml 配置文件"""
        try:
            with open(self.mkdocs_path, 'r', encoding='utf-8') as f:
                # 使用更宽松的YAML加载器来处理Python标签
                content = f.read()
                # 移除或替换可能导致问题的Python特定标签
                content = re.sub(r'!!python/name:[^\s\n]+', '""', content)
                return yaml.safe_load(content)
        except Exception as e:
            print(f"Error loading mkdocs.yml: {e}")
            return {}
    
    def extract_nav_files(self, nav_structure) -> List[Tuple[str, str]]:
        """从导航结构中提取所有文件路径和标题"""
        files = []
        
        def extract_recursive(nav_item, path_prefix=""):
            if isinstance(nav_item, dict):
                for title, content in nav_item.items():
                    if isinstance(content, str):
                        # 这是一个文件
                        files.append((title, content))
                    elif isinstance(content, list):
                        # 这是一个包含子项的列表
                        for sub_item in content:
                            extract_recursive(sub_item, path_prefix)
                    elif isinstance(content, dict):
                        # 嵌套的字典结构
                        extract_recursive(content, path_prefix)
            elif isinstance(nav_item, list):
                for item in nav_item:
                    extract_recursive(item, path_prefix)
            elif isinstance(nav_item, str):
                # 直接的文件路径
                files.append(("", nav_item))
        
        extract_recursive(nav_structure)
        return files
    
    def parse_todo_checklist(self) -> Dict[str, bool]:
        """解析 skills/index.md 中的 TODO 清单，获取手动标记的完成状态"""
        todo_status = {}
        
        try:
            with open(self.skills_index_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # 查找所有的任务清单项
            # 匹配模式: - [x] 或 - [ ] 后跟任务描述和文件路径
            # 支持多种格式：`标题` (`路径`) 或 **`标题`** (`路径`)
            pattern = r'- \[([ x])\]\s*(?:\*\*)?[`"]?([^`"]*?)[`"]?(?:\*\*)?\s*\(`([^)]+)`\)'
            matches = re.findall(pattern, content, re.MULTILINE)
            
            for is_done, title, file_path in matches:
                status = is_done.lower() == 'x'
                todo_status[file_path] = status
                
        except Exception as e:
            print(f"Warning: Could not parse TODO checklist: {e}")
            
        return todo_status
    
    def analyze_file(self, file_path: str) -> Dict[str, any]:
        """分析单个文件的完成情况"""
        full_path = self.docs_path / file_path
        
        result = {
            'file_path': file_path,
            'exists': False,
            'char_count': 0,
            'word_count': 0,
            'line_count': 0,
            'status': 'missing',
            'completion_level': 'none'
        }
        
        if full_path.exists() and full_path.is_file():
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                result['exists'] = True
                result['char_count'] = len(content)
                result['word_count'] = len(content.split())
                result['line_count'] = len(content.splitlines())
                
                # 根据内容长度判断完成程度
                if result['char_count'] == 0:
                    result['status'] = 'empty'
                    result['completion_level'] = 'none'
                elif result['char_count'] < self.min_chars_threshold:
                    result['status'] = 'minimal'
                    result['completion_level'] = 'low'
                elif result['char_count'] < self.good_chars_threshold:
                    result['status'] = 'basic'
                    result['completion_level'] = 'medium'
                else:
                    result['status'] = 'substantial'
                    result['completion_level'] = 'high'
                    
            except Exception as e:
                print(f"Error reading file {file_path}: {e}")
                result['status'] = 'error'
        
        return result
    
    def generate_report(self) -> List[Dict[str, any]]:
        """生成完整的分析报告"""
        # 加载配置
        config = self.load_mkdocs_config()
        nav_structure = config.get('nav', [])
        
        # 提取所有文件
        nav_files = self.extract_nav_files(nav_structure)
        
        # 解析 TODO 清单
        todo_status = self.parse_todo_checklist()
        
        # 分析每个文件
        report = []
        processed_files = set()
        
        for title, file_path in nav_files:
            if file_path in processed_files:
                continue
            processed_files.add(file_path)
            
            analysis = self.analyze_file(file_path)
            analysis['title'] = title
            
            # 添加分类信息
            analysis['category'] = self.categorize_file(file_path)
            
            # 添加 TODO 清单中的手动标记状态
            analysis['manual_status'] = todo_status.get(file_path, None)
            
            # 综合判断最终状态
            if analysis['manual_status'] is True:
                analysis['final_status'] = 'completed'
            elif analysis['manual_status'] is False:
                analysis['final_status'] = 'todo'
            else:
                analysis['final_status'] = analysis['status']
            
            # 添加大小评估
            analysis['size_assessment'] = self.assess_content_size(analysis['char_count'])
            
            report.append(analysis)
        
        return report
    
    def categorize_file(self, file_path: str) -> str:
        """根据文件路径对文件进行分类"""
        if file_path.startswith('course/'):
            return '核心课程'
        elif file_path.startswith('skills/'):
            if 'mindset/' in file_path:
                return '认知与心智'
            elif 'learning/' in file_path:
                return '学会学习'
            elif 'communication/' in file_path:
                return '沟通与协作'
            elif 'tools/' in file_path:
                return '工具与系统'
            elif 'growth/' in file_path:
                return '成长与规划'
            else:
                return '第零点五课堂'
        elif file_path.startswith('ncu/'):
            return '昌大专属'
        elif file_path.startswith('guides/'):
            return '项目共建'
        elif file_path.startswith('before/'):
            return '开始之前'
        elif file_path.startswith('aboutus/'):
            return '关于我们'
        else:
            return '其他'
    
    def assess_content_size(self, char_count: int) -> str:
        """评估内容大小"""
        if char_count == 0:
            return '空白'
        elif char_count < 50:
            return '极少'
        elif char_count < 200:
            return '较少'
        elif char_count < 500:
            return '适中'
        elif char_count < 1000:
            return '较多'
        elif char_count < 2000:
            return '丰富'
        else:
            return '非常丰富'
    
    def save_to_csv(self, report: List[Dict[str, any]], output_path: str = "completion_report.csv"):
        """将报告保存为 CSV 文件"""
        fieldnames = [
            'title', 'file_path', 'category', 'exists', 'char_count', 'word_count', 
            'line_count', 'status', 'completion_level', 'manual_status', 
            'final_status', 'size_assessment'
        ]
        
        with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(report)
        
        print(f"报告已保存到: {output_path}")
    
    def print_summary(self, report: List[Dict[str, any]]):
        """打印汇总统计"""
        total_files = len(report)
        if total_files == 0:
            print("\n=== 完成情况汇总 ===")
            print("没有找到任何文件进行分析")
            return
            
        existing_files = sum(1 for r in report if r['exists'])
        completed_files = sum(1 for r in report if r['final_status'] == 'completed')
        substantial_files = sum(1 for r in report if r['status'] == 'substantial')
        
        print("\n=== 完成情况汇总 ===")
        print(f"总文件数: {total_files}")
        print(f"已存在文件: {existing_files} ({existing_files/total_files*100:.1f}%)")
        print(f"手动标记为完成: {completed_files} ({completed_files/total_files*100:.1f}%)")
        print(f"内容充实的文件: {substantial_files} ({substantial_files/total_files*100:.1f}%)")
        
        print(f"\n按完成程度分类:")
        status_counts = {}
        for r in report:
            status = r['final_status']
            status_counts[status] = status_counts.get(status, 0) + 1
        
        for status, count in sorted(status_counts.items()):
            print(f"  {status}: {count}")
        
        # 按分类统计
        print(f"\n按内容分类统计:")
        category_stats = {}
        for r in report:
            cat = r['category']
            if cat not in category_stats:
                category_stats[cat] = {'total': 0, 'completed': 0, 'substantial': 0}
            category_stats[cat]['total'] += 1
            if r['final_status'] == 'completed':
                category_stats[cat]['completed'] += 1
            if r['status'] == 'substantial':
                category_stats[cat]['substantial'] += 1
        
        for category, stats in sorted(category_stats.items()):
            total = stats['total']
            completed = stats['completed']
            substantial = stats['substantial']
            print(f"  {category}: {total}篇 (完成: {completed}, 充实: {substantial})")
        
        # 统计需要关注的文件
        print(f"\n需要关注的文件:")
        empty_files = [r for r in report if r['status'] == 'empty']
        minimal_files = [r for r in report if r['status'] == 'minimal']
        todo_files = [r for r in report if r['final_status'] == 'todo' and r['char_count'] < self.good_chars_threshold]
        
        if empty_files:
            print(f"  空白文件 ({len(empty_files)}个):")
            for f in empty_files[:5]:  # 只显示前5个
                print(f"    - {f['title']} ({f['file_path']})")
        
        if minimal_files:
            print(f"  内容极少文件 ({len(minimal_files)}个):")
            for f in minimal_files[:5]:  # 只显示前5个
                print(f"    - {f['title']} ({f['file_path']}) - {f['char_count']}字符")
        
        if todo_files:
            print(f"  待完成且内容不足文件 ({len(todo_files)}个):")
            for f in todo_files[:5]:  # 只显示前5个
                print(f"    - {f['title']} ({f['file_path']}) - {f['char_count']}字符")


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='分析cs4ncu文档项目的内容完成情况')
    parser.add_argument('--repo-path', default='.', help='仓库路径 (默认: 当前目录)')
    parser.add_argument('--output', default='completion_report.csv', help='输出CSV文件路径')
    parser.add_argument('--min-chars', type=int, default=50, help='最小字符数阈值')
    parser.add_argument('--good-chars', type=int, default=500, help='充实内容字符数阈值')
    parser.add_argument('--quiet', action='store_true', help='只输出关键信息')
    
    args = parser.parse_args()
    
    analyzer = CompletionAnalyzer(args.repo_path)
    analyzer.min_chars_threshold = args.min_chars
    analyzer.good_chars_threshold = args.good_chars
    
    if not args.quiet:
        print("开始分析内容完成情况...")
        
    report = analyzer.generate_report()
    
    # 保存 CSV 报告
    analyzer.save_to_csv(report, args.output)
    
    # 打印汇总信息
    if not args.quiet:
        analyzer.print_summary(report)
        
        # 显示部分详细信息
        print(f"\n=== 详细信息（前10项）===")
        for i, item in enumerate(report[:10]):
            print(f"{i+1}. {item['title']} ({item['file_path']})")
            print(f"   状态: {item['final_status']}, 字符数: {item['char_count']}")
    else:
        # 简化输出
        total_files = len(report)
        completed = sum(1 for r in report if r['final_status'] == 'completed')
        substantial = sum(1 for r in report if r['status'] == 'substantial')
        print(f"总计: {total_files}篇, 完成: {completed}篇, 充实: {substantial}篇")
        print(f"CSV报告已保存: {args.output}")


if __name__ == "__main__":
    main()