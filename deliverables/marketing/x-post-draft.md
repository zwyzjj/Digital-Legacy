# X / Twitter Post Drafts — Digital Legacy

> **Date drafted**: 2026-05-12
> **Audience**: 0G Hackathon judges + 0G ecosystem builders + Crypto-Twitter
> **Required tags** (verified from D2 runbook): `#0GHackathon`, `#BuildOn0G`, `@0G_labs`
> **Repo**: https://github.com/zwyzjj/Digital-Legacy
> **Explorer (contract)**: https://chainscan-galileo.0g.ai/address/0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6
> **Recommended attached image**: `docs/screenshots/05-claim-success.png` (most visually conclusive — green Success badge on Explorer with on-chain proof)

---

## 选项 A：单条 Punchy Tweet（推荐发首条）

**适用**：标准 280 字符限制；最大化转发概率；做"宣告"用。

> ⚠️ **字符计数提示**：X 把 emoji（✅ 等）算 2 字符，URL 强制算 23 字符，换行也算。下面 3 个变体都**实测在 280 限制内**。

### A1（推荐 · 保留金句）— 约 260 字符

```text
Built Digital Legacy on @0G_labs Galileo — an on-chain dead-man's switch.

Stop pinging → beneficiary inherits.
No lawyers. No platforms. Just code.

✅ Live on testnet (chainId 16602)
✅ E2E verified on-chain

github.com/zwyzjj/Digital-Legacy

#0GHackathon #BuildOn0G
```

### A2（保留 4 个证据点）— 约 245 字符

```text
Built Digital Legacy on @0G_labs Galileo — an on-chain dead-man's switch.

Stop pinging → beneficiary inherits.

✅ Live on testnet (chainId 16602)
✅ E2E: create / ping / revert / claim

github.com/zwyzjj/Digital-Legacy

#0GHackathon #BuildOn0G
```

### A3（最激进瘦身，留余地）— 约 220 字符

```text
Built Digital Legacy on @0G_labs Galileo.

An on-chain dead-man's switch: stop pinging → beneficiary inherits everything.

✅ Live on chainId 16602
✅ E2E verified

github.com/zwyzjj/Digital-Legacy

#0GHackathon #BuildOn0G
```

**附图建议**（任一版本通用）：截图 05（claim success Explorer 页 — 最直观证据）

---

> 📝 **失败案例 · 留作教训**：
> 原始 V0 版本写成：
>
> ```
> Just shipped Digital Legacy — an on-chain dead-man's switch on @0G_labs Galileo.
> Stop pinging → your beneficiary inherits.
> No lawyers. No platforms. Just code.
> ✅ Live on testnet (chainId 16602)
> ✅ E2E verified: create / ping / revert / claim
> github.com/zwyzjj/Digital-Legacy
> #0GHackathon #BuildOn0G
> ```
>
> 实测**超 15 字符**（X 显示 -15、hashtag 被粉色高亮）。Lesson：估算时务必把 emoji × 2、URL 固定 23、换行符也算上。

---

## 选项 B：3-Tweet Thread（推荐 — 故事感最强）

**适用**：希望展开技术细节，吸引评委 + 工程师群体。第一条充当门面，2/3 展示硬货。

### 1/3 — Hook（钩子）

```text
"If I die tomorrow, my crypto dies with me."

Every crypto user knows this fear. Hardware wallets are sealed black boxes. Seed phrases get lost. CEXs freeze on death notice.

So I built a fix on @0G_labs.

🧵👇

#0GHackathon #BuildOn0G
```

### 2/3 — Proof（证据 — 链上可点）

```text
Digital Legacy is one immutable contract:

- Deposit OG into a vault
- Set inactivity period + beneficiary
- Ping while you're alive
- Silent for too long → beneficiary claims everything

Live on 0G Galileo (chainId 16602):
chainscan-galileo.0g.ai/address/0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6

4 txs verified end-to-end ✅
```

**附图建议**：截图 05（Claim Success）—— 唯一的"链上可验证终态"图

### 3/3 — Lesson + CTA（彩蛋 + 行动召唤）

```text
Biggest 0G gotcha I hit:

Minimum priority fee = 2 gwei. Wallets default to 1 wei → mempool silently rejects you. No client error. Just disappears.

Documented this + 4 other traps in the README for the next builder.

Code + docs + demo:
github.com/zwyzjj/Digital-Legacy
```

**字符**：每条约 200–270，全 thread 安全。

---

## 选项 C：Long-Form Post（X Premium 长文，4000 字符）

**适用**：如果你有 X Premium 订阅，单条长文可获得更长曝光时间 + 更高算法权重。把所有故事一次说完。

```text
I just shipped Digital Legacy on @0G_labs Galileo testnet — an on-chain dead-man's switch for crypto inheritance.

THE PROBLEM
"If I die tomorrow, my crypto dies with me." Every self-custodial user knows this fear. Hardware wallets are sealed black boxes. Seed phrases written on paper get lost. Centralized custodians freeze accounts on death notice. Self-custody has a single point of failure: you.

THE SOLUTION
One immutable Solidity contract:
- Deposit any amount into a vault
- Set an inactivity period + designated beneficiary
- Ping periodically — your on-chain heartbeat
- Go silent for too long → beneficiary claims everything
- Withdraw any time before claim

No lawyers. No platform. Just code.

LIVE ON CHAIN
Contract: 0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6
Chain ID: 16602
Explorer: chainscan-galileo.0g.ai

End-to-end verified with 4 real txs on vault id=3:
✅ Create Vault
✅ Ping (heartbeat)
❌ Claim too early → StillActive revert (proves the guard works!)
✅ Claim success after 60s inactivity → beneficiary inherits

THE HARD-WON 0G LESSON
The single most expensive trap I hit:

0G Galileo enforces a minimum priority fee of 2 gwei. Wallets and CLI tools default to 1 wei → mempool silently rejects → NO client-side error surfaced. You think your tx is broadcasting and it just… isn't.

Fix: every contract call now explicitly sets maxPriorityFeePerGas = 2.5 gwei.

I documented this and 4 other non-obvious traps in the README so the next builder doesn't lose hours.

REPO
github.com/zwyzjj/Digital-Legacy

Built for #0GHackathon. PRs and ideas welcome.

#BuildOn0G
```

**字符**：约 1500（X Premium 长文 4000 上限内）
**附图建议**：截图拼贴 02+03+04+05（4 笔 tx Explorer 页 — UI 工具如 [Carbon](https://carbon.now.sh/) 或直接 4 张原图分别上传）

---

## 选项 D：Reply / Quote 模板（社群互动用）

**适用**：评委、其他 hackathon 选手、@0G_labs 官方账号有相关推文时，引用回复。

### D-1：引用 @0G_labs 公告

```text
Built Digital Legacy on @0G_labs this week — on-chain dead-man's switch verified end-to-end.

The min priority fee = 2 gwei gotcha cost me hours. Documented it in the README so others don't bleed.

github.com/zwyzjj/Digital-Legacy

#0GHackathon #BuildOn0G
```

### D-2：评委账号下回复

```text
Hey @judge — Digital Legacy is shipped 🚀
- Live contract on 0G Galileo
- 4 txs verified on Explorer (incl. negative-case revert)
- Bilingual README with 5 documented 0G gotchas

Repo: github.com/zwyzjj/Digital-Legacy

#0GHackathon
```

---

## 发布前 Checklist

- [ ] 三个**必需 hashtag** 都在：`#0GHackathon` / `#BuildOn0G` / `@0G_labs`（前两个是 # 标签，最后是 @ 提及）
- [ ] GitHub URL 已正确：<https://github.com/zwyzjj/Digital-Legacy>
- [ ] 附图至少 1 张（推荐 05-claim-success.png — 是最有"终态感"的一张）
- [ ] 字符数在限制内（A: 280 / B 每条: 280 / C: 4000）
- [ ] Repo 设为 **Public**（如果还是 Private！现在的）—— ⚠️ 发推前**必须改成 Public**，否则任何人点链接都是 404，等于零曝光
- [ ] 在发文前**亲自打开 GitHub 链接确认能未登录访问**

---

## 发布时机建议（玄学但重要）

| 时段（北京时间） | 受众 | 推荐选项 |
|---|---|---|
| 21:00–23:00 周一/周二 | 美国西海岸下班高峰 + 欧洲早晨 | A 或 B |
| 09:00–11:00 周末 | 东南亚 + 中国 + 印度活跃 | C 长文 |
| Hackathon 截止前 24h | 评委集中翻 hashtag | B 三连 + D-2 主动 @ |

---

## 怎么改成 Public（提示）

GitHub → Repository → **Settings** → 最底下 **Danger Zone** → **Change repository visibility** → **Change to public** → 确认输入仓库名。

⚠️ 改 Public 前再做一次**全局密钥扫描**：

```bash
cd "d:\Digital Legacy project"
git log --all --full-history --source -- "*.env" | Out-String
git log --all -p | Select-String "PRIVATE_KEY=0x[a-f0-9]{20,}"
# 应该都是 0 个真实密钥的命中
```

如果扫描出真私钥串（不是占位符），**先**用 `git filter-repo` 清理历史**再**改 Public。

---

## 心理预期管理

- 没 follower 的话，第一条不会爆，**别气馁**；hashtag 检索会让评委看到
- 真正起量靠 reply / quote 别人（选项 D），不是发帖
- 评委通常会看：repo star、commit 数、README 质量、链上 tx 真实性 —— 你这四项都打满了，发帖只是把这件事告诉他们
