---
tags:
  - Level-Beginner
  - Type-Guide
  - Topic-Git
  - Topic-GitHub
---

# 打卡指南：完成你的第一次贡献

!!! reminder "欢迎加入我们！"
    你好！这份指南将手把手教你如何通过在“打卡墙”留言，来完成一次标准的 GitHub 开源贡献。

    别担心，整个过程并不复杂。我们会把步骤拆解得很详细，跟着做就行了。这不仅是一次简单的“打卡”，更是一次非常有用的技能练习。学会这个流程，你就能参与到许多其他优秀的开源项目中去。

---

## 准备工作

!!! declaration "开始前的必备条件"
    在开始之前，请确保你已准备好以下两项：

    1.  **一个 GitHub 账号**
        整个贡献流程都将围绕 GitHub 进行。如果你还没有账号，可以前往 [GitHub 官网](https://github.com/signup) 免费注册。

    2.  **Git 环境**
        请确保你的电脑上已经安装了 [Git](https://git-scm.com/downloads)。它是一个强大的版本控制工具，也是参与开源协作的基石。

---

## 分步指南：完成你的贡献

### 第 1 步：Fork 项目 (复制一份到你的名下)

1.  打开 `CS for NCU` 的 GitHub 仓库：[https://github.com/NCUSCC/cs4ncu](https://github.com/NCUSCC/cs4ncu)
2.  点击页面右上角的 **Fork** 按钮。
3.  这会把整个项目复制一份到你自己的 GitHub 账号下。你可以把这个“副本”看作你的个人草稿本，可以随意修改，不会影响到原项目。

### 第 2 步：Clone 项目 (下载到你的电脑)

打开你电脑的终端 (或 Git Bash)，输入下面的命令，把你的项目副本下载到本地。

```bash title="在终端中执行"
# 把 "YourGitHubID" 换成你的 GitHub 用户名
git clone https://github.com/YourGitHubID/cs4ncu.git

# 进入项目文件夹
cd cs4ncu
```

### 第 3 步：创建分支并修改文件

1.  **新建一个分支**。在动手修改前新建一个分支是个好习惯，可以把你的改动和主线隔离开。

    ```bash title="在终端中执行"
    # 分支名可以自定义，比如 add-my-name
    git checkout -b add-my-name
    ```

2.  **找到打卡墙文件** `docs/aboutus/wall.md`，用你常用的文本编辑器 (比如 VS Code) 打开它。

3.  **在文件末尾的“大家的足迹”下面，加上你的信息**。格式如下：

    ```markdown title="docs/aboutus/wall.md"
    * [@你的 GitHubID](你的GitHub主页链接) - 随便说点什么 (YYYY-MM-DD)
    ```

    ??? example "查看一个具体示例"
        ```markdown
        * [@liming](https://github.com/liming) - 大家好，我是小明，前来报到！ (2024-05-21)
        ```

### 第 4 步：保存并提交你的修改

1.  **保存文件**。然后回到终端，用 `git add` 命令告诉 Git 你修改了这个文件：

    ```bash title="在终端中执行"
    git add docs/aboutus/wall.md
    ```

2.  **提交你的修改**，并写一条说明，告诉别人你做了什么：

    ```bash title="在终端中执行"
    git commit -m "feat: add my signature to the wall"
    ```

3.  **把你的修改推送到 GitHub 上的个人副本**：

    ```bash title="在终端中执行"
    # "add-my-name" 是你刚刚创建的分支名
    git push origin add-my-name
    ```

### 第 5 步：发起 Pull Request (请求合并)

1.  回到你在 GitHub 上的项目副本页面 (`https://github.com/YourGitHubID/cs4ncu`)。
2.  页面上会出现一个黄色的提示，旁边有一个绿色的 **Compare & pull request** 按钮，点击它。
3.  在新页面检查一下信息，然后点击 **Create pull request** 按钮。

!!! success "恭喜你，完成了！🎉"
    现在，你已经成功地向 `CS for NCU` 项目提交了一个 Pull Request (PR)。项目的维护者会看到你的申请，并尽快把它合并进去。之后，你就可以在打卡墙上看到你的留言了！

    恭喜你解锁了开源贡献新技能！
