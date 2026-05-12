# D3 Runbook — Launch & Submit（黑客松提交日）

> **生成时间**：2026-05-12 18:45（UTC+8）｜**18:55 已应用 cold-eye review 修补**（详见 `deliverables/reviews/d3-runbook-review-2026-05-12-1855.md`）
> **执行窗口**：2026-05-13 08:00 → 12:00｜**240 分钟主流程**（含 30 min 末段缓冲）｜硬红线 12:00 提交完成
> **前置状态**：D2 红线 18:42 已达（仓库 5 commits，E2E 4 笔全绿，README 双语，截图齐）
> **核心目标**：把已经做完的东西**按下发布按钮**，让黑客松评委能看到、能点开、能验证
> **配套资料包**：`deliverables/submission/hackathon-submission-pack.md`（明早 10:30 填表单直接复制粘贴）

---

## 0. 评审决议（来自 18:42 review 第 9 节 3 问）

| # | 问题 | 决议 | 理由 |
|---|---|---|---|
| 1 | 明早第一件事先把 repo 改 Public？ | **YES** | 阻塞发推 + 阻塞评委 clone；30 秒成本，零风险（已三层扫描确认无私钥泄漏） |
| 2 | D3 上午 90 分钟优先做"视频 + 提交表单"，不做任何代码优化？ | **YES** | 黑客松强制要求；提交未完成 = 前 18 小时归零；任何代码改动都要重跑全套截图 |
| 3 | D3 下午启动 D4 0G Storage 原型？ | **YES（仅做到能 PR 截图的程度）** | 增加"完整故事感"加分；但只做原型不上线，避免再开新坑分散精力 |

**铁律**：上午红线没完成前，**不写一行代码**。

---

## 1. 上午红线（08:00 → 12:00）

### 阶段 ①  08:00–08:30｜Wake & Repo Public（30 min）

#### 1.1 起床三件套
- [ ] 喝水
- [ ] 检查时间
- [ ] 打开电脑（不开 Telegram、不刷 X、不读 Discord）

#### 1.2 把 repo 改 Public（GitHub 网页操作，不要走 CLI）

1. 浏览器打开 <https://github.com/zwyzjj/Digital-Legacy/settings>
2. 滚到最下面 **Danger Zone**
3. 点 **Change repository visibility** → **Change to public**
4. GitHub 会弹确认：让你输入 `zwyzjj/Digital-Legacy`，输入并确认
5. 回到仓库首页，URL 栏右侧的 🔒 图标应消失，徽章变 `Public`

#### 1.3 隐身窗口验证

- [ ] 浏览器开**隐身/无痕窗口**（Ctrl+Shift+N）
- [ ] 直接访问 <https://github.com/zwyzjj/Digital-Legacy>（**不要登录**）
- [ ] 能看到 README 渲染、文件树、5+ commits → ✅
- [ ] **额外检查**：README 里嵌入的 6 张截图 `docs/screenshots/01–06.png` 全部成功加载（不是空白破图）
- [ ] 如果跳到登录页 → 步骤 1.2 没生效，重做
- [ ] **手机 4G 网络**额外开一次仓库链接（不同 IP 段触发 CDN 缓存刷新，防 X 卡片仍是 private）

#### 1.4 顺手把营销文档 commit 入库（如果 5/12 晚上已 commit 则跳过）

> ⚠️ 18:55 review 后建议**昨晚就 commit 掉**，明早跳过本步。如果跳过，从下一步开始。

```bash
cd "d:\Digital Legacy project"
git status   # 应该是干净的；如果还有 untracked 才执行下面
git add deliverables/
git commit -m "docs(d3): add marketing draft + reviews + d3 runbook + submission pack"
git push
```

---

### 阶段 ②  08:30–09:00｜首条 X 推文（30 min）

#### 2.1 准备物料

- 文案：`d:\Digital Legacy project\deliverables\marketing\x-post-draft.md` 选项 **A1**（260 字符版）—— 已含官方必需 hashtag + @0G_labs
- 图片：`d:\Digital Legacy project\docs\screenshots\05-claim-success.png`
- 链接（**只把 repo URL 塞进文案，Tx 链接留给下午 thread**）
  - 文案内：<https://github.com/zwyzjj/Digital-Legacy>
  - 备忘录留底（下午 thread/quote 用）：<https://chainscan-galileo.0g.ai/tx/0xe636eb255581f9dea32597cedbc08f03bfc5febb843df41c58d74e1308f3b64a>

#### 2.2 发推 checklist（顺序不可错）

- [ ] 已确认 repo 是 Public（步骤 1.3 通过）
- [ ] **完整复制** A1 文案到 X 编辑框（不要二次润色！已实测在 280 内）
- [ ] 上传截图 05
- [ ] **预览**：链接卡片是否正常展开？字符是否在 280 内？（X 显示在右下角应是绿色或正数）
- [ ] 文案里 hashtag 已含 `#0GHackathon` `#BuildOn0G` + `@0G_labs`（marketing draft 默认已加）
- [ ] 发送
- [ ] **用隐身窗口**打开自己 X 主页，确认推文出现在公共时间线（而非只在登录态可见）
- [ ] 复制推文链接，存到 `deliverables/marketing/x-post-live.md`（后面提交表单要用）

#### 2.3 兜底

- 如果字符超限 → 用 A2 / A3 短版（同文件）
- 如果链接卡片不展开 → 不用纠结，正常发；评委点链接才是关键
- **不要**因为"想再润色一下"拖到 09:30 之后

---

### 阶段 ③  09:00–10:30｜录 3 分钟 Demo 视频（90 min）

> ⚠️ **本阶段最高风险**：vault 准备/脚本时序矛盾 + Loom 默认非公开 + YouTube 上传需 5–15 min 异步处理。下面 checklist 已修补。

#### 3.1 录制工具选择（已决，跳过决策）

| 工具 | 选择 | 原因 |
|---|---|---|
| **Loom 免费版** | ✅ 首选 | 3 min 在 5 min 上限内；录完即得云链接 |
| **Windows Game Bar**（Win+G） | 兜底 | 如果 Loom 账号配额满或登录卡死 |
| **OBS Studio** | 兜底兜底 | 如果前两个都不行才上 |

> 🔧 **今晚必做**：登录 Loom 验证：① 账号能用；② 免费配额没满（< 25 个视频）；③ 录完后默认 share 改成 "Anyone with the link" public。

#### 3.2 演示脚本（180 秒，先口头排练 1 遍）

| 时间 | 画面 | 旁白要点（英文优先） |
|---|---|---|
| 0:00–0:15 | README.md 顶部 | "Digital Legacy is an on-chain dead-man's switch on 0G Galileo. If you go silent, your vault unlocks for your designated heir." |
| 0:15–0:35 | `Legacy.sol` 滚动展示 | "88-line contract, 4 core functions, 6 custom errors. Deployed at 0x240D..." |
| 0:35–1:10 | 浏览器打开 dapp，Connect Wallet → **现场 Create Vault**（vault id 大概率 = 4） | "Owner creates a vault — a beneficiary, an inactivity period, and some funds." |
| 1:10–1:30 | 切到 0G Explorer，展示 VaultCreated event | "Tx confirmed. Event emitted." |
| 1:30–1:55 | 回到 dapp，Claim too early → revert | "Beneficiary tries to claim early. Contract reverts with StillActive." |
| 1:55–2:20 | **[Cut to 60s later]** 回到 dapp，Claim success | "After the inactivity window, the heir claims successfully." |
| 2:20–2:45 | Explorer 展示 Claimed event + 余额变动 | "Funds transferred. Inheritance complete." |
| 2:45–3:00 | 回到 README，5 条 0G 踩坑高亮 | "Bonus: 5 non-trivial gotchas we hit on 0G, documented for the ecosystem." |

> ⚠️ **1:55 的 60s 等待**：**不要现录 60s 静默**（占视频 1/3 时长）。用 Loom 的"段落剪切"或者**分两段录后期拼接**。

#### 3.3 录制 checklist（重排：先确认环境再录）

**录前 10 min 准备（09:00–09:10）**

- [ ] 关掉所有通知（Discord / Telegram / 微信桌面 / 邮件 / VS Code 弹窗）
- [ ] 浏览器关掉所有无关 tab；只留：dapp localhost + 0G Explorer + README（本地或 GitHub）
- [ ] 浏览器字体放大到 125%（评委看视频小屏）
- [ ] **不要切到 .env.local / 终端 / 文件树**（防 Dev Signer 完整私钥入镜）
- [ ] 浏览器 DevTools 关闭（F12 整段不要开）
- [ ] vault-panel UI 上确认 Dev Signer 地址只显示前 6+尾 4 位（标准 truncate）
- [ ] 启动 `NEXT_PUBLIC_DEV_SIGNER=true`，**不要现场调 MetaMask**
- [ ] `cast block-number --rpc-url http://evmrpc-testnet.0g.ai` 探测 0G 节点活着
- [ ] 检查 Dev Signer 余额 ≥ 0.05 OG（4 笔 × 3 次 NG = 12 笔 tx × ~0.001 OG）
- [ ] dapp 上做 1 次 dry-run 假 vault 创建确认 EIP-1559 显式预填仍工作（这次会用掉 vault 4，但更安全；下面正式录时用 vault 5）
- [ ] **vault 编号策略**：vault 4 = dry-run；vault 5 = 正式录；vault 6/7 = NG 重录额度

**正式录制（09:10–10:00）**

- [ ] 用 Loom：录 30 s 测试 → 回放确认声音 + 画面 → 删除测试
- [ ] 正式录制（按 3.2 脚本，可分段）
- [ ] 录完看回放：声音是否有？画面是否糊？关键 tx hash 是否清晰？
- [ ] **NG 重录上限 2 次**（之前写 3 次太宽松），第 3 次直接接受当前版本

**录完立刻处理（10:00–10:05）**

- [ ] Loom 链接**改为 public**（Share → Anyone with the link）
- [ ] **隐身窗口**验证 Loom 链接外部可看
- [ ] 同时启动 YouTube 上传（见 3.4）—— 不要等！

#### 3.4 上传（10:00 一录完就启动，并行进行）

> 🔁 **关键时序修补**：YouTube 上传需 5–15 min 异步处理，所以 10:00 录完**立刻**上传，处理过程中并行去填表单（阶段 ④），10:30 回来取链接。

- **首选 YouTube**（评委多为国际）
  - 标题：`Digital Legacy — On-chain Dead-man's Switch on 0G Galileo (Hackathon Demo)`
  - 描述：粘贴 README 第一段 + 3 条核心链接（repo / contract / claim tx）
  - **可见性：Unlisted**（不公开列表，但有链接可看）
  - 标签：`0G, hackathon, web3, smart-contract, solidity`
  - **不要带任何背景音乐**（防 spam / copyright 误报）
  - 上传完成立即记下 video ID，等处理完成（约 10:30）拿到 `https://youtu.be/<id>` 可外链
- **Loom 链接作为同步可用兜底**（上传立刻可用，不依赖处理）
  - 如果 YouTube 10:25 还在 processing → 表单先填 Loom 链接，截图后再去后台改 YouTube
- **B 站做镜像备份**（国内评委备用，下午做不做都行；审核时间长，赶不上 12:00 红线）

---

### 阶段 ④  10:00–11:00｜填提交表单（60 min，与 YouTube 上传并行）

> 🔁 **时序修补**：本阶段从 10:00 开始，与阶段 ③ 末段 YouTube 处理并行。视频链接最后再粘。

#### 4.1 资料清单 — **以 `deliverables/submission/hackathon-submission-pack.md` 为准**

> 所有字段（含 Track 编号、3 段 narrative 答案、长描述）已预写在该资料包中，填表时**只做复制粘贴**，不要现场遣词。

如果资料包不在身边，最低必填字段：

```
Project Name: Digital Legacy
Tagline: On-chain dead-man's switch on 0G Galileo
Track: <见 submission pack，已锁定>
Team: Solo (zwyzjj)
Repo: https://github.com/zwyzjj/Digital-Legacy
Contract: 0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6
Chain: 0G Galileo Testnet (chainId 16602)
Demo Video: <YouTube 10:30 处理完后回填；或先填 Loom 链接>
Tweet: <08:30 发推后的链接>
Deployer: 0xec70b55318c11D6344C29730f14A93CD7beDE874
Key Tx (Claim Success): 0xe636eb255581f9dea32597cedbc08f03bfc5febb843df41c58d74e1308f3b64a
Description (long): 见 submission pack §3（约 300 词，已抄好 README.en.md 的 The Problem + The Solution 两节）
```

#### 4.2 填表 checklist

- [ ] **第一时间确认主办方平台账号已登录**（昨晚已注册；如果今晨需要注册 → 立刻做，5 min 内）
- [ ] 项目名 + slogan
- [ ] **Track 选择**：按 submission pack §1 已锁定的编号
- [ ] 仓库链接（隐身窗口验证可访问）
- [ ] 合约地址 + chain
- [ ] **Narrative 题（3 道）**：从 submission pack §4–6 直接复制
  - "How does this use 0G?"
  - "What's the impact / who is it for?"
  - "Future roadmap"
- [ ] 长描述：粘贴 submission pack §3（300 词）
- [ ] 团队信息
- [ ] 视频链接（YouTube unlisted 优先；如还在 processing 用 Loom public 链接兜底）
- [ ] 推文链接（08:30 已存档进 `x-post-live.md`）
- [ ] **提交前最后一次自检**：所有外链点开都能不登录访问
- [ ] **提交后立刻截 3 张图**：
  - `docs/screenshots/07a-submission-confirm.png`（提交成功页）
  - `docs/screenshots/07b-submission-email.png`（确认邮件）
  - `docs/screenshots/07c-public-project-page.png`（评委可见的项目卡片，如平台支持）

#### 4.3 兜底

- 如果表单要求"public repo"而你 1.2 没改成功 → 立刻改
- 如果表单要求 mainnet 部署 → 不要慌，testnet 是 hackathon 标配，在 description 里写明
- 如果表单要求 zip 上传源码 → `git archive --format=zip HEAD -o submission.zip` 30 秒搞定
- 如果表单卡死提交不了 → 截图错误页 → 发邮件给主办方 + 在 Discord #help 频道贴
- 如果 YouTube 11:00 还在 processing → 提交时用 Loom 链接 + 在 description 末尾加一行 "YouTube mirror processing: youtu.be/<id>"

---

### 阶段 ⑤  11:00–12:00｜缓冲 + 庆祝（60 min，扩容）

> ⏰ 由于阶段 ④ 改成 10:00 开始，缓冲区从 30 min 扩大到 60 min。多出来的时间用于兜底。

- [ ] **如果 YouTube 还在 processing**：等它处理完 → 回到提交表单 → 把视频链接从 Loom 改为 YouTube → 重新保存
- [ ] 提交链接发到 X（quote 早上那条推文）："Submitted! 🚀 #0GHackathon"
- [ ] 把 quote 推文链接也存进 `deliverables/marketing/x-post-live.md`
- [ ] 在 0G Discord `#showcase` / `#hackathon-submissions` 频道分享（不强制，但礼貌）
- [ ] **如果 12:00 前一切就绪 → 立刻吃饭**，不必等点
- [ ] 给自己 15–30 min 喘口气

---

## 2. 下午加分项（13:00 → 18:00）— 按时间允许做

### 2.1 X Thread（13:00–14:00）

直接用 `x-post-draft.md` **选项 B（3-Tweet Thread）**，文案已就绪：
- 1/3 Hook：`If I die tomorrow, my crypto dies with me.` （已在 marketing draft）
- 2/3 Proof：合约链接 + 4 笔 tx 验证（已在 marketing draft，附图 05）
- 3/3 Lesson + CTA：min priority fee 踩坑 + repo URL（已在 marketing draft）

发完每条都存进 `x-post-live.md`。**不要现写新文案，已实测在 280 字符内**。

### 2.2 README 加 demo GIF（14:00–15:30）

把 demo 视频转 GIF（≤ 5MB）替换 README 顶部静态截图。**一行 ffmpeg 命令搞定，不需要装 gifsicle**：

```bash
ffmpeg -i demo.mp4 -vf "fps=10,scale=720:-1,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 demo.gif
```

如果 ffmpeg 没装 / GIF 还是太大 → 兜底用在线工具 <https://ezgif.com>（上传 mp4 → 调 fps + 分辨率 → 下载）。

### 2.3 D4 启动 — 0G Storage 集成原型（15:30–18:00）

**目标**：能截图 1 张 0G Storage upload 成功页面，写进 README 路线图章节。**不上线**。

| 子步骤 | 时间 | 输出 |
|---|---|---|
| 读 0G Storage SDK 文档 | 30 min | 笔记：API 形状、auth 方式 |
| 在 web/ 加 `lib/og-storage.ts` 骨架 | 60 min | upload(text) → CID 返回 |
| 测试 upload "hello world" → 拿到 CID | 30 min | 截图 + 写入 README D4 章节 |
| commit `feat(d4): 0g storage prototype` | 10 min | push |

**🚦 16:30 健康检查（强制）**：如果到此还在读文档 / 还没拿到第一个 200 OK → **立刻放弃代码路径**，转去用文字写 README "Roadmap → D4 0G Storage planned" 段落（含设计草图、API 形状猜想）。**评委加分点是"有规划"，不必是"有代码"**。

**🚦 18:00 硬红线**：无论做没做完，commit 当前状态（半截原型也比没东西好），push。停手。

---

## 3. 不要做的事（铁律）

- ❌ **不要**回头继续调 MetaMask（已确认上游问题 + Dev Signer 已上线工作）
- ❌ **不要**改合约（已部署、已验证、已截图，任何改动都要重跑全套）
- ❌ **不要**写 D5+ 想法（提交未完成前，只做能让评委加分的事）
- ❌ **不要**在 X 评论区跟人争论技术细节（占用注意力，影响后续动作）
- ❌ **不要**在 hackathon 提交前轮换 Dev Signer 私钥（demo 视频要用，提交后再换）
- ❌ **不要**在录视频时切到 `.env.local` / 终端 / VS Code 文件树（避免 Dev Signer 完整私钥入镜）
- ❌ **不要**追求"完美"。追求**已提交**。任何"再润色一下"的冲动都视为风险信号

---

## 4. 风险清单 + 兜底

| 风险 | 概率 | 兜底方案 |
|---|---|---|
| GitHub 改 Public 失败（账户限制） | 低 | 检查 GitHub 账户 spam 状态；联系 support |
| YouTube 上传卡死 / 处理 > 30 min | 中 | 表单先填 Loom public 链接；B 站镜像下午补；最差 Google Drive 共享 |
| Loom 链接默认非 public（评委点开要登录） | **中** | 录完第一时间 Share → Anyone with the link；隐身窗口验证 |
| Loom 免费配额已满 / 5min 单次上限 | 中 | 兜底切 Win+G Game Bar 或 OBS |
| 录视频时 Dev Signer 余额不足 | 低 | **录前**查 `https://chainscan-galileo.0g.ai/address/0xec70b55318c11D6344C29730f14A93CD7beDE874`；用 0G faucet 补（faucet 等待最长 10 min） |
| 0G testnet 节点维护（凌晨/早晨高发） | 中 | 录制前 `cast block-number --rpc-url http://evmrpc-testnet.0g.ai` 探测；如果不通 → 视频脚本走 README + 历史 tx Explorer 备份版（不演示现场交互） |
| 提交表单要求填 mainnet | 低 | description 里强调 testnet + hackathon scope |
| 提交表单要 zip 源码上传 | 低 | `git archive --format=zip HEAD -o submission.zip` |
| Twitter 限流（@0G 失败） | 低 | 不影响主流程，只影响曝光 |
| 主办方平台账号未注册 | **中** | **今晚就注册**，明早绝对不在这步浪费时间 |
| Track 编号填错 | 中 | submission pack §1 已锁定，照填即可 |
| Dev Signer 完整私钥录入视频 | 低（已加 checklist） | 不切终端 / .env / 文件树 |

---

## 5. 12:00 黑客松提交完成 checklist（评审现场可对照）

- [ ] GitHub repo Public ✅
- [ ] X 推文已发且**隐身窗口可见** ✅
- [ ] 视频可外网访问（YouTube unlisted 或 Loom public） ✅
- [ ] **Track 编号填写正确**（不是 T?） ✅
- [ ] **Narrative 题（3 道）已填**（how-uses-0G / impact / roadmap） ✅
- [ ] 黑客松提交表单完成 + **确认邮件已收到** ✅
- [ ] 提交确认截图 07a/07b/07c 存档 ✅
- [ ] 关键链接全部可外网访问（隐身窗口验证：repo / 视频 / 推文 / 合约 Explorer） ✅
- [ ] X 已发"Submitted!" quote 推文 ✅

**全部 ✅ → D3 真正闭环，可以放心吃午饭。**

---

## 6. 心态提示（给明天早上的自己）

- 你已经赢了 80% 的人 —— D2 红线提前 3h18m + 4 笔上链全绿 + 双语 README + 5 条踩坑沉淀。
- 上午 4 小时是**收割**，不是**创造**。每一步都是已经做完的东西按下发布按钮。
- 不要追求完美，追求**已提交**。
- 如果某一步卡住超过 15 分钟，立刻问 WorkBuddy。
- **今晚最晚 23:30 关电脑、闹钟设 07:30**（不是 07:55）—— 留 30 min 缓冲应对早晨 baseline 状态。
- 早上不刷 X / Telegram / 微信 / 邮件 ≥ 30 min，直到 ② 推文发完之后。
- 任何一步如果**超时 50%**（预估 30 min 做了 45 min 还没完），停下来重读 runbook 这一节，不要硬冲。
- 12:00 提交即可，提交之后**任何遗憾都不致命**。

**Good luck. Ship it. 🚀**
