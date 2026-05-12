# Hackathon Submission Pack — Digital Legacy

> **生成时间**：2026-05-12 19:00（UTC+8）
> **作用**：明早 2026-05-13 10:00 打开主办方提交表单时，**所有字段从这里复制粘贴**。不思考、不遣词、不润色。
> **配套**：`deliverables/runbooks/d3-launch-and-submit-2026-05-12-18-45.md` 阶段 ④
> **使用方式**：每个 § 对应表单一个字段；用文本编辑器纵向开本文件即可。

---

## § 0  Pre-flight Checklist（10:00 打开表单前 3 分钟扫一遍）

- [ ] GitHub repo 已 Public（runbook 阶段 ①）+ 隐身窗口验证可访问
- [ ] X 推文已发 + 链接存进 `deliverables/marketing/x-post-live.md`
- [ ] Demo 视频已上传 → 至少有 1 个**外部可访问**链接（YouTube Unlisted 或 Loom Public）
- [ ] 主办方平台账号已登录（昨晚已注册；今晨严禁现注册）
- [ ] 本文件已在浏览器/编辑器侧边打开

---

## § 1  Track Selection（关键决策 — 必须 12 小时前锁定）

> ⚠️ **TODO（睡前 10 min 必做）**：上 0G hackathon 官方页面 / Discord 公告 / 报名邮件，把所有 track 名+代号摘出来后，**在本节最下面写死最终选择**。

### 1.1 候选 track 类型（按常见黑客松归类）

| 类别 | Digital Legacy 适配度 | 理由 |
|---|---|---|
| **Consumer dApp / End-User Apps** | ★★★★★ | 面向"个人加密资产持有者"的工具，直接解决用户痛点 |
| **Infrastructure / Primitives** | ★★★★ | 一个新的链上 primitive（heartbeat + automatic inheritance），可被其他协议组合 |
| **DeFi / Asset Management** | ★★★ | 涉及资产管理，但不严格属于"金融"——是遗产管理 |
| **SocialFi / Identity** | ★★ | 间接相关（身份延续），但不是 social 主题 |
| **Tooling / DevEx** | ★ | 不直接相关 |
| **AI / Agent** | ☆ | 完全不相关 |

### 1.2 决策（明早 08:00 之前填）

```
最终 Track 名称：____________________________
Track 代号：____________________________
来源：官方页面 URL / Discord 频道 / 邮件主题
验证时间：2026-05-12 __:__ 或 2026-05-13 08:__
```

> 如果主办方只有 1 个综合 track（无分类）→ 直接选那个，本节标记 N/A。
> 如果允许多选 → 选 **Consumer dApp + Infrastructure** 两个。

---

## § 2  Quick-Copy Field Table（短字段复制粘贴区）

| 字段 | 值（复制此列） |
|---|---|
| Project Name | `Digital Legacy` |
| Tagline / One-liner | `On-chain dead-man's switch on 0G Galileo — your crypto inherits itself.` |
| Short description（≤ 100 chars） | `An immutable contract: ping to stay alive, go silent → beneficiary inherits everything.` |
| Track | （从 §1 拷回） |
| Team Name | `Solo` |
| Team Members | `zwyzjj` |
| Contact Email | `<填你的邮箱>` |
| GitHub Repo | `https://github.com/zwyzjj/Digital-Legacy` |
| Demo Video URL | （YouTube unlisted 或 Loom public — 10:30 回填） |
| Live Demo URL | （可填 N/A，或本地 `http://localhost:3000`，或部署版） |
| Twitter Post | （08:30 发完后回填，存档在 `x-post-live.md`） |
| Contract Address | `0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6` |
| Contract Explorer | `https://chainscan-galileo.0g.ai/address/0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6` |
| Chain | `0G Galileo Testnet` |
| Chain ID | `16602` |
| Deployment Tx | `0xa0f02c538115e305cc8e290fd8602ac60eb2c661e17096c16248a3c301a91ffe` |
| Key Tx (Claim Success E2E proof) | `0xe636eb255581f9dea32597cedbc08f03bfc5febb843df41c58d74e1308f3b64a` |
| Deployer Address | `0xec70b55318c11D6344C29730f14A93CD7beDE874` |
| Tech Stack | `Solidity 0.8.24 · Foundry · Next.js 16 · viem 2 · wagmi 3 · Tailwind 4` |
| License | `MIT` |
| Logo URL（如有） | （可选；用 06-github-repo.png 截一角作占位） |
| Cover Image URL（如有） | （可选；用 05-claim-success.png） |

---

## § 3  Long Description（300 词，长描述字段直接粘贴）

> **来源**：基于 `README.en.md` 的 The Problem + The Solution + Live Deployment + On-Chain Verification 改写浓缩。
> **字符**：约 1,700 chars / 300 words。
> **粘贴前确认**：表单字符上限。如要 ≤ 1000 chars → 用下面"短版"。

### 3.1 完整版（约 300 词）

```text
Digital Legacy is an on-chain dead-man's switch deployed to the 0G Galileo Testnet. It turns "heartbeat + automatic inheritance" into a single immutable smart-contract primitive, eliminating the single point of failure in self-custody: you.

THE PROBLEM
"If I die tomorrow, my crypto dies with me." Every crypto user knows this fear. Hardware wallets are sealed black boxes. Seed phrases get lost. Centralized custodians freeze accounts on death notice. There's no native crypto equivalent of a last will.

THE SOLUTION
One immutable Solidity contract (88 lines, 4 functions, 6 custom errors):
- Deposit any amount of OG into a vault
- Set an inactivity period and a designated beneficiary
- Call ping() periodically — your on-chain heartbeat
- If the period elapses with no ping, the beneficiary calls claim() and inherits the full balance
- The owner can withdraw() at any moment before a claim

No lawyers. No platforms. No trusted third parties. The contract IS the will.

LIVE ON-CHAIN PROOF
Deployed at 0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6 on 0G Galileo (chainId 16602). The full lifecycle was verified with 4 real transactions on vault id=3:
✅ Create Vault — VaultCreated event emitted
✅ Ping — heartbeat recorded
❌ Claim too early — reverts with StillActive() (proves the guard works)
✅ Claim success after 60s of inactivity — beneficiary inherits

The negative and positive claims are 122 seconds apart, exceeding the 60-second window — both halves of the invariant hold under production conditions.

BUILT-FOR-ECOSYSTEM BONUS
Along the way we documented 5 non-trivial 0G gotchas in the README (min priority fee = 2 gwei, MetaMask 11.x quirks, CORS, chainId clarification, EIP-1559 specifics) so the next builder doesn't lose hours.

Repo · Code · Tests · Docs: github.com/zwyzjj/Digital-Legacy
```

### 3.2 短版（≤ 1,000 chars，约 170 词）

```text
Digital Legacy is an on-chain dead-man's switch on 0G Galileo Testnet. One immutable Solidity contract makes "heartbeat + automatic inheritance" an atomic primitive:

- Deposit OG into a vault with a beneficiary + inactivity period
- Ping() periodically as your on-chain heartbeat
- Go silent too long → beneficiary claims everything
- Withdraw anytime before a claim

No lawyers, no custodians, no platform. The contract IS the will — eliminating the single point of failure in self-custody: you.

Verified end-to-end on chainId 16602 with 4 real transactions on vault id=3: VaultCreated → Ping → Claim-too-early (StillActive revert, proves the guard) → Claim success after 60s. Both halves of the invariant hold under production conditions.

Bonus: 5 hard-won 0G gotchas documented in the README (min priority fee = 2 gwei, MetaMask 11.x quirks, CORS, chainId, EIP-1559) so the next builder doesn't lose hours.

Repo: github.com/zwyzjj/Digital-Legacy
Contract: 0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6
```

---

## § 4  Narrative Q1 — "How does your project use 0G?"

> **预估字符上限**：500 chars（最常见）。下面**≈ 480 chars**，安全。

```text
Digital Legacy is deployed as a single Solidity contract directly on the 0G Galileo Testnet (chainId 16602) — 0G isn't just a backend for us, it's the entire execution layer. Every vault, every ping, every claim is a real on-chain transaction settled by 0G's consensus.

In the process of shipping we documented 5 non-trivial 0G specifics (min priority fee = 2 gwei, EIP-1559 native, MetaMask 11.x compatibility, CORS handling, chainId 16602 vs the 16601 in older docs) and published all of them in the README, contributing back to 0G's developer ecosystem.

Roadmap: integrate 0G Storage to encrypt and store the inheritance instructions on 0G's storage layer, making Digital Legacy a full 0G-native stack.
```

---

## § 5  Narrative Q2 — "What's the impact / who is it for?"

> **预估字符上限**：500 chars。下面 **≈ 500 chars**。

```text
Digital Legacy is for every self-custodial crypto user — and there are millions — who has ever asked: "what happens to my coins if I die?" Today the honest answers are "they're gone" or "you trust a centralized custodian's death-notice policy." Neither is acceptable for an asset class that promised sovereignty.

Our impact is to make on-chain inheritance a primitive, not a service. No lawyers, no platforms, no off-chain trust. A retail user deposits assets, designates an heir, pings while alive, and the contract handles the rest. Heirs need no permission, no court order, no custodian goodwill — only the address and a wait.

By documenting 5 0G-specific gotchas in the README, we also lower the on-ramp for the next wave of 0G builders.
```

---

## § 6  Narrative Q3 — "Future roadmap / what's next?"

> **预估字符上限**：500 chars。下面 **≈ 490 chars**。

```text
Three milestones queued:

D4 (next 48h): Integrate 0G Storage to encrypt + persist the heir's instructions (passwords, asset map, last messages) — the on-chain contract unlocks the encrypted blob's decryption rights when claim() succeeds.

D5 (next 2 weeks): Add ReentrancyGuard, a 7-day grace period, and a "social recovery" optional path (M-of-N trustee signatures to extend a ping window).

D6+ (mainnet): Audit the contract, ship to 0G mainnet, build a no-code dashboard, and integrate with hardware wallets (Ledger / Lattice) for plug-and-play vault creation. Goal: 10K vaults under management by end of year.

The MVP shipped in <48h. The full vision is a sovereignty layer for crypto inheritance.
```

---

## § 7  Asset Reference Cheatsheet（资源位置速查）

### 7.1 截图（提交表单可能需要上传）

| 截图 | 物理路径 | 用途建议 |
|---|---|---|
| 01 | `docs/screenshots/01-explorer-contract-deployed.png` | "Contract deployment proof" |
| 02 | `docs/screenshots/02-create-vault-success.png` | "Vault creation success" |
| 03 | `docs/screenshots/03-ping-success.png` | "Heartbeat / ping" |
| 04 | `docs/screenshots/04-claim-too-early-revert.png` | "Negative case — guard works" |
| 05 | **`docs/screenshots/05-claim-success.png`** | **"Inheritance complete" — 最有终态感的一张，cover image 首选** |
| 06 | `docs/screenshots/06-github-repo.png` | "Repository home" |

### 7.2 视频链接占位

```
YouTube (Unlisted): https://youtu.be/_________  ← 10:30 回填
Loom (Public link): https://www.loom.com/share/_________  ← 同步可用兜底
B 站（如做）:    https://www.bilibili.com/video/_________  ← 下午做
```

### 7.3 推文链接占位（08:30 发完回填进 `x-post-live.md`，然后从那边复制过来）

```
Post 1 (A1 announcement): https://x.com/zwyzjj/status/_________
Submitted! quote tweet:   https://x.com/zwyzjj/status/_________
Thread 1/3 (afternoon):   https://x.com/zwyzjj/status/_________
```

### 7.4 关键链上 Tx（已上链，永久可用）

| 用途 | Tx hash |
|---|---|
| Contract deploy | `0xa0f02c538115e305cc8e290fd8602ac60eb2c661e17096c16248a3c301a91ffe` |
| E2E Create Vault | `0x0069b5ecdc88ab1569f273e665793f8e298cd50e6ef707854ea1f89ad9f92b3e` |
| E2E Ping | `0x9d5e9c8e65041753b9e85b2db3a25a09072db0d5a8616d75d7c5219728458806` |
| E2E Claim too early (revert) | `0x3ec5b4a0860cf8eeca63207ce5e50bec186333f581b3988b328625dccbe36e73` |
| E2E **Claim success** | `0xe636eb255581f9dea32597cedbc08f03bfc5febb843df41c58d74e1308f3b64a` |

Explorer base：<https://chainscan-galileo.0g.ai/tx/>

---

## § 8  Submit-Click 前最后 60 秒自检（这一节读完才点提交）

- [ ] 每个外链都在**当前浏览器**点开能不登录访问（不是只在 localhost）
- [ ] 视频链接的播放页面**不要求登录**（Loom 的 Public 模式 / YouTube 的 Unlisted）
- [ ] Track 选项不是 placeholder "Select track..."
- [ ] Narrative 题答案没有 `_________` / `TODO` / 占位符
- [ ] 视频字幕（如自动生成）没有大段错误（YouTube 处理完后回去抽查 30s）
- [ ] 邮箱拼写对（确认邮件靠它）
- [ ] 表单允许编辑/重新提交吗？记下 deadline，万一手滑了能补救

---

## § 9  Submit-Click 后立即做（不要离开浏览器）

- [ ] 截图 `07a-submission-confirm.png`：当前表单提交成功的页面
- [ ] 切到邮箱：等确认邮件到达 → 截图 `07b-submission-email.png`
- [ ] 如果平台有"项目公开页"（评委可见的卡片视图）→ 隐身窗口打开 → 截图 `07c-public-project-page.png`
- [ ] 把 3 张截图 `git add docs/screenshots/07*.png && git commit -m "docs: hackathon submission confirmation screenshots" && git push`
- [ ] 在 X 发"Submitted! 🚀" quote tweet 引用早上的首推
- [ ] 在 0G Discord `#hackathon-submissions` / `#showcase` 频道贴：repo 链接 + 视频链接 + tweet 链接

---

## § 10  如果出问题（提交表单卡死/拒绝）

| 症状 | 处置 |
|---|---|
| 提交点击无反应 | F12 开 console 看错误；截图发主办方 |
| 必填字段说"invalid"但你已填 | 检查字段长度上限（长描述可能 ≤ 1000 chars，用 §3.2 短版）|
| 视频链接 reject | 换另一个平台（YouTube ↔ Loom 来回切） |
| 表单要求 mainnet | 在 description 末尾加一段"Hackathon scope: testnet deployment; mainnet deployment planned post-audit (D6+)" |
| 表单要求 zip 上传 | `git archive --format=zip HEAD -o submission.zip` 然后上传 |
| 表单要求 demo URL 必须 https | 没有公网部署 → 填 repo URL + 在 description 写"local-only at this stage; Vercel deployment planned" |
| 主办方平台未注册 | **立刻**用 GitHub OAuth 登录（一键），不要自己注册邮箱密码 |

---

## § 11  Submission 完成 = D3 红线达成 = 项目交付

提交确认邮件到了 + 截图 07a/07b/07c 都在 git 里 = **这个 hackathon 你已经交付了**。

后续任何评审结果、任何评委反馈、任何 follow-up 提问——都已经是 **bonus**。

**Don't ship the project. Ship the submission.**
