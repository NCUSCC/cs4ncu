# 无伤通关VSCode配置攻略

## 前言

[Visual Studio Code](https://code.visualstudio.com/download)，是微软主导开发的一款轻量级、拓展性强的代码编辑器。相较于Windows下的记事本或macOS下的TextEdit，VSCode可以提供代码高亮、Git可视化、便捷调试等功能。而相较于Visual Studio、XCode等IDE，VSCode更加轻量，启动速度快，占用资源少。

对不少初学者来说，劝退的往往不是写代码本身，而是如何拥有一个舒适的开发环境。本节将以C语言为例，教大家上手VSCode。

## 编辑器还需编译器

VScode本身只能用于编辑代码文本，要借助它来写编程语言，则还需要安装对应的编译器和插件。C语言常用的编译器包括GCC，Clang，MSVC。而Intel、AMD、ARM、苹果、英伟达等厂商则会提供针对自家芯片专门优化的编译器，例如ICC、AOCC、ARM Compiler等。

对Windows用户：

- [MinGW](https://www.mingw-w64.org/downloads/)（Minimalist GNU for Windows）能将编译器依赖的工具和库移植到Windows上，从而编译出原生Windows程序。WinLibs提供了MinGW的预编译版本，推荐使用。
- [Cygwin](https://www.cygwin.com/)（Comprehensive GNU/Linux-like environment for Windows）运行了一个兼容层，能将Linux的系统调用翻译为Windows版本，但性能开销较大。
- [MSYS2](https://www.msys2.org/)（Minimal SYStem 2）基于 Cygwin提供了Linux命令行环境，同时安装了MinGW子环境，可以编译原生Windows程序。
- [Build Tools for Visual Studio](https://visualstudio.microsoft.com/downloads/?q=build+tools#build-tools-for-visual-studio-2026) 微软官方的C/C++编译器，适合开发Windows平台程序。

!!! tip "LLDB调试"
    由于微软的C++插件只支持MI调试协议，而Clang只支持DAP协议，因此要在VSCode上调试Clang编译出的程序，需要安装CodeLLDB或LLDB DAP插件。

对macOS用户：

- xcode-select --install 苹果维护的Clang编译器
- [Homebrew](https://brew.sh/) 安装GCC、LLVM

对Linux用户：

- 想必无需多讲

在安装完编译器后，你还需要将可执行文件的路径放入环境变量PATH，以便程序能直接找到它。MSVC编译器的环境则最好通过自带的.bat脚本按需加载。例如，对Windows用户，按下 ++win+r++ ，输入sysdm.cpl，然后点击“环境变量”按钮，将MinGW的bin目录添加到环境变量PATH中。对macOS用户，在~/.zshenv中新增一行

```bash
export PATH="/opt/homebrew/bin:$PATH"
```

配置完成后，重新启动程序，在终端中输入gcc/clang/cl --version，如果能正确显示版本信息，则表示配置成功。

## 配置LSP

[Language Server Protocol](https://microsoft.github.io/language-server-protocol/)定义了编辑器和语言服务器之间的通信协议。语言服务器负责解析代码，提供代码补全、代码跳转、语法检查等功能，而编辑器负责显示和交互。

在VSCode中，你可以通过安装对应语言的插件来配置LSP。例如安装[C/C++](https://github.com/microsoft/vscode-cpptools)插件后，VSCode会自动配置LSP。你也可以使用 ++cmd+shift+p++ ，搜索执行C/C++: Edit Configurations命令来配置LSP，或者直接修改.vscode/c_cpp_properties.json文件。

!!! tip "IntelliSense缓存"
    长期使用VSCode可能会导致IntelliSense缓存达到数GB，你可以限制缓存大小C_Cpp.intelliSenseCacheSize，或者将缓存目录C_Cpp.intelliSenseCachePath迁移到D盘。

## 工作区与项目结构

在 VSCode 中，你几乎总是以**文件夹**为单位进行开发——打开一个文件夹，它就成为你的「工作区」，你的编辑、搜索、调试等所有操作都将围绕这个文件夹展开。你也可以通过 `文件 → 将文件夹添加到工作区` 来同时管理多个项目文件夹，或通过 `文件 → 打开最近的文件` 快速切换历史工作区。

一个规整的项目在左侧文件管理器中通常看起来像这样：

```
my-project/
├── src/        # 源代码
├── build/      # 编译产物（通常加入 .gitignore）
├── lib/        # 第三方依赖库
├── docs/       # 文档
└── .vscode/    # VSCode 配置（tasks.json, launch.json 等）
```

养成良好的目录结构习惯，不仅让自己思路清晰，也方便日后与他人协作。

## tasks.json 与 launch.json

VSCode 通过 `.vscode` 文件夹内的两个 JSON 配置文件来管理构建与调试流程：

**`tasks.json`** —— 负责构建（编译）

它定义了如何调用编译器，把你的源代码变成可执行文件。每个「任务」（task）通常包括：使用哪个编译器（`command`）、传递哪些参数（`args`，如 `-g` 参数（GCC/Clang）或 `/Zi`（MSVC）生成调试信息、`-o` 指定输出路径）。你可以通过 `Terminal → Run Build Task`（或 ++cmd+shift+b++）来手动触发构建。

**`launch.json`** —— 负责调试（运行）

它定义了如何启动调试器，加载你刚编译好的程序并挂载调试器。关键字段包括：`preLaunchTask`（`tasks.json` 中对应任务的名称，每次调试前先自动构建）和`type`(调试器类型，如`cppdbg`对应DWARF格式、`cppvsdbg`对应PDB格式）。

!!! tip "自动生成配置"
    你不必从零手写这两个文件。在 VSCode 中打开一个 `.c`或`.cpp` 文件，点击右上角的「运行」按钮，或者按下 ++f5++，VSCode 会引导你选择编译器并自动生成初始配置，这通常是最快的上手方式。

## 调试程序

当你发现运行结果与预期不符，但又找不到问题时，就轮到调试功能出马了。调试程序是指在程序运行过程中，暂停程序，检查或修改变量的值，从而找出问题所在。

常用的调试快捷键如下：

| 快捷键 | 功能 |
| :--- | :--- |
| ++f5++ | **继续运行**（跑到下一个断点） |
| ++f10++ | **单步跳过**（执行当前行，不进入函数） |
| ++f11++ | **单步进入**（进入当前行调用的函数内部） |
| ++shift+f11++ | **单步跳出**（从当前函数中跳出，返回调用处） |
| ++shift+f5++ | **停止调试** |

在调试过程中，左侧「运行与调试」面板会显示当前的**变量值**（Variables）、**调用栈**（Call Stack）和**断点列表**（Breakpoints）。你可以在代码行号左侧单击来切换断点，当程序运行到断点处时会暂停。对于调用栈顶函数之外的变量，如全局变量，可以在「监视」（Watch）面板中手动输入变量名或表达式来实时观察其变化。

!!! tip "调试 vs 直接运行"
    如果你只想运行程序而不需要调试，可以在 `tasks.json` 中创建一个不带 `-g` 参数的 Release 构建任务，并通过 `Terminal → Run Task` 触发。这样编译出的程序体积更小、运行速度更快。
