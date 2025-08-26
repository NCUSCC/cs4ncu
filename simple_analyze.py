#!/usr/bin/env python3
"""
简单粗暴的内容完成情况分析脚本

根据用户需求："用比较粗暴的办法，从 mkdocs.yml 中或者 docs 文档下判断每个小节的完成情况，
统计字数，做一个简单判断（比如超没超过 50 个字符），最后输出一个 csv"
"""

import os
import yaml
import csv
import re
from pathlib import Path


def parse_mkdocs_nav(mkdocs_path="mkdocs.yml"):
    """粗暴解析 mkdocs.yml 获取所有文档路径"""
    file_paths = []
    
    try:
        with open(mkdocs_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # 移除Python特定标签以避免YAML解析错误
            content = re.sub(r'!!python/name:[^\s\n]+', '""', content)
            config = yaml.safe_load(content)
            
        def extract_files(nav_item):
            """递归提取文件路径"""
            if isinstance(nav_item, dict):
                for key, value in nav_item.items():
                    if isinstance(value, str) and value.endswith('.md'):
                        file_paths.append((key, value))
                    elif isinstance(value, (list, dict)):
                        extract_files(value)
            elif isinstance(nav_item, list):
                for item in nav_item:
                    extract_files(item)
                    
        nav = config.get('nav', [])
        extract_files(nav)
        
    except Exception as e:
        print(f"警告: 无法解析 mkdocs.yml: {e}")
        
    return file_paths


def scan_docs_directory(docs_path="docs"):
    """粗暴扫描 docs 目录获取所有 .md 文件"""
    file_paths = []
    docs_dir = Path(docs_path)
    
    if docs_dir.exists():
        for md_file in docs_dir.rglob("*.md"):
            relative_path = str(md_file.relative_to(docs_dir))
            title = md_file.stem.replace('-', ' ').replace('_', ' ').title()
            file_paths.append((title, relative_path))
    
    return file_paths


def analyze_file_simple(file_path, docs_path="docs"):
    """粗暴分析单个文件"""
    full_path = Path(docs_path) / file_path
    
    if not full_path.exists():
        return {
            'char_count': 0,
            'word_count': 0,
            'over_50_chars': False,
            'status': 'missing'
        }
    
    try:
        content = full_path.read_text(encoding='utf-8')
        char_count = len(content)
        word_count = len(content.split())
        
        return {
            'char_count': char_count,
            'word_count': word_count,
            'over_50_chars': char_count > 50,
            'status': 'exists' if char_count > 0 else 'empty'
        }
    except Exception as e:
        return {
            'char_count': 0,
            'word_count': 0,
            'over_50_chars': False,
            'status': 'error'
        }


def parse_todo_simple(skills_index_path="docs/skills/index.md"):
    """粗暴解析 TODO 清单"""
    todo_status = {}
    
    try:
        with open(skills_index_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 查找 [x] 和 [ ] 模式
        lines = content.split('\n')
        for line in lines:
            if '- [x]' in line or '- [ ]' in line:
                # 查找是否包含文件路径
                if '(`' in line and '`)' in line:
                    is_done = '- [x]' in line
                    start = line.find('(`') + 2
                    end = line.find('`)', start)
                    if start > 1 and end > start:
                        file_path = line[start:end]
                        todo_status[file_path] = is_done
                        
    except Exception as e:
        print(f"警告: 无法解析TODO清单: {e}")
        
    return todo_status


def main():
    """主函数：用粗暴的方法分析内容完成情况"""
    print("开始粗暴分析...")
    
    # 1. 从 mkdocs.yml 获取文件列表
    nav_files = parse_mkdocs_nav()
    print(f"从 mkdocs.yml 找到 {len(nav_files)} 个文件")
    
    # 2. 扫描 docs 目录（备用方案）
    docs_files = scan_docs_directory()
    print(f"从 docs 目录扫描到 {len(docs_files)} 个文件")
    
    # 3. 合并去重
    all_files = {}
    for title, path in nav_files + docs_files:
        if path not in all_files:
            all_files[path] = title
    
    print(f"总共需要分析 {len(all_files)} 个文件")
    
    # 4. 解析 TODO 清单
    todo_status = parse_todo_simple()
    print(f"解析到 {len(todo_status)} 个TODO项目")
    
    # 5. 分析每个文件
    results = []
    for file_path, title in all_files.items():
        analysis = analyze_file_simple(file_path)
        
        result = {
            'title': title,
            'file_path': file_path,
            'char_count': analysis['char_count'],
            'word_count': analysis['word_count'],
            'over_50_chars': analysis['over_50_chars'],
            'status': analysis['status'],
            'todo_marked': todo_status.get(file_path, None),
        }
        
        # 简单判断完成情况
        if result['todo_marked'] is True:
            result['completion'] = 'completed'
        elif result['todo_marked'] is False:
            result['completion'] = 'todo'
        elif result['over_50_chars']:
            result['completion'] = 'has_content'
        else:
            result['completion'] = 'insufficient'
            
        results.append(result)
    
    # 6. 输出 CSV
    output_file = 'simple_completion_report.csv'
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = [
            'title', 'file_path', 'char_count', 'word_count', 
            'over_50_chars', 'status', 'todo_marked', 'completion'
        ]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)
    
    print(f"\nCSV 报告已保存到: {output_file}")
    
    # 7. 简单统计
    total = len(results)
    over_50 = sum(1 for r in results if r['over_50_chars'])
    completed = sum(1 for r in results if r['completion'] == 'completed')
    todo = sum(1 for r in results if r['completion'] == 'todo')
    
    print(f"\n=== 粗暴统计结果 ===")
    print(f"总文件数: {total}")
    print(f"超过50字符: {over_50} ({over_50/total*100:.1f}%)")
    print(f"标记为完成: {completed}")
    print(f"标记为待办: {todo}")
    print(f"有内容但未标记: {total - completed - todo}")


if __name__ == "__main__":
    main()