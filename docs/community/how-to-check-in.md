---
tags:
  - Level-Beginner
  - Type-Guide
  - Topic-Git
  - Topic-GitHub
---

# 打卡指南：完成你的第一次贡献

如果你想从“我认同这个项目”走到“我真的参与了一次”，这页就是最低门槛入口。

它不会要求你一上来就写很长的内容，也不要求你先掌握复杂的开源协作流程。你只需要完成一次最小但完整的 GitHub 贡献：**在打卡墙留下自己的一句话。**

做完这件事，你至少会得到两样东西：

1. 你会真实走完一次 Fork / 修改 / Commit / Push / Pull Request 的标准流程
2. 你会从“围观者”变成“已经参与过一次的人”

---

## 这一步适合谁

这份指南特别适合下面几类人：

- 第一次接触 GitHub，不知道 PR 流程到底是什么
- 认同项目，但不想一开始就承担太大压力
- 想先试一次开源协作，建立一点行动感和熟悉度

如果你只是想先了解项目理念，建议先看 [我们的初心](./our-story.md)。
如果你想看看别人是怎么迈出第一步的，可以先去 [路友打卡墙](./contributors.md)。

---

## 开始前，你需要准备什么

!!! declaration "开始前的必备条件"
    在开始之前，请确保你已准备好以下两项：

    1. **一个 GitHub 账号**
       如果你还没有账号，可以前往 [GitHub 官网](https://github.com/signup) 免费注册。

    2. **Git 环境**
       请确保你的电脑上已经安装了 [Git](https://git-scm.com/downloads)。它是参与开源协作的基础工具。

---

## 这次打卡你会改哪个文件

你需要修改的文件是：

- `docs/community/contributors.md`

也就是站内的 [路友打卡墙](./contributors.md)。

你只需要在“大家的足迹”下面，按统一格式加上一行自己的名字和一句话。

---

## 分步指南：完成你的第一次贡献

### 第 1 步：Fork 项目

1. 打开 `CS for NCU` 的 GitHub 仓库：<https://github.com/NCUSCC/cs4ncu>
2. 点击页面右上角的 **Fork** 按钮。
3. 这会把整个项目复制到你的 GitHub 账号下。你可以把它理解为“你自己的练习副本”。

### 第 2 步：Clone 到本地

打开终端（或 Git Bash），执行：

```bash title="在终端中执行"
# 把 "YourGitHubID" 换成你的 GitHub 用户名
git clone https://github.com/YourGitHubID/cs4ncu.git
cd cs4ncu
```

### 第 3 步：创建一个分支

```bash title="在终端中执行"
# 分支名可以自定义，比如 add-my-name
git checkout -b add-my-name
```

### 第 4 步：修改打卡墙文件

打开 `docs/community/contributors.md`，在“大家的足迹”下面加上一行：

```markdown title="docs/community/contributors.md"
* [@你的 GitHubID](你的GitHub主页链接) - 随便说点什么 (YYYY-MM-DD)
```

??? example "查看一个具体示例"
    ```markdown
    * [@liming](https://github.com/liming) - 大家好，我是小明，前来报到！ (2024-05-21)
    ```

### 第 5 步：保存并提交修改

```bash title="在终端中执行"
git add docs/community/contributors.md
git commit -m "docs: add my signature to the wall"
```

### 第 6 步：推送到你的 GitHub 仓库

```bash title="在终端中执行"
# "add-my-name" 是你刚刚创建的分支名
git push origin add-my-name
```

### 第 7 步：发起 Pull Request

1. 回到你 GitHub 上的项目副本页面：`https://github.com/YourGitHubID/cs4ncu`
2. 页面上通常会出现黄色提示，点击 **Compare & pull request**
3. 检查信息无误后，点击 **Create pull request**

!!! success "恭喜你，完成了"
    现在，你已经完成了一次标准的开源贡献流程。

    维护者看到后会审核并合并。合并之后，你就能在 [路友打卡墙](./contributors.md) 上看到自己的留言。

---

## 完成这一步之后，接下来读什么

如果你做完打卡，想继续往前走，建议按这个顺序继续：

1. [路友打卡墙](./contributors.md)
2. [贡献流程](./contributing/how-to-contribute.md)
3. [写作规范](./contributing/writing-guide.md)

这样你会从“完成第一次参与”，过渡到“开始理解怎样持续贡献”。
