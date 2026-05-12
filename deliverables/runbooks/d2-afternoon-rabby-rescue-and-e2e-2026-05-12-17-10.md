# D2 下午 Runbook — Rabby 救场 + E2E 冒烟 + GitHub 固化

> 生成时间：2026-05-12 17:10
> 项目根：`d:\Digital Legacy project\`
> Cursor 终端先：`cd "d:\Digital Legacy project"`
> **D2 红线（22:00）**：三个 event 全绿 + GitHub push + README 中英双版
> 评审决议：MetaMask 不再投入；Rabby 首选；Edge/Chrome 兜底；私钥前端直签是最后底牌

---

## 关键事实（置顶）

| 项 | 值 |
|---|---|
| 合约地址 | `0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6` |
| Chain ID | `16602`（不是 16601） |
| RPC（部署用） | `http://evmrpc-testnet.0g.ai` |
| RPC（前端走代理） | `http://localhost:3000/api/rpc` |
| 部署账户 | `0xec70b55318c11D6344C29730f14A93CD7beDE874` |
| 余额 | ≈ 0.493 OG |
| 已知失败路径 | Brave + MetaMask 11.x → addDappTransaction 强制 gas=21000，链上 revert |
| 失败 tx（Nonce=4） | gas=21000 + revert，已上链可在 Explorer 查 |

---

## 阶段 0（必做，2 min）：Edge / Chrome 兜底验证

**为什么先做**：如果换浏览器就能修，省 30 分钟装 Rabby。

### 步骤
1. 打开 **Microsoft Edge**（Win 自带；如没装 Chrome 用 Edge）
2. 装 MetaMask 扩展：https://microsoftedge.microsoft.com/addons/detail/metamask/ejbalbakoplchlghecdalmeeeajnimhm
3. 导入种子词（来自现有 MetaMask：设置 → 安全和隐私 → Reveal secret phrase）
4. 加 0G Galileo：
   - 名称：`0G Galileo Testnet`
   - RPC：`http://evmrpc-testnet.0g.ai`（直连，先不走代理）
   - chainId：`16602`
   - 符号：`OG`
   - Explorer：`https://chainscan-galileo.0g.ai`
5. 切到 0G 网络，确认余额 ≈ 0.493 OG
6. 浏览器开 `http://localhost:3000`（dev 服务还跑着吧？没跑就 `cd web && pnpm dev`）
7. 点 Connect → 授权 → 点 Create Vault（任意填）→ 看 MetaMask 弹窗的 **gas limit 字段**

### 判定
- 🟢 **gas limit 显示约 198k 或更高** → 你直接进 §阶段 2 跑 E2E（Edge 救场，跳过 Rabby）
- 🔴 **gas limit 仍是 21000** → MM 11.x 的全平台问题，进 §阶段 1 装 Rabby
- 🔴 **任何其他错** → 截图发我，我出 §阶段 1.5 诊断 MD

---

## 阶段 1（如阶段 0 红）：装 Rabby 救场（25 min）

### 1.1 装 Rabby（5 min）

- Brave/Edge/Chrome 任选，去：https://rabby.io/
- 点 "Add Rabby to Browser" → 装扩展
- 启动 Rabby → **Import Private Key**（**不要**导种子词，只导部署账户私钥即可）
  - 私钥来源：`d:\Digital Legacy project\contracts\.env` 里的 `PRIVATE_KEY`
  - **重要安全提醒**：这是 testnet 私钥，可以这么干；mainnet 永远别这么导
- 导入后看到地址 `0xec70b55318c11D6344C29730f14A93CD7beDE874`

### 1.2 加 0G Galileo 网络（3 min）

Rabby 默认不带 0G，手动加：

1. Rabby → More → Custom Networks → Add Custom Network
2. 填：
   - Network Name：`0G Galileo Testnet`
   - RPC URL：`http://evmrpc-testnet.0g.ai`
   - Chain ID：`16602`
   - Currency Symbol：`OG`
   - Block Explorer：`https://chainscan-galileo.0g.ai`
3. Save → 切到此网络
4. 确认看到余额 ≈ 0.493 OG

### 1.3 让 Rabby 抢回 window.ethereum（重要）

Brave 里如果同时装了 MetaMask、Brave Wallet、Rabby，要保证 dapp 拿到的是 Rabby：

- **方法 A（推荐）**：暂时禁用 MetaMask 扩展（chrome://extensions → MetaMask 关掉）
- **方法 B**：在 Rabby 设置里勾选 "Default Wallet"
- Brave Wallet 你之前已经在 `brave://settings/wallet` 关了 ✅

### 1.4 让前端 wagmi 配置兼容 Rabby（让 Cursor 改）

**复制下面这段给 Cursor**：

```
项目根：d:\Digital Legacy project\
任务：让前端钱包连接对 Rabby 友好

1. 检查 web/src/lib/wagmi.ts，确认 connectors 列表包含 injected() —— Rabby 注入的 window.ethereum 会被它捕获，不需要单独 connector

2. 检查 web/src/components/vault-panel.tsx，确认你之前那版直连 window.ethereum.request 的代码还在
   - 这版代码对 Rabby 完全适用（Rabby 的 window.ethereum 实现兼容 MetaMask 的 EIP-1193 接口）
   - 但要去掉之前为了绕开 MM 强行预填 gas 的代码，让 Rabby 自己估 gas（它对合约调用估算正确）
   
3. 具体改动：
   - vault-panel.tsx 里调 eth_sendTransaction 时，tx 对象只保留：
       { from, to, data, value }
     删除 gas / gasPrice / nonce 字段（让 Rabby 自己算）
   - 保留 console.log 便于调试

4. 不需要改 .env.local，不需要改 wagmi.ts 链配置

写完保存即可，dev 服务热更新会接管。
```

### 1.5 测试 Connect

1. 浏览器开 `http://localhost:3000`
2. 点 Connect → 应该弹 Rabby 的 Connect 确认页（**注意**：不是 MetaMask 的）
3. 授权 → 看右上角显示地址 + 0G Galileo

🟢 通过 → 进 §阶段 2

🔴 卡住 → 截图发我

---

## 阶段 2：E2E 冒烟（30 min，不能省）

准备：账户里至少 0.05 OG（前面失败 tx 烧了一些，余额够就行）

### 2.1 Create Vault（5 min）

- beneficiary 填：你 MetaMask 里**另一个**地址（去 Rabby/MM 创建一个新账户、复制地址即可）
- pingInterval 填：`60`（秒，便于后面 claim 测试）
- 点 Submit → Rabby 弹签名页
- **关键检查**：Rabby 弹窗里 **gas limit ~ 200000**（不是 21000！）
- 确认签名 → 等 tx hash → 等确认（约 3-5 秒）

**Explorer 验证**：点 tx hash 跳 `https://chainscan-galileo.0g.ai/tx/<hash>`，应看到：
- Status: Success ✅
- Logs 有 `VaultCreated(uint256 id, address indexed owner, address indexed beneficiary, uint256 pingInterval)`

📸 截图：`docs/screenshots/02-create-vault-success.png`

### 2.2 Ping（3 min）

- vaultId = `0`（你刚创建的第一个）
- Submit → 签名 → 确认
- Explorer：event `Pinged(uint256 id, uint256 timestamp)`

📸 截图：`docs/screenshots/03-ping-success.png`

### 2.3 Claim 负例（应失败）（2 min）

- 立即 claim vaultId=0（还没过 60 秒）
- 期望：tx revert（StillActive error）
- 这证明合约是**真的在工作**，不是空合约

📸 截图：`docs/screenshots/04-claim-too-early-revert.png`

### 2.4 Claim 正例（10 min）

1. 在 Rabby 切换到 **beneficiary 那个账户**
2. （可能需要给 beneficiary 转 0.01 OG 当 gas 费 —— 用 Rabby Send 一笔即可）
3. 等 60+ 秒（看手表）
4. claim vaultId=0 → 签名 → 确认
5. 期望：Success
6. Explorer：event `Claimed(uint256 id, address indexed beneficiary, uint256 amount)`

📸 截图：`docs/screenshots/05-claim-success.png`

### 全绿定义
- 至少 **VaultCreated + Pinged + Claimed** 三个 event 在 Explorer 可见
- 截图齐全（02-05）
- 如果 Claim 正例时间不够，至少做完 02-03，剩下今晚补

---

## 阶段 3：Commit + Push GitHub（20 min）

### 3.1 修 contracts/.env 残留（chainId）

```bash
cd "d:\Digital Legacy project"
# 编辑 contracts/.env，把 CHAIN_ID=16601 改成 16602
# 这文件 .gitignore 屏蔽，不会入库，但本地正确性也要修
```

### 3.2 Pre-commit 安全核查

```bash
cd "d:\Digital Legacy project"
git status
# 必须满足：
#   - 看不到任何 .env / .env.local 文件
#   - 看不到 web/.next/
#   - 看不到 web/node_modules/
# 看到上面任何一个 STOP，先修 .gitignore
```

### 3.3 Commit

```bash
cd "d:\Digital Legacy project"
git add web docs deliverables
git status   # 再核查一次

git commit -m "feat(web): D2 - end-to-end demo on 0G Galileo

- Wallet: switched MetaMask -> Rabby (MM 11.x ignores dapp gas, forces 21000)
- Frontend: vault-panel.tsx with createVault/ping/claim via window.ethereum
- API proxy: web/src/app/api/rpc/route.ts (CORS + retry)
- E2E verified on 0G Galileo testnet (chainId 16602):
  * VaultCreated event ok
  * Pinged event ok
  * Claimed event ok (StillActive revert verified as negative case)
- Screenshots: docs/screenshots/02-05
- Runbooks: deliverables/runbooks/

D2 evening reflections logged in deliverables/runbooks/d2-afternoon-*.md
"
git log --oneline -10
```

### 3.4 Push GitHub（10 min）

**如果还没建 GitHub repo**：

1. 浏览器开 https://github.com/new
2. Repo name: `digital-legacy-0g`（或你喜欢的）
3. **Private** ✅（黑客松前别公开）
4. **不要**勾 README / .gitignore / license（本地已有）
5. Create

**关联本地 + push**：

```bash
cd "d:\Digital Legacy project"
git remote -v   # 看有没有 origin

# 如果没有，二选一：

# 方案 A：HTTPS + PAT（推荐，5 min）
# 1. github.com → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
# 2. 勾 repo 全部权限 → Generate → 复制 token（只显示一次！）
# 3. 然后：
git remote add origin https://github.com/<你的用户名>/digital-legacy-0g.git
git branch -M main
git push -u origin main
# 提示输入用户名 = GitHub 用户名
# 提示输入密码 = 刚刚那个 PAT（粘贴进去）

# 方案 B：SSH（如已配 key）
git remote add origin git@github.com:<你的用户名>/digital-legacy-0g.git
git branch -M main
git push -u origin main
```

### 3.5 Push 后核查
- GitHub 网页打开 repo，看到所有文件 ✅
- 重点确认：**没有任何 .env 文件**（搜索框搜 ".env"）
- 截图：`docs/screenshots/06-github-repo.png`

---

## 阶段 4：README 中英双版（19:00 后做，1.5 h）

如果阶段 2 已经全绿，README 就稳了。**MD 我会在阶段 2/3 全绿后单独出一份**，不在这份 runbook 里展开。

预告骨架（提前心里有底）：
- Title + One-liner（"On-chain dead-man's switch on 0G — auto-transfer your assets when you're gone"）
- Architecture diagram（合约 + 前端 + 0G Storage + 0G Chain）
- Quick Start（3 命令跑起来）
- Contract addresses + Explorer link
- Demo GIF / 截图
- Tech stack tags
- Hackathon 强制项：#0GHackathon #BuildOn0G @0G_labs

---

## 收工 Checklist（22:00 红线）

- [ ] §阶段 0 或 §阶段 1 选定钱包路径（Edge MM 或 Rabby）
- [ ] §2.1 Create Vault → VaultCreated event 可见
- [ ] §2.2 Ping → Pinged event 可见
- [ ] §2.3 Claim 负例 → revert 验证合约逻辑
- [ ] §2.4 Claim 正例 → Claimed event 可见（可推迟到 21:30）
- [ ] §3 git commit + push GitHub（Private 仓）
- [ ] 截图 02-06 齐全
- [ ] §4 README 至少完成中文版（英文版可推到 D3 上午）

**红线说明**：截图齐全 + GitHub push 是硬要求；Claim 正例和英文 README 可顺延。

---

## 意外处理表（D2 下午专版）

| 症状 | 原因 | 处置 |
|---|---|---|
| Rabby 装完点 Connect 没反应 | MM/Brave Wallet 抢 window.ethereum | 禁用 MM 扩展 + 重启浏览器 |
| Rabby 弹窗 gas 还是 21000 | dapp 还在塞 gas 字段 | 让 Cursor 把 tx 对象的 gas/gasPrice/nonce 全删干净 |
| `eth_call` 报 invalid chainId | wagmi.ts 没改 | 检查 `id: 16602` |
| Explorer 看不到 event | tx 失败或 ABI 不匹配 | 看 tx Status，对照 contracts/src/Legacy.sol 的 event 签名 |
| Claim 正例签名后 Rabby 报 insufficient funds | beneficiary 账户没 OG | 从 deployer 转 0.01 OG 过去 |
| GitHub push 提示 large files | web/node_modules 漏挡了 | `git rm -r --cached web/node_modules && git commit --amend` |
| PAT 输入后还是 401 | PAT 没勾 repo 权限或过期 | 重新生成 + 重 push |

---

## D3 上午预告（明天再想）

- README 英文版
- X 公开帖（含强制 hashtag）
- Demo 视频录制（≤3min）
- 提交表单填写（Hackathon submission portal）

---

## 核心心智模型（写进脑子）

> **黑客松 Demo 哲学**：能跑通 + 看起来酷 > 技术完美。
> MetaMask 11.x + 0G 是上游问题，不是你的问题。Rabby 解决，下班，写 README。
