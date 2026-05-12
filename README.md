# Digital Legacy — 0G 链上的"死亡开关"

**🇨🇳 中文** · [🇬🇧 English](README.en.md)

> **On-chain dead-man's switch on 0G Galileo.**
> 用户把资产存进金库；只要按时 ping 就活着，超过自定义不活跃周期未 ping，预先指定的受益人即可一键继承。
>
> 让加密资产**永不再有人去世后无人能取**。

[![Network](https://img.shields.io/badge/Network-0G_Galileo_Testnet-blueviolet)](https://chainscan-galileo.0g.ai)
[![Chain ID](https://img.shields.io/badge/Chain_ID-16602-blue)](https://chainscan-galileo.0g.ai)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-orange)](https://docs.soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Status](https://img.shields.io/badge/E2E-Verified_on_chain-success)](#-链上端到端验证)

\#0GHackathon · \#BuildOn0G · [@0G_labs](https://x.com/0G_labs)

---

## 项目愿景 / Pitch

> "If I die tomorrow, my crypto dies with me." — 每个加密用户的潜在噩梦。

**Digital Legacy** 用一份不可篡改的智能合约，把"心跳信号 + 自动继承"做成原子操作：
- 用户存入任意金额 OG → 设置一个**不活跃周期**（例如 1 年）+ 一个**受益人地址**。
- 用户活着时定期调用 `ping()` —— "我还活着"的链上心跳。
- 一旦周期到期仍无 ping，受益人即可调用 `claim()` 一次性继承全部资产。
- 用户随时可 `withdraw()` 自行取回。

**链路完全无中介**：没有遗产律师，没有平台冻结，没有需要相信的第三方。代码即遗嘱。

---

## 关键数据（Testnet）

| 项 | 值 |
|---|---|
| **合约地址** | [`0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6`](https://chainscan-galileo.0g.ai/address/0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6) |
| **部署 Tx** | [`0xa0f02c538115e305cc8e290fd8602ac60eb2c661e17096c16248a3c301a91ffe`](https://chainscan-galileo.0g.ai/tx/0xa0f02c538115e305cc8e290fd8602ac60eb2c661e17096c16248a3c301a91ffe) |
| **网络** | 0G-Galileo-Testnet |
| **Chain ID** | `16602` *(注意：官方旧文档写 16601，已踩坑修正)* |
| **RPC** | `http://evmrpc-testnet.0g.ai` |
| **Explorer** | [chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai/) |
| **Deployer** | `0xec70b55318c11D6344C29730f14A93CD7beDE874` |
| **合约测试** | 3 PASS (`createVault` / `claim too early` / `claim after inactivity`) |

---

## 演示截图

| | |
|:-:|:-:|
| ![Explorer 验证合约](docs/screenshots/01-explorer-contract-deployed.png) | ![Create Vault](docs/screenshots/02-create-vault-success.png) |
| **① 合约部署上链（Explorer 验证）** | **② Create Vault：用户存 0.01 OG + 60s 周期** |
| ![Ping](docs/screenshots/03-ping-success.png) | ![Claim too early](docs/screenshots/04-claim-too-early-revert.png) |
| **③ Ping：心跳信号上链** | **④ Claim too early：周期内拒绝，链上 revert（StillActive）** |
| ![Claim success](docs/screenshots/05-claim-success.png) | ![GitHub](docs/screenshots/06-github-repo.png) |
| **⑤ Claim success：周期到期，受益人继承完成** | **⑥ 仓库主页** |

---

## 链上端到端验证

完整 E2E 流程在 0G Galileo 上跑了 4 笔交易（vault id = 3），每笔都可点开 Explorer 查 logs：

| 步骤 | Tx Hash | Block | 状态 | 事件 |
|---|---|---|---|---|
| **Create Vault** | [`0x0069b5…f92b3e`](https://chainscan-galileo.0g.ai/tx/0x0069b5ecdc88ab1569f273e665793f8e298cd50e6ef707854ea1f89ad9f92b3e) | 32,903,420 | ✅ Success | `VaultCreated(id=3, owner, beneficiary, amount, period)` |
| **Ping** | [`0x9d5e9c…458806`](https://chainscan-galileo.0g.ai/tx/0x9d5e9c8e65041753b9e85b2db3a25a09072db0d5a8616d75d7c5219728458806) | 32,903,453 | ✅ Success | `Pinged(id=3, timestamp)` |
| **Claim too early**（**负例**） | [`0x3ec5b4…be36e73`](https://chainscan-galileo.0g.ai/tx/0x3ec5b4a0860cf8eeca63207ce5e50bec186333f581b3988b328625dccbe36e73) | 32,903,478 | ❌ Revert | `StillActive()` *(预期之内 — 证明守卫生效)* |
| **Claim success** | [`0xe636eb…f3b64a`](https://chainscan-galileo.0g.ai/tx/0xe636eb255581f9dea32597cedbc08f03bfc5febb843df41c58d74e1308f3b64a) | 32,903,701 | ✅ Success | `Claimed(id=3, beneficiary, amount)` |

负例和正例之间间隔 60 秒（`Pinged@17:55:53` → `Claim@17:57:55` = 122s > period=60s），完整还原了"未到期拒绝 / 到期放行"的全部守卫逻辑。

---

## 核心合约接口

```solidity
contract Legacy {
    struct Vault {
        address owner;
        address beneficiary;
        uint256 amount;
        uint256 lastPing;
        uint256 inactivityPeriod;
        bool    claimed;
    }

    function createVault(address beneficiary, uint256 inactivityPeriod)
        external payable returns (uint256 id);

    function ping(uint256 id)     external;   // owner only
    function claim(uint256 id)    external;   // beneficiary, after inactivity
    function withdraw(uint256 id) external;   // owner, anytime before claim

    error NotOwner(); error NotBeneficiary();
    error StillActive(); error AlreadyClaimed();
    error ZeroAmount(); error ZeroAddress();
}
```

完整源码：[`contracts/src/Legacy.sol`](contracts/src/Legacy.sol)
测试：[`contracts/test/Legacy.t.sol`](contracts/test/Legacy.t.sol)

---

## 架构

```
┌─────────────────────────┐         ┌──────────────────────┐
│  Web (Next.js + viem)   │         │  0G Galileo Testnet  │
│  - VaultPanel.tsx       │         │  - Chain ID 16602    │
│  - Dev signer (viem)    │ ──────▶ │  - Legacy.sol        │
│  - /api/rpc proxy       │   tx    │    0x240Da0...e5aB6  │
└──────────────┬──────────┘         └──────────┬───────────┘
               │                               │
               │  JSON-RPC (server-side fetch) │
               └──────────────▶ http://evmrpc-testnet.0g.ai
```

**为什么有 `/api/rpc` 代理**：浏览器侧调用 0G 的 HTTPS RPC 经常被浏览器 CORS / 扩展 fetch 上下文拦截；服务端代理一次性绕开 CORS + 混合内容 + TLS 不稳，并保留对错误的统一封装。详见 [`web/src/app/api/rpc/route.ts`](web/src/app/api/rpc/route.ts)。

**为什么有 dev-signer**：见下一节 *0G 实战经验*。

---

## 快速开始

### 0. 前置

- Node.js ≥ 20，pnpm ≥ 9
- Foundry（`forge`、`cast`）—— 仅当你要重新部署或跑测试
- 一个 0G Galileo testnet 钱包账户 + 一些测试 OG（[水龙头](https://faucet.0g.ai/)）

### 1. 克隆 & 安装

```bash
git clone https://github.com/zwyzjj/Digital-Legacy.git
cd "Digital-Legacy"

cd web && pnpm install
```

### 2. 配置环境变量

复制 `web/.env.example`（如尚未提供，直接新建）到 `web/.env.local`：

```env
# 必填
NEXT_PUBLIC_LEGACY_ADDRESS=0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6
NEXT_PUBLIC_CHAIN_ID=16602
NEXT_PUBLIC_RPC_URL=http://evmrpc-testnet.0g.ai
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<在 https://cloud.walletconnect.com 申请>

# 开发模式签名（推荐用于 demo；用真钱包请关闭）
NEXT_PUBLIC_DEV_SIGNER=true
NEXT_PUBLIC_DEV_PRIVATE_KEY=0x<你的 testnet 私钥，绝对不要用主网私钥！>
```

> ⚠️ **安全**：`NEXT_PUBLIC_DEV_PRIVATE_KEY` 只用于黑客松 testnet demo。Mainnet **绝不**这么做。`web/.env.local` 已被 `.gitignore` 屏蔽，不会入库。

### 3. 启动

```bash
cd web
pnpm dev
# → http://localhost:3000
```

打开页面：
1. （Dev signer 模式下）右上角显示 **Dev Signer** 徽章 + 部署账户地址
2. **Create Vault** 卡片：填受益人地址 + 不活跃周期（秒）+ 金额（OG），点 Submit
3. **Ping** 卡片：填 vault id，发心跳
4. **Claim** 卡片：受益人填 vault id 调用继承

### 4. 跑合约测试（可选）

```bash
cd contracts
forge test -vv
# Ran 3 tests for test/Legacy.t.sol:LegacyTest
# [PASS] testClaimAfterInactivity()
# [PASS] testClaimTooEarly()
# [PASS] testCreateVault()
```

### 5. 重新部署（可选）

```bash
cd contracts
cp .env.example .env  # 自行填 PRIVATE_KEY
source .env

forge create src/Legacy.sol:Legacy \
  --rpc-url http://evmrpc-testnet.0g.ai \
  --private-key $PRIVATE_KEY \
  --priority-gas-price 2500000000   # 0G 最小 priority fee = 2 gwei，必须显式给
```

---

## 0G Galileo 实战经验（其他开发者会感谢这一节）

D1 → D2 开发期间踩到的非平凡坑，已全部在代码里解决，留作参考：

### 1. **`chainId = 16602`**，不是官方某些旧文档说的 `16601`
   - 用错会直接导致 wagmi、MetaMask、Foundry 全套对不上链。
   - 验证方法：`cast chain-id --rpc-url http://evmrpc-testnet.0g.ai` 返回 `16602`。

### 2. **0G Galileo 最小 `priority fee = 2 gwei`**
   - 默认钱包/工具会塞 1 wei tip → mempool 静默拒收，**前端拿不到任何错误**（最坑的一个）。
   - **解法**：每笔 tx 显式预填 `maxPriorityFeePerGas = 2.5 gwei`、`maxFeePerGas = baseFee + 2.5 gwei`。代码：[`web/src/components/vault-panel.tsx`](web/src/components/vault-panel.tsx)。
   - CLI 对应：`cast send --priority-gas-price 2500000000 ...`。

### 3. **MetaMask 11.x + 自定义链 + `addDappTransaction` 抛 `signal is aborted`**
   - 现象：dapp 调 `eth_sendTransaction`，MetaMask 内部 `AbortController.abort()` 把 promise 砍掉，**但 tx 实际被广播**，且 **gas limit 被强制改成 21000**（普通转账 gas），合约调用必 revert。
   - 关闭 MetaMask 全部"智能"功能（transaction simulation / Blockaid / 自动检测）后**仍然失败**。Brave / Edge 同样复现。
   - **解法**：实现 **Dev Signer 模式** —— 前端用 viem 的 `privateKeyToAccount` + `walletClient.sendTransaction()` **完全绕开 MetaMask**，直接生成 raw tx → 经 `/api/rpc` 代理 → 链上。详见 [`web/src/lib/dev-signer.ts`](web/src/lib/dev-signer.ts)。
   - 黑客松 demo 用 dev-signer 100% 可控；生产建议接 Rabby / WalletConnect / Privy 等对自定义链友好的钱包。

### 4. **0G 的 HTTPS RPC 端点 CORS 头不完整**
   - 浏览器侧直连 `https://evmrpc-testnet.0g.ai` → 间歇 `Failed to fetch`。
   - **解法**：Next.js API 路由 `/api/rpc` 服务端代理，CORS 由我们自己加。详见 [`web/src/app/api/rpc/route.ts`](web/src/app/api/rpc/route.ts)。

### 5. **Foundry `forge create` 在 0G 上不要加 `--legacy`**
   - 0G 原生 EIP-1559，`--legacy` 会让 Foundry 用 legacy gas price 字段，节点拒绝。
   - 直接走 EIP-1559 默认即可。

---

## 项目结构

```
.
├── contracts/                       # Foundry 项目
│   ├── src/Legacy.sol               # 核心合约
│   ├── test/Legacy.t.sol            # 单元测试（3 PASS）
│   ├── script/Deploy.s.sol          # 部署脚本
│   ├── foundry.toml
│   └── DEPLOYED.md                  # 部署记录
├── web/                             # Next.js 16 前端
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   └── api/rpc/route.ts     # 服务端 RPC 代理
│   │   ├── components/
│   │   │   └── vault-panel.tsx      # 主交互组件
│   │   └── lib/
│   │       ├── wagmi.ts
│   │       ├── legacyAbi.ts
│   │       ├── contracts.ts
│   │       └── dev-signer.ts        # viem 直签实现
│   └── package.json
├── docs/
│   └── screenshots/                 # 演示截图（01-06）
├── deliverables/
│   ├── runbooks/                    # 开发期 runbook
│   └── reviews/                     # 进度评审材料
├── d1-runbook-digital-legacy-2026-05-12.md
└── README.md
```

---

## 技术栈

| 层 | 技术 |
|---|---|
| **合约** | Solidity 0.8.24、Foundry、forge-std、OpenZeppelin contracts（仅作可选依赖） |
| **前端** | Next.js 16、React 19、TypeScript 5、Tailwind CSS v4、shadcn/ui |
| **Web3** | viem 2.x、wagmi 3.x、RainbowKit（可选）、EIP-1193 |
| **网络** | 0G-Galileo-Testnet（chainId 16602） |
| **工具** | pnpm、ESLint 9、Turbopack |

---

## 路线图

| 阶段 | 范围 |
|---|---|
| ✅ **MVP（已完成）** | createVault / ping / claim / withdraw 完整流程，链上验证全绿，截图 + Explorer 链接齐全 |
| 🚧 **D3** | 多语言 README（EN）、3 分钟 demo 视频、X 公开帖 |
| 📋 **D4+** | <ul><li>把"遗嘱内容"（文本/文档加密包）存到 **0G Storage**，合约里只放 hash + 解密 key 由受益人继承时领取</li><li>多受益人 + 比例分配</li><li>社交恢复（n-of-m 守护人触发）</li><li>定时器自动 reminder（Push Protocol / WalletConnect Notify）</li><li>Vault NFT，让"将要继承的金库"作为可转让凭证</li></ul> |
| 🌐 **Mainnet** | 审计、Bug Bounty、Gnosis Safe 集成 |

---

## 安全声明

- 本项目**仅部署在 0G Galileo Testnet**，未经审计，**禁止主网使用**。
- `NEXT_PUBLIC_DEV_PRIVATE_KEY` 是开发期权宜，**真实部署请删除该字段并接入用户钱包**。
- 合约本身遵循 Checks-Effects-Interactions 模式（`claim` 内先置 `claimed=true` 再转账），但未做 reentrancy guard，因为只对 `beneficiary.call` 一次性转账且状态已锁定 —— 黑客松范围内可接受，生产前应加 `ReentrancyGuard`。
- 已知未实现：`ping` 没有 grace period，建议 owner 设置 inactivity period 时留充足缓冲。

---

## 致谢

- [0G Labs](https://0g.ai) — 提供 modular AI chain + storage 底座，本项目唯一依赖的链
- [Foundry](https://book.getfoundry.sh/) — 最锋利的 Solidity 工具链
- [viem](https://viem.sh/) — TypeScript 上最干净的以太坊客户端
- [shadcn/ui](https://ui.shadcn.com/) — 让前端在 1 小时内长出脸

---

## License

MIT © 2026 [zwyzjj](https://github.com/zwyzjj)

---

> Built with care for **0G Hackathon 2026**. PRs and ideas welcome.
> 仓库：<https://github.com/zwyzjj/Digital-Legacy>
