<div align="center">

  <!-- Logo for 寻路之南 can be placed here once designed -->
  <!-- <img src="docs/assets/logo.png" alt="寻路之南 Logo" width="150"/> -->

  # 寻路之南
  ### 写给普通人的大学成长指南

  由一群普通本科生发起的开源项目，致力于分享一套从自我认知开始的成长方法论。<br>我们始于南昌大学，但这份指南属于每一位渴望主动把握大学生涯的你。

  [![GitHub Stars](https://img.shields.io/github/stars/NCUSCC/cs4ncu.svg?style=flat-square)](https://github.com/NCUSCC/cs4ncu/stargazers)
  [![GitHub Forks](https://img.shields.io/github/forks/NCUSCC/cs4ncu.svg?style=flat-square)](https://github.com/NCUSCC/cs4ncu/network/members)
  [![GitHub Issues](https://img.shields.io/github/issues/NCUSCC/cs4ncu.svg?style=flat-square)](https://github.com/NCUSCC/cs4ncu/issues)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](/LICENSE)

</div>

---

### 我们的故事与初心

我们曾仰望过《上海交通大学生存手册》那样的精英灯塔，但很快发现，他们的航线固然璀璨，其起点、风速、洋流都与我们不同。我们需要一份更具普适性的海图，一套更基础、更关注内在的航行方法。

我们为这份初心，取名为“寻路之南” 。它是一份“寻路者的指南”，也是一场始于南昌大学的探索。它承载着我们的起点，也指向我们共同的目标：在迷雾中，为自己找到南方——那个温暖、清晰、充满生命力的方向。

这个位置，让我们得以摆脱纯粹的精英视角或自怨自艾的受害者心态。它让我们相信，我们的故事——**一个关于在还不错的平台上，如何通过自我认知与系统构建，来超越平台局限的故事**——对最广大的学生群体，具有最真实的参考意义。

这就是我们的立足点：不仰望神坛，也不俯视深渊，只是脚踏实地，与每一个努力向上的你同行。

---

### 在线阅读

**我们强烈建议您在线阅读，以获得最佳体验。**

**➡️ [https://ncuscc.github.io/cs4ncu/](https://ncuscc.github.io/cs4ncu/)**（https://cs4ncu.space/ 域名已过期，暂时使用原始域名）

---

### 内容结构

本指南主要由以下几个核心部分构成，我们建议您从“寻路指南”开始。

| 模块 | 核心内容 |
| :--- | :--- |
| **开始之前** | **建议从这里开始。** 这里有写给新读者的第一封信 (`第负一课`)，以及一份网站的完整地图 (`全站导览`)。|
| **核心课程** | 本项目的主体。包括了作为基石的 **`本科生通识第零课`** 和作为拓展的 **`第零点五课堂`**。 |
| **昌大专属** | 沉淀了独属于南昌大学的实用信息与经验，例如转专业、保研考研等。 |
| **关于我们** | 你可以在这里找到我们的完整初心、项目共建指南和内容索引。 |

---

### 本地开发与贡献

如果你希望在本地运行、修改网站，或参与项目共建，欢迎继续阅读。

1.  **环境准备**
    *   安装 [Git](https://git-scm.com/)
    *   安装 [uv](https://github.com/astral-sh/uv#installation) (一个极速的 Python 包管理器)

2.  **克隆并进入项目**
    ```bash
    git clone https://github.com/NCUSCC/cs4ncu.git
    cd cs4ncu
    ```

3.  **同步环境**
    ```bash
    uv sync
    ```

4.  **启动！**
    ```bash
    uv run mkdocs serve
    ```
    在浏览器中打开 `http://127.0.0.1:8000` 即可。

#### 使用 Docker 运行

无需安装本地 Python/uv，直接用 Docker 预览站点：

```bash
# 方式一：docker compose（推荐，热更新）
docker compose up --build

# 方式二：纯 docker
docker build -t cs4ncu-docs .
docker run --rm -it -p 8000:8000 -v $(pwd):/app \
  -e ENABLE_COMMITTERS=${ENABLE_COMMITTERS:-false} \
  -e GITHUB_TOKEN=${GITHUB_TOKEN:-} \
  cs4ncu-docs
```

打开 `http://127.0.0.1:8000` 访问。若需启用 `git-committers` 插件，请设置环境变量：

```bash
export ENABLE_COMMITTERS=true
export GITHUB_TOKEN=你的GitHubToken
```

### 欢迎参与共建

`寻路之南` 的成长离不开每一位社区成员的贡献。我们欢迎任何形式的帮助！

| 贡献方式 | 如何开始 |
| :--- | :--- |
| **内容创作** | 修正错别字、完善现有章节、撰写全新内容。 |
| **提出建议** | 发现内容问题或有新的想法？请大胆地 [**提出 Issue**](https://github.com/NCUSCC/cs4ncu/issues/new/choose)！ |
| **代码贡献** | 帮助我们优化网站功能、修复 Bug、改进自动化流程。 |

不确定从哪里开始？我们为你准备了适合新手的任务 👉 [**`good first issue`**](https://github.com/NCUSCC/cs4ncu/labels/good%20first%20issue)

> 每一次微小的贡献，都在点亮更多人前行的道路。

### 我们的贡献者

我们由衷感谢每一位为本项目注入心血的贡献者。

<a href="https://github.com/NCUSCC/cs4ncu/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=NCUSCC/cs4ncu" alt="Contributors" />
</a>

*(由 [contrib.rocks](https://contrib.rocks) 自动生成)*

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=NCUSCC/cs4ncu&type=Date)](https://www.star-history.com/#NCUSCC/cs4ncu&Date)

### 开源协议

本项目基于 [**MIT License**](./LICENSE) 授权。

---

<div align="center">

*Crafted with ❤️ and ☕ by the community.*

</div>
