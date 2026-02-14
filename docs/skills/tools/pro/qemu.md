# QEMU 入门指南：学长写给新生的虚拟机宝典

> “我的程序在本地跑没问题，放到虚拟机上就炸了！”
> —— 开发者常见吐槽

QEMU 是一个 **万能计算机模拟器**，它可以让你的电脑模拟不同架构的 CPU、硬件和操作系统。
无论是实验操作系统、跨架构开发，还是测试软件，QEMU 都能帮你快速搞定。

---

## 第一部分: QEMU 能做什么？

1. **系统模拟**：在 x86、ARM、RISC-V 等架构上运行完整的操作系统。
2. **程序跨架构运行**：无需真实硬件即可运行不同 CPU 架构的程序。
3. **实验和调试**：可以轻松测试 OS 内核、驱动或软件的行为。
4. **轻量化虚拟化**：相比传统虚拟机，占用资源少，启动快。

> 新手可以把 QEMU 当作“虚拟电脑”来练习操作系统或嵌入式开发。

---

## 第二部分: QEMU 的基本概念

* **镜像文件 (Image / ISO)**：存放操作系统和应用程序的文件。
* **用户模式模拟 (User Mode)**：只模拟程序，不启动完整系统。
* **系统模式模拟 (System Mode)**：模拟完整硬件，运行完整操作系统。
* **KVM 加速**：在支持硬件虚拟化的电脑上，性能接近原生。

---

## 第三部分: QEMU vs 虚拟机 vs Docker

| 技术     | 隔离层      | 性能        | 启动速度 | 跨架构能力 |
| ------ | -------- | --------- | ---- | ----- |
| Docker | 用户空间     | 高         | 秒级   | 否     |
| 虚拟机    | 硬件层      | 中         | 分钟级  | 否     |
| QEMU   | CPU + 外设 | 中（KVM可加速） | 秒-分钟 | 是     |

总结：

* Docker → 轻量级应用隔离
* 虚拟机 → 完整系统隔离
* QEMU → 跨架构实验、系统模拟

---

## 第四部分: QEMU 启动流程

1. 准备镜像文件或 ISO
2. 编写 QEMU 启动命令
3. 启动 QEMU 模拟器
4. 加载 BIOS / Bootloader
5. 加载 Guest OS 内核
6. 初始化虚拟硬件
7. Guest OS 启动完成 → 进入 Shell

> 理解启动流程，可以帮助你轻松调试虚拟机参数。

---

## 第五部分: 实战示例：RISC-V Linux

**步骤 1：下载镜像**

```bash
wget https://cdimage.dev/riscv64-linux.img
```

**步骤 2：启动 QEMU 系统模拟器**

```bash
qemu-system-riscv64 \
  -machine virt \
  -bios default \
  -nographic \
  -drive file=riscv64-linux.img,format=raw,if=virtio \
  -m 1G
```

> 参数说明：
>
> * `-machine virt`：虚拟平台
> * `-bios default`：默认 BIOS
> * `-nographic`：终端模式
> * `-drive file=...`：磁盘镜像
> * `-m 1G`：分配内存

**步骤 3：进入 Guest OS**

```bash
ls
echo "Hello, QEMU World!"
uname -a
```

> 成功启动 RISC-V 虚拟机。

---

## 第六部分: 用户模式跨架构运行

* 只运行单个程序，无需完整 OS
* 常用于交叉编译测试和嵌入式开发

执行流程：Host CPU → QEMU 转译 → Guest 程序 → Host OS 执行

---

## 第七部分: 进阶玩法

1. **快照 (Snapshot)**：保存 VM 状态，方便回滚
2. **网络模拟**：桥接、NAT、端口映射
3. **外设模拟**：USB、PCI、GPU
4. **KVM 加速**：接近原生速度

> 对操作系统实验或嵌入式开发非常有帮助。

---

## 第八部分: 推荐学习资料

* [QEMU 官方文档](https://www.qemu.org/docs/master/)
* [QEMU Documentation Home](https://www.qemu.org/documentation)
* [Ubuntu Official QEMU Tutorial（英文 / English）](https://documentation.ubuntu.com/server/how-to/virtualisation/qemu/)
* [qemu入门教程索引](https://blog.jackeylea.com/qemu/qemu-learning-index/)
* [Learning Qemu Camp 2025](https://opencamp.cn/qemu/camp/2025)

> 小技巧：边操作边学习，比单看教程更容易掌握 QEMU。

---

## 第九部分: 结语

QEMU 不只是虚拟机，它是 **跨架构开发、操作系统实验、嵌入式开发** 的神器。

掌握 QEMU，你就能：

* 测试不同架构的程序
* 开发操作系统或驱动
* 搭建隔离实验环境
* 深入理解计算机底层原理

虚拟化不仅是技术，它是你穿越不同计算平台的钥匙。