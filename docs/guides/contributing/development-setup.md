---
tags:
  - 开发环境
  - 贡献指南
  - uv
  - Python
---

# 搭建开发环境

为了能够实时预览您对文档的修改，或参与网站功能的开发，您需要在本地搭建开发环境。

我们使用了一系列现代化工具来确保开发体验的流畅与高效。请跟随以下步骤，只需几分钟，您就可以将 `CS for NCU` 项目在您的电脑上运行起来。

## 第一步：准备基础工具

在开始之前，请确保您的系统中已经安装了以下两个核心工具：

1.  **Git**
    Git 是一个开源的分布式版本控制系统，是我们协作的基石。如果您尚未安装，请访问 [Git 官网](https://git-scm.com/) 下载并安装。

2.  **uv**
    `uv` 是一个用 Rust 编写的极速 Python 包管理器。它将极大简化我们的环境管理。请参考 [uv 官方文档](https://github.com/astral-sh/uv#installation) 完成安装。

## 第二步：Fork 与克隆项目

在开始编码前，您需要先将官方仓库 Fork 到您自己的 GitHub 账户下。这会创建一份您拥有完全写入权限的项目副本，方便您后续提交 Pull Request。

1.  **Fork 官方仓库**
    请访问 [NCUSCC/cs4ncu](https://github.com/NCUSCC/cs4ncu/) 仓库主页，点击页面右上角的 **Fork** 按钮。

2.  **克隆您的 Fork**
    完成后，将您 Fork 后的仓库克隆到本地。请注意将 `YOUR_USERNAME` 替换为您的 GitHub 用户名。
    ```bash
    git clone https://github.com/YOUR_USERNAME/cs4ncu.git
    ```

## 第三步：配置环境并启动服务

当项目克隆到本地后，请打开您的终端 (Terminal) 或命令行工具，并依次执行以下命令：

1.  **进入项目目录**
    ```bash
    cd cs4ncu
    ```

2.  **同步开发环境**
    这条命令是关键，它会自动为您创建专属的虚拟环境 (Virtual Environment) 并安装所有必需的依赖包。
    ```bash
    uv sync
    ```
    ??? example "“魔法”命令解析：uv sync"
        `uv sync` 命令会读取项目中的 `requirements.lock` 文件，并执行以下操作：

        -   **创建虚拟环境**：在项目根目录下的 `.venv` 文件夹中创建一个隔离的 Python 环境，避免与您的系统环境产生冲突。
        -   **安装依赖**：以最快的速度精确地安装所有项目依赖，例如 MkDocs 及其相关插件。

        这一切都是自动完成的，您无需手动操作 `venv` 或 `pip`。

3.  **启动本地预览服务器**
    一切就绪！运行以下命令来启动实时预览服务。
    ```bash
    uv run mkdocs serve
    ```

!!! success "大功告成！"
    当您在终端看到类似以下的输出时，就代表本地服务器已成功启动：
    ```text
    INFO    -  Building documentation...
    INFO    -  Documentation built in 0.78 seconds
    INFO    -  [20:52:55] Watching paths for changes: 'docs', 'mkdocs.yml'
    INFO    -  [20:52:55] Serving on http://127.0.0.1:8000/cs4ncu/
    ```
    现在，请在您的浏览器中访问 [http://127.0.0.1:8000/cs4ncu/](http://127.0.0.1:8000/cs4ncu/)，您应该能看到与线上版本完全一致的网站了。

!!! tip "热重载 (Hot Reloading)"
    本地服务器带有一个非常方便的功能：热重载。

    这意味着当您修改并保存项目中的任何 `.md` 文件时，浏览器中的页面都会自动刷新，实时展示您的最新修改，无需手动重启服务器。