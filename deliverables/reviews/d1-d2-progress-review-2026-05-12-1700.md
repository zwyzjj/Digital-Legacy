# Digital Legacy — D1 / D2 内部评审材料

> **生成时间**：2026-05-12 17:00（UTC+8）
> **作用域**：从 D1 Runbook 启动 → D1 收尾 Runbook → D2 上午 Runbook 至今的全部进展、变动与阻塞点
> **当前状态**：D1 红线已达成（合约上链 + 测试通过）；D2 红线**未达成**（前端发交易卡在 MetaMask 内部，已上链 1 笔但 gas 不足 revert）

---

## 0. TL;DR

| 维度 | 结论 |
|---|---|
| **D1（合约）** | ✅ 完成。Legacy 合约部署到 0G Galileo Testnet（Chain ID 16602），3 个测试用例 PASS。 |
| **D2 上午（钱包 + 前端）** | 🟡 80% 完成。前端 UI 完整，钱包连接 OK，**但 `eth_sendTransaction` 路径在 Brave + MetaMask 11.x + 0G testnet 组合下抛 `signal is aborted` / `Failed to fetch`**。 |
| **新发现** | MetaMask **实际把交易提交到链上了**（看 MetaMask 交易历史 Nonce=4），但 **gas limit 被 MetaMask 强制改为 21000**（普通转账 gas），导致 `createVault` 链上 revert。我们前端预填的 `gas: 0x303ce`（约 198 k）被忽略。 |
| **下一步首选** | Plan C：**完全绕开 `eth_sendTransaction`**，让前端自己用 viem 把交易组装+签名，走 `eth_sendRawTransaction` 提交。这条路径既不依赖 MetaMask 的内部 `addDappTransaction`，也不依赖它的 gas 估算。 |

---

## 1. 项目目标回顾（来自原 Runbook）

### D1（夜间，已固化）
1. 用 Foundry scaffold + 写 `Legacy.sol`（dead-man's switch on 0G）
2. 写测试 + 部署到 0G Galileo Testnet
3. `git commit` 固化，私钥不入库

### D1 收尾 Runbook（已部分完成）
1. MetaMask chainId 改成 16602 ✅
2. `web/src/lib/wagmi.ts` 同步更新 ✅
3. Explorer 验证 + 截图 ✅
4. `git commit` 固化 ✅（私钥未入库已验证）
5. 推 GitHub —— 暂跳过（用户当时未配 SSH/PAT）

### D2 上午 Runbook（进行中）
1. 修 MetaMask + RainbowKit 连接（30-60 min 预估）
2. E 段前端壳：Connect Wallet + createVault/ping/claim 三个交互（3-4h 预估）
3. README 中英各 1 页（1h）

**实际投入**：已远超 4 小时，**卡在第 1 步 + 第 2 步交叉的钱包发交易环节**。

---

## 2. D1 已固化的关键事实

| 项 | 值 |
|---|---|
| 合约地址 | `0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6` |
| 部署 Tx | `0xa0f02c538115e305cc8e290fd8602ac60eb2c661e17096c16248a3c301a91ffe` |
| Chain ID | **16602**（**不是** 16601，0G 官方旧文档有误） |
| RPC URL（部署用） | `http://evmrpc-testnet.0g.ai`（部署用 http，https 在 Foundry 下 TLS 失败） |
| Deployer | `0xec70b55318c11D6344C29730f14A93CD7beDE874` |
| 余额 | 部署前 0.5 OG → 当前 ≈ 0.493 OG |
| 测试结果 | **3 PASS**：`testCreateVault` / `testClaimTooEarly` / `testClaimAfterInactivity` |
| Explorer 验证 | https://chainscan-galileo.0g.ai/address/0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6 已确认为合约地址，截图存 `docs/screenshots/01-explorer-contract-deployed.png` |

---

## 3. 已落地的代码 / 配置变动清单

### 3.1 合约层 `contracts/`

| 文件 | 变动 |
|---|---|
| `contracts/src/Legacy.sol` | 用户重写：Vault 结构（`createVault` / `ping` / `claim` / `withdraw`），自定义 errors（`NotOwner` / `StillActive` / `ZeroAmount` 等），事件 `VaultCreated` / `Pinged` / `Claimed` / `Withdrawn` |
| `contracts/test/Legacy.t.sol` | 适配新合约签名（`createLegacy` → `createVault`，`claim(owner)` → `claim(id)`） |
| `contracts/script/Deploy.s.sol` | `console.log` → `console2.log` + `import "forge-std/console2.sol"` |
| `contracts/foundry.toml` | 添加 `solc = "0.8.24"` + `rpc_endpoints.og_galileo` |
| `contracts/.env` | 用户填入实际 `PRIVATE_KEY`，`RPC_URL`，`CHAIN_ID=16601`（**注意 .env 内 chainId 现仍为 16601，但部署实际命中 16602；评审时确认是否修正**） |
| `contracts/.gitignore` | 创建/确认 `.env`、`.env.local` 屏蔽 |
| `contracts/DEPLOYED.md` | 新增，记录地址 / Tx / Chain ID / RPC |

### 3.2 仓库根

| 文件 | 变动 |
|---|---|
| `.gitignore` | 全局规则：`node_modules/`、`.env*`、`out/`、`cache/`、`dist/`、`.next/`、`.vscode/`、`.idea/`、`.DS_Store`、`*.log` |
| `git config` | 用户 / 邮箱已设为用户的 GitHub 身份（邮箱 `354468462@qq.com`） |
| `git commits` | D1 提交：`feat(d1): deploy Legacy.sol to 0G Galileo (chainId=16602)`（含合约、测试、DEPLOYED.md，无 .env） |

### 3.3 前端 `web/`

| 文件 | 变动 |
|---|---|
| `web/.env.local` | `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=504dc3f1c6d08cd705381272b41ca342`、`NEXT_PUBLIC_LEGACY_ADDRESS=0x240Da0...`、`NEXT_PUBLIC_CHAIN_ID=16602`、`NEXT_PUBLIC_RPC_URL=https://evmrpc-testnet.0g.ai` |
| `web/src/lib/wagmi.ts` | 链配置 `id: 16602`、`name: "0G Galileo Testnet"`、native `OG`，RPC 用 `/api/rpc`（浏览器侧）+ `https://...`（SSR 侧），timeout/retry 调高 |
| `web/src/lib/contracts.ts` | 新文件，`getLegacyContractAddress()` 从 env 或默认地址 |
| `web/src/lib/legacyAbi.ts` | 新文件，从 `contracts/out/Legacy.sol/Legacy.json` 抽出的 const ABI |
| `web/src/app/api/rpc/route.ts` | **新增 Next.js API 代理**：浏览器/MetaMask → 本地 Next 服务 → 0G RPC，绕开浏览器 CORS。已加 CORS 响应头 + OPTIONS preflight + error 包装 |
| `web/src/components/vault-panel.tsx` | 多次重写。**当前版本**：完全绕开 RainbowKit/wagmi 的 connect 状态，直接用 `window.ethereum.request` 发交易；在调 MetaMask 之前**自己经代理把 gas / gasPrice / nonce 全估好预填**，意在让 MetaMask 只剩"签名+发送"。 |
| `web/src/app/page.tsx` | 渲染 `<Vault />` 组件 |

### 3.4 MetaMask 配置变动（用户在浏览器侧操作）

| 配置 | 旧值 / 默认 | 当前值 |
|---|---|---|
| 0G 网络 Chain ID | 16601（旧文档） | **16602** |
| 0G 网络 RPC URL | `http://evmrpc-testnet.0g.ai` → `https://evmrpc-testnet.0g.ai` | 当前 `http://localhost:3000/api/rpc`（走我们的代理） |
| 安全和隐私 → 网络钓鱼检测 | ON | OFF |
| 隐私 → **基本功能** | ON | OFF |
| 隐私 → 批量账户余额请求 | ON | OFF |
| 交易 → **预计余额变化**（Transaction Simulation） | ON | OFF |
| 交易 → 安全提醒（Blockaid） | ON | OFF |
| 交易 → 智能交易 | OFF | OFF |
| 资产 → 自动检测 NFT / 代币 / NFT 媒体 | ON | OFF |

---

## 4. 进行中的核心阻塞点：前端发交易

### 4.1 现象时间线

| 阶段 | 现象 | 直接原因 | 解决/绕过 |
|---|---|---|---|
| A. 初始 | RainbowKit "连接钱包" 按钮卡死在 "正在打开 MetaMask...在扩展中确认连接" 转圈 | Brave Wallet 抢占 `window.ethereum`，RainbowKit connector 握手不响应 | 在 `brave://settings/wallet` 把 Brave Wallet 关闭；改用 `window.ethereum.request({method:"eth_requestAccounts"})` 直连 |
| B. 直连后 | `eth_requestAccounts` 在 Console 直接返回账户（不弹窗）✅ | 站点已授权过，MetaMask 静默返回 | — |
| C. 调 `eth_sendTransaction` | `MetaMask - RPC Error: signal is aborted without reason (code -32603)` | MetaMask 内部 fetch（addDappTransaction）被 `AbortController.abort()` 砍 | 试图换 RPC（http → https → 本地代理） |
| D. 切到 https RPC | 报错变 `Failed to fetch` | 0G 的 https RPC 端点对浏览器 / 扩展上下文没返回 CORS / TLS 不稳 | 上 Next.js API 代理 `/api/rpc`（服务端 fetch 上游） |
| E. 切到 `http://localhost:3000/api/rpc` | 报错回到 `signal is aborted` | dev 服务终端日志显示 MetaMask **确实**在通过代理拉 RPC（数百条 200，每条 150-450 ms），代理本身完全健康 | 在前端预先估好 gas/gasPrice/nonce 全部塞进 tx |
| F. 预填 tx 参数 | console log 显示 `[Vault] sending tx with pre-filled params: {gas: '0x303ce', …}` ✅；MetaMask 还是抛 `Failed to fetch` | 走过 `eth_estimateGas` / `eth_gasPrice` / `eth_getTransactionCount` 全部成功（直连代理），但 MetaMask `addDappTransaction` 内仍调一个**外部**服务并 abort | 关 MetaMask 全部"智能"功能（见 3.4 表） |
| G. 全部智能开关 OFF | **错误依然是** `signal is aborted` / `Failed to fetch` | MetaMask 在我们当前组合下 send path 仍 abort | 进入决定性诊断 |
| H. **决定性诊断**：MetaMask 内部点"发送 0.001 OG 给自己"（不走 dapp） | **同样失败** —— 但 MetaMask 交易历史显示这笔 tx **已上链**，Nonce=4、状态=失败、**燃料限额=21000**、共计 0.01 OG | **重大新发现**：MetaMask 把交易广播出去了，但 **gas limit 被强制设为 21000**（普通转账的 gas，对合约调用根本不够），所以链上 revert。我们前端预填的 `0x303ce`（约 198 k）**没生效**。 | 见 §5 |

### 4.2 关键技术事实

1. **`/api/rpc` 代理工作正常**：dev 服务日志统计有几百条 `POST /api/rpc 200`，全部 < 500 ms。`curl` / 浏览器 fetch 直连代理拿 `eth_chainId` 都返回 `0x40da`（16602）。
2. **window.ethereum 连接正常**：`await window.ethereum.request({ method:"eth_requestAccounts" })` 在 Console 直接返回 `["0xec70...874"]`，无需弹窗，说明站点授权状态健康。
3. **前端预填 gas/gasPrice/nonce 成功**：viem `encodeFunctionData` 生成的 calldata 正确，eth_estimateGas 通过代理返回 0x303ce（约 198 k），但**没被 MetaMask 采纳**。
4. **MetaMask 实际广播了 tx**：Nonce 4 已经被链占用，意味着 send path 走完了 RPC 提交那一步；abort 发生在客户端 promise 链上某一段。
5. **D1 的合约本身和 0G 链本身没问题**：测试 PASS、`cast call` 能读、`forge create` 能写。问题完全集中在 **浏览器 → MetaMask → 0G** 这条链。

### 4.3 错误堆栈（来自 Brave + MetaMask 11.x extension）

```text
at new o (chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/common-8.js:1:95982)
at i (chrome-extension://...common-8.js:1:99073)
at Object.internal (chrome-extension://...common-8.js:1:99682)
at Vt.J (chrome-extension://...common-9.js:1:301012)
at async n.addDappTransaction (chrome-extension://...background-0.js:1:280912)
at async eth_sendTransaction (chrome-extension://...common-4.js:19:50458)
```

`Vt.J` 调用未知（无 source map），但位于 `addDappTransaction` 内部。已经排除：smart transactions / transaction simulation / blockaid / phishing / 4byte decode 等所有 MetaMask 的"智能" feature（已逐项关闭）。

### 4.4 已排除的可能性

- ❌ CORS / mixed-content（已用 API 代理 + http://localhost）
- ❌ chainId 错（已确认 0x40da = 16602）
- ❌ RPC 端点慢（代理日志每条 < 500 ms）
- ❌ wagmi / RainbowKit 抽象层 bug（已直连 `window.ethereum`）
- ❌ MetaMask 智能 feature timeout（已全部关闭）
- ❌ 私钥/余额问题（账户有 0.493 OG，足够）
- ❌ 合约 ABI 错（calldata 已 console.log 校验，是合法的 `createVault(address,uint256)` 编码）
- ❌ 0G 链异常（D1 `forge create` 成功；测试发现 0G testnet 在 https 下偶尔 TLS 投诉，但 http 路径 + 本地代理工作良好）

### 4.5 当前最可能的根因（推测）

**MetaMask 11.x 在某些场景下会把 dapp 传入的 `gas` 字段忽略**，自己用 21000 默认值发出 tx，并且在此过程中前端层的 `Promise` 被 `AbortController` 提前 `.abort()`（无 reason），导致前端拿到 `signal is aborted`，但**tx 实际已经丢给 RPC 广播**。

这个推测和 §4.1 H 行的"实际已上链 + gas=21000"完全吻合。

---

## 5. 下一步建议（按推荐优先级）

### Plan C（强烈推荐）：完全绕开 MetaMask 的 `eth_sendTransaction`

**思路**：让前端自己用 viem 构建 + 签名完整的 raw transaction，然后走 `eth_sendRawTransaction` 直接送到 RPC。MetaMask 的角色降级为"只做签名"（用 `personal_sign` 不行，但 viem 支持把 `window.ethereum` 包成 `walletClient` 同时调用底层 `eth_signTransaction` —— 大部分新版 MetaMask 已删此方法，**实操层面要么 (a) 用一个开发期私钥在前端签，要么 (b) 切到对开发者更友好的钱包**）。

**两个落地子方案**：

#### Plan C-1：开发期专用 — 前端用 `.env.local` 私钥直签
- 在 `web/.env.local` 增加 `NEXT_PUBLIC_DEV_PRIVATE_KEY=0x…`（**仅本地 / 仅 testnet**）
- 用 viem 的 `privateKeyToAccount` + `walletClient.writeContract` 签好整笔 tx
- 然后 `eth_sendRawTransaction` 经 `/api/rpc` 代理提交
- **MetaMask 完全不参与签名**，UI 只是显示状态
- **优**：100% 可控，必工；**劣**：失去"用真实钱包签名"的演示价值，仅适合内部开发/演示

#### Plan C-2：换 Rabby Wallet（推荐用于真实演示）
- Rabby 是 DeBank 出品的开发者友好钱包，**不挑链、不做 transaction simulation 干扰、对自定义 chainId 兼容好**
- 安装 Rabby 扩展 → 导入 D1 部署用的私钥（同一账户）→ 设置 0G Galileo 网络 → 点连接钱包
- **优**：保留真钱包体验、用户操作流程不变；**劣**：要装个新扩展，约 5 min 切换成本

#### Plan C-3（兜底）：CLI 演示
- 在 Demo 中用 `cast send` 在终端演示 createVault / ping / claim（D1 已验证可工作）
- 前端仅展示**只读视图**（用 viem 经代理 `eth_call` 读 `vaults(id)`）
- **优**：100% 可工；**劣**：丢失"钱包交互"的故事感

### Plan D（不推荐但提一下）：换浏览器
- 测试同样代码在 **Microsoft Edge** 或 **Google Chrome** 下是否能正常发 tx
- 排除 Brave 对 extension 的 fetch 干预
- 实操 5 min；如果在另一浏览器能跑，说明是 Brave 特定问题，可以建议演示时用 Chrome

### 时间预算建议

| 路径 | 估时 | 风险 |
|---|---|---|
| 立刻测 Edge / Chrome | 10 min | 0 风险，结果二选一 |
| Plan C-2 装 Rabby + 测一遍 | 20-30 min | 极低 |
| Plan C-1 前端私钥直签 | 30-40 min | 极低，但有信息泄露风险（务必只放 `.env.local`） |
| Plan C-3 改成只读 + CLI 演示 | 60 min | 0 风险但牺牲故事 |

---

## 6. 风险与决策点

| 风险 | 影响 | 建议 |
|---|---|---|
| **D2 红线时间已严重超支** | 不能按"D2 上午"窗口完成 README + Demo 准备 | 接受 Plan C-2 或 C-3，优先把"端到端跑通"这件事在 60 min 内拿下，README 移到下午 |
| MetaMask + 0G 兼容性是上游问题 | 即使本地修通了，下次 MetaMask 升级仍可能再坏 | 长期不应把演示路径绑死在 MetaMask；保留 CLI 演示路径作为兜底 |
| `contracts/.env` 中 `CHAIN_ID=16601` 未更正 | 不影响已部署合约，但下次 `forge script` / `cast` 时可能误用 | 评审通过后顺手改成 16602 |
| Plan C-1 私钥放前端 env | 极小（仅 testnet 私钥 + `.env.local` 已 gitignore） | 可接受，但 Demo 完毕务必轮换私钥 |
| Brave Wallet 仍可能在 Brave 升级后回来抢 `window.ethereum` | 演示日突然失效 | Demo 用 Chrome 或 Edge 更稳 |

---

## 7. 需要评审决策的 4 个问题

1. **是否接受用 Plan C-2（Rabby）替代 MetaMask 作为 D2 演示钱包？** （推荐：是）
2. **是否在 Plan C 走通之前不再投入时间继续调 MetaMask？** （推荐：是）
3. **README 是否往后挪到 D2 下午，先保证端到端 Demo 跑通？** （推荐：是）
4. **是否需要立刻把 D1 commit + 截图 + 评审材料 push 到 GitHub？**（推荐：是，固化掉，避免本地丢） |

---

## 附录 A：当前 git 状态摘要

- 已提交：D1 合约 + 测试 + DEPLOYED.md + .gitignore + git 身份
- 未提交（脏文件）：
  - `web/.env.local`（含 ProjectId、合约地址 —— 已被 .gitignore 排除，不会入库）
  - `web/.next/dev/...`（编译产物，已被 .gitignore 排除）
  - `docs/screenshots/.gitkeep`（D1 收尾 step 3 截图占位）
  - 各种 `web/src/...` 前端文件（vault-panel / api/rpc / wagmi / contracts / legacyAbi）—— **需要在 D2 evening 收尾时一并 commit**

## 附录 B：关键日志位置

- D1 部署 tx：Explorer 链接 `https://chainscan-galileo.0g.ai/tx/0xa0f02c538115e305cc8e290fd8602ac60eb2c661e17096c16248a3c301a91ffe`
- D2 失败 tx（Nonce=4）：MetaMask 交易历史中可见，"失败"状态 + 燃料限额 21000
- dev 服务终端日志：含数百条 `POST /api/rpc 200`，证明代理工作正常
- 错误堆栈：见 §4.3

