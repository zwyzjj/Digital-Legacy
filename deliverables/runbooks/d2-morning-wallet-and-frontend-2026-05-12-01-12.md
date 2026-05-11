# D2 上午 Runbook — 修钱包 + E 段前端壳

> 生成时间：2026-05-12 01:12
> 项目根：`d:\Digital Legacy project\`
> Cursor 终端先执行：`cd "d:\Digital Legacy project"`

## 关键事实（置顶）

| 项 | 值 |
|---|---|
| 合约地址 | `0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6` |
| chainId | `16602` |
| RPC | `http://evmrpc-testnet.0g.ai` |
| Explorer | https://chainscan-galileo.0g.ai/address/0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6 |
| 目标 | 修好钱包连接 → 跑通 Connect + createVault / ping / claim 三按钮 |

---

## 执行前体检（2 分钟）

```bash
cd "d:\Digital Legacy project"
git log --oneline -5
git status
ls web/src/lib/wagmi.ts
cat web/.env.local 2>/dev/null || echo "缺 web/.env.local — Step 2 会建"
```

**预期**：git log 能看到昨晚 D1 commit；git status clean；wagmi.ts 存在。

---

## Step 1：修钱包连接（二选一）

### 方案 A（首选）：取消 MetaMask Chrome 侧边面板 pin

1. Chrome 右上角工具栏 → 右键 MetaMask 图标
2. 选 **Unpin**（或中文"取消固定"）
3. 关掉所有侧边面板（按 Esc 或点 X）
4. 再点 MetaMask 图标，这次应该是**独立弹窗**（不是侧边面板）
5. 重新打开 `http://localhost:3000`（下一步 Step 3 会启），点 Connect，MetaMask 独立弹窗应正常唤起连接确认页

**判定通过**：能看到 "Connect this site to MetaMask" 确认页并能点 Connect。

### 方案 B（方案 A 失败时）：换浏览器

1. 下载 Brave：https://brave.com/download/
2. Brave 装 MetaMask 扩展：https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn
3. 导入你现有 seed phrase（MetaMask 设置 → Security → Reveal secret phrase）
4. 加 0G Galileo 网络：
   - 网络名：`0G Galileo Testnet`
   - RPC：`http://evmrpc-testnet.0g.ai`
   - chainId：`16602`
   - 符号：`OG`
   - Explorer：`https://chainscan-galileo.0g.ai`
5. 切到 0G 网络，确认余额可见

**判定通过**：Brave MetaMask 能看到 0G 网络 + 测试币余额。

---

## Step 2：补 `web/.env.local`（前端读合约地址）

**让 Cursor 执行**（复制下面这段给它）：

```
在 d:\Digital Legacy project\web\ 下创建 .env.local（如果已存在则更新），内容：

NEXT_PUBLIC_LEGACY_ADDRESS=0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6
NEXT_PUBLIC_CHAIN_ID=16602
NEXT_PUBLIC_RPC_URL=http://evmrpc-testnet.0g.ai

并确认 web/.gitignore（或根 .gitignore）已屏蔽 .env.local（不能入库）。
```

**人工核查**：
```bash
cat "d:/Digital Legacy project/web/.env.local"
cd "d:\Digital Legacy project"
git status          # 不应看到 .env.local
```

---

## Step 3：启前端 + 试 Connect

```bash
cd "d:/Digital Legacy project/web"
pnpm install        # 如果 node_modules 还没装
pnpm dev
```

浏览器开 `http://localhost:3000`：

1. 点 **Connect**（RainbowKit 按钮）
2. 选 MetaMask
3. 用方案 A 或 B 修好的 MetaMask 授权连接
4. 页面应显示你的地址 + 网络 `0G Galileo Testnet`

**判定通过**：右上角显示地址（如 `0xabc...123`）且网络正确。

**卡点回报**：如果 Connect 还是不弹，告诉我"Step 3 钱包弹窗 XXX"，我接着出 Step 3.1 诊断 MD。

---

## Step 4：E 段三按钮（让 Cursor 写代码）

**复制下面这段原样发给 Cursor**：

```
项目根：d:\Digital Legacy project\
目标：在 web/src/app/page.tsx（或现有首页组件）下方加一个 <Vault /> 面板，含三个按钮：

1) Create Vault
   - 输入框：beneficiary（address） + pingInterval（秒，默认 86400）
   - 点击调用合约 createVault(beneficiary, pingInterval)
   - 用 wagmi 的 useWriteContract

2) Ping
   - 输入框：vaultId（uint256）
   - 点击调用 ping(vaultId)

3) Claim
   - 输入框：vaultId（uint256）
   - 点击调用 claim(vaultId)

要求：
- 合约地址从 process.env.NEXT_PUBLIC_LEGACY_ADDRESS 读
- ABI 从 contracts/out/Legacy.sol/Legacy.json 复制一份到 web/src/lib/legacyAbi.ts 作为 const as const
- 每个按钮点完用 useWaitForTransactionReceipt 等确认，并在按钮下方显示 tx hash（点击跳 https://chainscan-galileo.0g.ai/tx/<hash>）
- 错误用 toast 或简易红字显示（不要 alert）
- 样式用 shadcn/ui Button + Input + Card
- 不写 useState 嵌套地狱，用一个 useForm 或简单的 3 个独立 useState 即可

写完跑 pnpm dev，确认无 TS 报错、无 console error。
```

---

## Step 5：端到端冒烟（最关键）

准备：MetaMask 里有 ≥0.01 OG 测试币。

1. **Create Vault**
   - beneficiary = 你 MetaMask 里另一个地址（或再导一个账号）
   - pingInterval = `60`（1 分钟，方便 claim 测试）
   - 点提交 → MetaMask 弹签名 → 等 tx 确认
   - 期望：tx 成功，显示 tx hash
   - Explorer 验证：点 tx hash 跳转，应看到 event `VaultCreated`

2. **Ping**
   - vaultId = `0`（第一个 vault）
   - 点提交 → 签名 → 确认
   - Explorer 验证：event `Pinged`

3. **Claim**（负例 — 应失败）
   - 马上 claim vaultId=0，此时还没过期
   - 期望：tx revert（StillActive error）
   - 这证明合约在工作

4. **Claim**（正例）
   - 切到 beneficiary 地址
   - 等 60+ 秒（过 pingInterval）
   - claim vaultId=0 → 应成功
   - Explorer 验证：event `Claimed`

**全绿定义**：三个 event 都能在 Explorer 看到；前端三按钮都能触发 tx；冒烟失败也算进度（记下错误 message，我帮你看）。

---

## Step 6：截图 + commit

```bash
cd "d:\Digital Legacy project"
# 截图放 docs/screenshots/
# 建议：02-connect-success.png / 03-create-vault-tx.png / 04-claim-success.png

git add web docs
git status    # 再次确认无 .env.local
git commit -m "feat(web): D2 - wallet connect + createVault/ping/claim MVP

- .env.local wired (LEGACY_ADDRESS + chainId 16602)
- RainbowKit Connect working (MetaMask unpinned / Brave)
- Vault panel: createVault / ping / claim buttons
- E2E smoke on 0G Galileo: VaultCreated + Pinged + Claimed events verified
- Screenshots: docs/screenshots/02~04
"
git log --oneline -5
```

---

## 收工 Checklist（D2 上午 end）

- [ ] Step 1 钱包连接修好（方案 A 或 B）
- [ ] Step 2 `web/.env.local` 写入且未入库
- [ ] Step 3 Connect 成功，显示地址 + 0G Galileo
- [ ] Step 4 三按钮 UI 出来，无 TS 错
- [ ] Step 5 三个 event 在 Explorer 可见（至少 VaultCreated + Pinged）
- [ ] Step 6 commit + 截图

---

## 意外处理表

| 症状 | 原因 | 处置 |
|---|---|---|
| Connect 点了没反应 | MetaMask pin 模式老问题 | 强制走方案 B（Brave） |
| `ChainMismatch` | wagmi 里 chainId 没更新 | 检查 web/src/lib/wagmi.ts 是 16602 |
| `insufficient funds` | 测试币不够 | 再去 faucet.0gfoundation.ai 领 |
| `contract not deployed` | 地址敲错 | 对 DEPLOYED.md 逐字符比对 |
| tx 一直 pending | 0G 测试网拥堵或 gas 太低 | MetaMask 里 Speed up，或等 1 分钟再试 |
| claim 报 StillActive | 过期时间没到 | 等够 pingInterval 秒再 claim |
| ABI 字段报 not a function | Cursor ABI 拷贝丢了 as const | 检查 web/src/lib/legacyAbi.ts 末尾有 `as const` |

---

## D2 下午预告（别现在做）

- README 中英双版（Hackathon 强制项）
- X 公开帖草稿（含 #0GHackathon #BuildOn0G @0G_labs）
- Demo 视频脚本（≤3min）
