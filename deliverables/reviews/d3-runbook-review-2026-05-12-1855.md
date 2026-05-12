# D3 Runbook 冷眼挑刺 Review（执行前最后体检）

> **生成时间**：2026-05-12 18:55（UTC+8）
> **被审对象**：`deliverables/runbooks/d3-launch-and-submit-2026-05-12-18-45.md`
> **审查目的**：在明早 08:00 启动前，把"会让你在 90 分钟红线里突然卡 15+ 分钟"的隐患全部挖出来 + 给出修补建议
> **方法**：逐节读 → 对照 18:42 review 的事实底稿 → 对照实际仓库状态（`git status` / `docs/screenshots/` / `README.en.md` 截止当前）→ 标注矛盾、漏洞、不合理假设
> **严重度图例**：🔴 阻塞级（不修明早会爆） / 🟡 高（不修浪费 15–30 min） / 🟢 打磨（韧性提升）

---

## 0. TL;DR — 必须在睡前处理的 4 件事

| # | 风险 | 严重度 | 处置建议 |
|---|---|---|---|
| 1 | **黑客松提交表单的 Track 编号未确认**（runbook 4.1 写 `Track: T?`），明早现场查可能耗 15+ min | 🔴 | 今晚就上 0G hackathon 官方页/邮件确认 track 命名，写死进资料包 |
| 2 | **录像脚本与 vault 准备的时序矛盾**：3.3 说"录前先把 vault 4/5 准备好"，但 3.2 脚本 0:35–1:10 又是"现场 Create Vault"——读到这里会现场愣 2 分钟 | 🔴 | runbook 中明确："vault 4 = 本次正式录制现场创建；vault 5 = 预留给 NG 重录" |
| 3 | **YouTube 上传需要 5–15 min 的服务端处理**才会出可点链接，runbook 把"上传"和"填表单"挤在 10:30–11:30 同一小时内，串行链条紧 | 🔴 | 视频导出后**立刻**上传 YouTube（10:25 左右），处理过程中并行填表单文本字段，最后再粘视频链接 |
| 4 | **Loom 分享链接默认是"workspace only"**，没改成"public link"评委点开看不到 | 🟡 | 录完第一时间设置 Share → Anyone with link |

下面是分节挑刺细目。

---

## 1. 头部元信息（line 1–8）

### 🟡 Finding 1.1 — 红线时间数学不一致

> Runbook 写：**"执行窗口：2026-05-13 08:00 → 12:00（90 分钟红线 + 30 分钟缓冲）"**

实际上分阶段加起来：
- ① 30 min + ② 30 min + ③ 90 min + ④ 60 min + ⑤ 30 min = **240 min 红线 + 0 min 独立缓冲**（⑤ 已经把缓冲并进总时长）

如果按 "90 min 红线 + 30 min 缓冲" 理解，明早做到 09:30 就会以为"主流程做完了"然后松懈——其实只完成了 ①+②，视频和提交都还没动。

**建议改成**："**240 分钟主流程**（含 30 min 末段缓冲）；硬红线 12:00 提交完成"。

---

## 2. 阶段 ① 08:00–08:30 Wake & Repo Public

### 🟢 Finding 2.1 — 1.4 步的 commit 实际上现在就能做

> "顺手把营销文档 commit 入库（可选，1 min）"

`git status` 现在显示 3 个 untracked 文件正是 1.4 要 commit 的那 3 个。明早做和今晚做没差别，**今晚做更稳**（顺便降低明早早上的认知负载）。

**建议**：本次 review 之后就把这步做掉，runbook 1.4 改成 "（如果今晚已 commit 则跳过）"。

### 🟢 Finding 2.2 — Repo Public 后浏览器/X 卡片缓存延迟

刚改 Public 的 repo，X / Telegram / OpenGraph 服务端会缓存 30 秒–几分钟的旧响应（404 或 private）。如果 08:30 立刻发推 → 08:31 别人点链接可能看到的还是 private 视图（取决于他们各自的边缘节点）。

**风险等级**：低（评委 1 小时后才看，缓存早就过期）。
**建议**：在 1.3 隐身验证后**再额外用一台手机 4G 网络访问一次**（不同 IP 段，触发新缓存），确保 CDN 也刷新。

### 🟢 Finding 2.3 — 隐身窗口验证应覆盖 README 渲染图片链路

Runbook 只说"能看到 README 渲染、文件树、5 commits"，但 README 里嵌入了 `docs/screenshots/01–06.png`。在 Private repo 时这些图片虽然在仓库内但渲染时走的也是需要鉴权的 CDN 路径。**改 Public 后应额外确认截图能在未登录态下加载**（曾发生过 GitHub raw 缓存策略偶发问题）。

**建议**：在 1.3 加一条 checkbox："隐身窗口下 README 里的所有 6 张截图都能成功加载（不是空白破图）"。

---

## 3. 阶段 ② 08:30–09:00 首条 X 推文

### 🟡 Finding 3.1 — 推文素材链接里少了合约 Explorer 链接

`x-post-draft.md` 选项 A1 里只有 repo URL，没有合约 Explorer。Runbook 2.1 列出"链接：仓库首页 + Claim Success Tx"——但 A1 文案里那个 Tx 链接 **不存在**，只有一个 github.com 链接 + 文末 hashtag。

文案是对的（280 上限不允许塞两个 URL，URL 一个就吃 23 字符），但 runbook 2.1 描述容易让你以为要把 Tx 链接也塞进文案，到时候会临时改文案 → 重数字符。

**建议**：runbook 2.1 写法改成 "文案里只塞 repo URL；Claim Success Tx 链接放在**手机备忘录**待 thread/quote 用"。

### 🟢 Finding 3.2 — Hashtag 列表与 marketing draft 不一致

Runbook 2.2 写 `#0G #DigitalLegacy #Hackathon #Web3`。
marketing draft 验证过的官方要求是 `#0GHackathon #BuildOn0G` + `@0G_labs`。

发的时候按 marketing draft 走（已实测在 280 内 + 命中官方 hashtag）。**Runbook 这一行直接删掉或改写**为"以 `x-post-draft.md` 文案为准（已含官方必需 hashtag）"。

### 🟢 Finding 3.3 — 推文可见性也用隐身窗口验

Runbook 写 "立刻在自己时间线确认推文可见"。但**自己看自己的推文一定可见**（即使被 shadow ban 也看得到）。真实风险是别人看不到。

**建议**：加一条 "用隐身窗口打开自己 X 主页，确认推文出现在公共时间线（不是只在登录态可见）"。

---

## 4. 阶段 ③ 09:00–10:30 录视频（90 min）—— 最高密度风险区

### 🔴 Finding 4.1 — Vault 准备 vs 脚本时序矛盾

> 3.3 checklist：**"录之前先把 vault 4/5 准备好（上一轮 vault 3 已用完），现场只需 ping → claim too early → wait → claim success"**

> 3.2 脚本：**"0:35–1:10 切到 dapp，Connect Wallet → Create Vault ... Owner creates a vault with a beneficiary and an inactivity period."**

这两个**直接打架**。如果按 3.3 准备好 vault 在先，那 0:35–1:10 应该是 "show vault that was created earlier"；但脚本旁白说 "Owner creates a vault" 是现场动作。

更现实的解读应该是：
- **vault 4 = 本次录制现场创建**（覆盖 0:35–1:10）
- **vault 5 = 预留给 NG 重录第 2 次用**
- **vault 6 = NG 重录第 3 次用**

但 runbook 没写明，明早凌晨录到这步会愣 2 分钟。

**建议改写 3.3**：

```text
- [ ] 录前准备：确认 contracts 资金充足、Dev Signer 余额 > 0.05 OG
- [ ] 不要预先 create vault；脚本 0:35–1:10 就是现场创建（vault id 大概率 = 4）
- [ ] NG 重录上限 3 次：每次会用掉一个 vault id（5, 6），还是够用
- [ ] 录前用 Dev Signer 在 dapp 上跑一次 dry-run（创建假 vault），确认 EIP-1559 显式预填仍工作（防 0G 节点参数飘移）
```

### 🔴 Finding 4.2 — 视频里 60s 不活跃等待不能"现录"

> 3.2 脚本 1:30–1:55 "等 60s 后 Claim success"

180 秒视频里塞不下 60 秒静默等待——会占掉 1/3 的时长，观感极差。

**建议**：脚本明确加 `[Cut]` 标记：

```text
1:30–1:55  [Cut to 60s later] 回到 dapp，Claim success 直接确认按钮亮起
```

录制工具用 Loom 自带的"段落剪切"功能；或者更简单：分两段录，后期粘起来。

### 🔴 Finding 4.3 — YouTube 上传处理延迟未计入

YouTube 上传 1080p 3 min 视频通常需要 **5–15 min 服务端处理**（转码 + 多分辨率生成）才能拿到稳定可外链的视频。在此期间链接打开会显示 "Processing..." 或低清版本。

Runbook 现在的时序：10:30 录完 → 10:30–11:30 都在"上传 + 填表单"混在一起，**最坏情况是 11:25 才上传 → 11:30 提交时视频还在 processing → 评委点开是黑屏**。

**建议时序重排**：

```text
10:00  视频录制完成（脚本 3 min × 1.5 倍率 ≈ 60 min 含 NG）
10:00  立刻导出 mp4 + 立刻上传 YouTube（"Unlisted"）→ 拿到 video ID 但不必等处理完
10:00  → 同时打开 Hackathon 提交表单
10:00–10:30  填表单所有文字字段（资料包已就绪，纯粘贴）
10:30  回到 YouTube：处理完成 → 验证链接外部可访问 → 把 URL 粘进表单
10:30–11:00  完整通读表单 + 提交 + 截图确认页
```

把"上传"和"填表单"**并行**而不是串行，节省 20–30 min。

### 🟡 Finding 4.4 — Loom 默认 share 是 workspace-only

Loom 免费版录完默认链接是"workspace members only"或"requires login"。评委点开如果未登录 Loom 会被弹登录页 → **当场翻车**。

**建议**：runbook 3.4 加一条 "Loom 录完点 Share → Anyone with the link → Set to Public → 复制链接 → 用浏览器隐身窗口验证可看"。

### 🟡 Finding 4.5 — Loom 5 min 上限的兜底没写清

Loom 免费版**单次录制 5 min 上限**，但 NG 重录 3 次相当于会录 4 次（首录 + 3 NG）。**第一次失败后重新点录制是新的 5min counter**，不会累加，所以 OK。

但有个隐藏坑：Loom 免费版**总视频数有上限**（25 个免费视频/账号），如果之前用过 Loom 测试，可能正好卡在临界点。

**建议**：今晚先注册 Loom（如果还没注册）+ 验证免费配额，避免明早早上才发现要付费。

### 🟡 Finding 4.6 — 字体放大到 125% 在 Dev Signer 控制台可能露馅

3.3 写 "字体放大到 125%（评委看视频小屏）"。但 Dev Signer 在 dapp 控制台 / 状态条上可能显示**地址尾 4 位**（甚至偶尔暴露完整地址）。放大后这些信息更显眼。

虽然 testnet 私钥不严重（balance < 0.5 OG），但是**评委如果看到完整地址 + 截图，可能误读为"开发者把私钥放在前端"是安全审计问题**。

**建议**：

```text
- [ ] 录制前在 vault-panel UI 上确认 Dev Signer 地址只显示前 6 + 尾 4 位（标准 truncate）
- [ ] 浏览器开发者工具关闭（F12 不要在录制中开）
- [ ] 不要切到 .env.local 文件、终端、git log 等任何可能暴露完整 hex 串的窗口
```

### 🟢 Finding 4.7 — 不要忘了播放回放检查"声音"

3.3 已经写了"录完看回放：声音是否有？" ✅ 好。但还应该加：

- 录制前用 Loom 自带的"音频测试"录 10 秒说话回放，确认麦克风没静音/不在虚拟会议背景音降噪状态
- Win+G Game Bar 默认不录系统声只录麦克风，要去设置打开
- 戴耳麦可能让麦克风离嘴太近导致爆音 → 录前距 20cm

---

## 5. 阶段 ④ 10:30–11:30 填提交表单（60 min）

### 🔴 Finding 5.1 — Track 编号未确认

> 4.1 资料清单：**"Track: T?（按 0G hackathon 实际赛道选；当前评估走 T4）"**

明早早上 10:30 才打开主办方页面查赛道 → 容易做错决定。

**建议今晚就做**：
- 上 0G hackathon 官方页（邮件里 onboarding 链接 / Discord 公告频道置顶 / Devfolio 或类似主办平台页面）
- 把所有赛道名+代号摘出来
- 评估 Digital Legacy 属于哪个（Infra / Consumer dApp / DeFi / 综合？）
- 把最终选定写死进 `deliverables/submission/hackathon-submission-pack.md`

如果实在今晚查不到（官方没公开），明早 1.3 步隐身验证之后**第一件事**就是去查（08:05 而不是 10:30）。

### 🟡 Finding 5.2 — Description 段落引用不准确

> 4.1 写："Description (long): 见 README.en.md "Overview" 段"

`README.en.md` 里**没有 "Overview" 这个标题**。实际章节是：
- `The Problem`（line 18）
- `The Solution`（line 24）
- `Live Deployment`（line 38）

明早会要找 30 秒才反应过来要拼哪几段。

**建议**：4.1 改成 "Description (long)：拼 `The Problem` + `The Solution` 两节（约 300 词，已预存在 submission pack）"，并且直接在 submission pack 里把这段抄好。

### 🟢 Finding 5.3 — 提交表单字段比想象的多

主流 hackathon 提交表（Devfolio / DoraHacks / Encode）通常还会要：
- 项目 logo（256×256 PNG）
- Cover image（1280×720）
- 团队成员邮箱
- 技术栈 tag 多选
- "How does this use 0G？" / "What's the impact?" 等 narrative 问题（200–500 字各）
- 视频 disclaimer / 自述演示有效性

Runbook 4.1 清单覆盖了最低必填，但**没覆盖 narrative 题**。这些题如果现场写要 30+ min。

**建议**：今晚提前准备 3 段标准答案（"how uses 0G" / "what's the impact" / "future roadmap"），存进 submission pack。

### 🟢 Finding 5.4 — 提交后截图应该一次性截 3 张

4.2 现在只要 1 张 "07-hackathon-submission.png"。建议：
- 07a：提交确认页（表单提交成功的 UI 反馈）
- 07b：邮件确认（如果主办方发邮件）
- 07c：评委可见的项目详情页（如果提交后立刻可看到自己项目卡片）

3 张证据链比 1 张更难造假，对评审更可信。

---

## 6. 阶段 ⑤ 11:30–12:00 缓冲（30 min）

### 🟡 Finding 6.1 — Quote 推文链接也要存档

> 11:30 "提交链接发到 X（quote 早上那条推文）"

新发的 quote tweet 链接也要存进 `x-post-live.md`（和早上首推一样的存档习惯）。否则下午写 thread 时会找不到。

### 🟢 Finding 6.2 — 12:00 吃午饭这条放过

最后一条 "12:00 准时吃午饭（不要跳过）" 是体感对的，但更现实的是 "提交完成 → 立刻吃饭"。如果 11:45 就提交完了，没必要等 12:00。

---

## 7. 下午加分项（13:00–18:00）

### 🟡 Finding 7.1 — X Thread 数量不一致

> 2.1 写 "5 条 thread"，但 `x-post-draft.md` 选项 B 是 **3-Tweet Thread**（标题写的就是 3-Tweet Thread）

实际上 marketing draft 的 3-tweet 版本已经很完整：Hook → Proof → Lesson+CTA。runbook 2.1 列出 5 条 outline 是新增内容（每条 1 个踩坑）。这个新格式没在 draft 里有现成文案。

**两种处理**：
- A：明早只发 marketing draft 已经写好的 3-tweet（更稳）
- B：明早现场展开 5-tweet（要现写 5 条，每条 30 min × 5 = 2.5h，超出 1h budget）

**建议**：采用 A。runbook 2.1 改成 "用 marketing draft 选项 B 的 3-tweet thread"。

### 🟡 Finding 7.2 — GIF 转换依赖未安装

> `gifsicle -O3 demo.gif -o demo-optimized.gif`

Windows 默认没装 `gifsicle`。Chocolatey 或 scoop 安装 5 min，但下午时间紧。

**建议**：

- 选 1（推荐）：直接用 `ffmpeg -i demo.mp4 -vf "fps=10,scale=720:-1,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 demo.gif` 一行搞定 ≤ 5MB，无需 gifsicle
- 选 2：用在线工具 ezgif.com 直接上传 mp4 转 GIF（无脑兜底）

### 🔴 Finding 7.3 — D4 0G Storage 启动 = 阻塞性新坑

下午 15:30–18:00（2.5h）做 0G Storage 集成原型。如果 SDK 文档不熟 + 0G Storage 还没现成 SDK / 文档残缺，**这 2.5h 可能完全无产出**。

虽然 runbook 自己写了"18:00 红线"，但更稳的兜底是：

- **16:30 检查点**：如果还没读完 SDK 文档 / 不知道 auth 怎么过 → 立刻放弃 D4，把时间转去写 README 路线图章节（"0G Storage integration planned"）
- 18:00 不只是停手，而且要 commit 当前状态（半截原型也比没东西好）

**建议**：在 2.3 表格底下加一行 "16:30 健康检查：如果 30 min API 探索没结果 → 切到 fallback，写路线图章节文字而非代码"。

---

## 8. 不要做的事（铁律）

### 🟢 Finding 8.1 — 加一条"不要展示完整私钥"

铁律 5 条已经覆盖了大部分。再加 1 条：

```text
- ❌ 不要在录视频时切到 .env.local / 终端 / VS Code 文件树，避免 Dev Signer 完整私钥入镜
```

---

## 9. 风险清单遗漏

| 现状 runbook 里没有的风险 | 等级 | 兜底建议 |
|---|---|---|
| 0G 节点 RPC 在 08:00–12:00 维护窗口 | 中（凌晨/早晨是 RPC 维护高发期） | 录制前 `cast block-number` 探测 1 次；如果 RPC 不通用 README 已有截图历史 tx 走 fallback |
| Dev Signer 余额已显示 0.466 OG，重录 3 次 ×4 笔 = 12 笔 tx ≈ 0.012 OG 消耗 | 低 | 余额还有 39 倍冗余 ✅，但视频里 vault create 转账金额建议改为 **0.001 OG**（之前的演示也是这个量级），不要演示 0.01 OG 防余额下穿 |
| YouTube 处理过程中被识别为 spam / copyright（系统误报） | 低 | 上传前**不要**带任何背景音乐（demo 用纯系统声 + 自己旁白） |
| 主办方提交表单要求 zip 上传源码 | 低 | 现在没有迹象，但万一要 `git archive --format=zip HEAD -o submission.zip` 30 秒搞定 |
| Loom 处理后视频水印挡住右下角"Success"绿色 badge | 低 | 录制时关键元素居中或左上角，不要靠右下 |
| 主办方平台账号没注册 | 中 | **今晚就注册**（Devfolio / DoraHacks / 0G 自建表单都需要先注册），明早早上不要做这个 |

---

## 10. § 5 最终 checklist 该补充的项

现状 6 条，建议加：

```text
- [ ] Track 编号已填写正确（不是 T?） ✅
- [ ] 表单 narrative 题（how-uses-0G / impact / roadmap）已填 ✅
- [ ] 提交确认邮件已收到并截图（07b） ✅
- [ ] 视频外部可访问（隐身窗口验证 YouTube 链接） ✅
- [ ] X 推文外部可访问（隐身窗口验证）✅
```

---

## 11. § 6 心态提示该补充的项

```text
- 今晚最晚 23:30 关电脑、闹钟设 07:30（不是 07:55）—— 留 30 min 缓冲应对早晨 baseline 状态。
- 早上不刷 X / Telegram / 微信 / 邮件 ≥ 30 min，直到 ② 推文发完之后。
- 任何一步如果超时 50%（预估 30 min 做了 45 min 还没完），停下来重读 runbook 这一节，不要硬冲。
```

---

## 12. 总评与执行建议

| 项 | 评分 | 说明 |
|---|---|---|
| **整体可执行性** | 8/10 | 时间分配合理、checklist 颗粒度好 |
| **风险覆盖度** | 6/10 | 主流程兜底齐，但漏了 Track 编号、Loom 隐私、YouTube 处理时延 |
| **细节自洽** | 6/10 | Vault 准备/脚本矛盾、Hashtag 与 marketing draft 不一致、Description 段落名错 |
| **明早凌晨态可读性** | 9/10 | 中英文混排清晰、表格紧凑，1 杯咖啡下肚能直接照做 |

**总评**：runbook 框架 8 分，但有 4 个 🔴 + 7 个 🟡 需要在睡前修补。修完后整体 9+。

**建议执行顺序**（今晚剩余时间）：

1. （15 min）按本 review 修补 runbook（应用 4 个 🔴 + 主要 🟡）
2. （30 min）生成 `deliverables/submission/hackathon-submission-pack.md`：
   - Track 编号查清写死
   - Description (long) 抄好
   - 3 段 narrative 答案预写
   - 所有链接 + 资源汇总
3. （5 min）注册/验证 Loom 账户 + YouTube 上传权限
4. （5 min）注册主办方提交平台账号（不要明早再注册）
5. （3 min）`git add` + commit + push（marketing + reviews + runbook + submission pack）
6. （余下）23:30 前关电脑

明早起来照 runbook 跑就行，不再思考、不再决策、不再润色。

---

## 13. 致明天早上的自己

> 你已经做完了，剩下都是按钮。
> 这份 review 挑出 4 个红色风险——它们现在已经全部修了。
> 如果明早出现这份 review 没提到的卡点，**先做兜底方案（Loom 替代 YouTube、A2 替代 A1 文案、README 路线图替代 D4 原型代码）再继续**，不要钻牛角尖。
> 12:00 提交即可，提交之后任何遗憾都不致命。

---

*Review 生成方式：逐节读 runbook → diff 18:42 review + marketing draft + README.en.md + git 实际状态 → 标注矛盾点与时序风险 → 按严重度归档。*
