# D1 开工 Runbook · Digital Legacy

**日期**：2026-05-12（周二）
**目标**：22:00 前合约上链 0G Galileo + Explorer 可见
**使用方式**：在 Cursor 里打开本文件，按章节顺序复制代码块粘到 Git Bash / 文件中执行

---

## 📌 TL;DR

- 全程在 **Git Bash**（不是 PowerShell）里跑命令
- 工作目录：`~/Desktop/digital-legacy`
- 本文档共 **5 个章节**：A 骨架 → B 合约 → C 测试 → D 部署 → E 前端壳
- 每段顶部有 **⏱ 时间预估** 和 **✅ 验收**，做完打勾再往下

---

## 🎯 D1 红线（不可妥协）

| 时段 | 任务 | 验收 |
|---|---|---|
| 09:00-09:30 | A 段：项目骨架 | 目录树齐 + `git log` 有 1 条 commit |
| 09:30-12:00 | B+C 段：合约 + 测试 | `forge test -vv` 全绿 |
| 13:00-15:00 | D 段：部署 0G Galileo | Explorer 能搜到合约地址 |
| 15:00-22:00 | E 段：前端壳 | localhost:3000 能跑，钱包能连 0G |
| **22:00** | **🚨 红线** | 合约未上链 → 切 MoodMap 备选 |

---

# A 段 · 项目骨架（⏱ 30min）

## A1. 建根目录 + Git 初始化

打开 **Git Bash**，逐行复制粘贴：

```bash
cd ~/Desktop
mkdir digital-legacy && cd digital-legacy
git init
```

## A2. 写 .gitignore

在 Cursor 里新建文件 `digital-legacy/.gitignore`，粘贴：

```gitignore
node_modules/
.env
.env.local
out/
cache/
broadcast/
.next/
*.log
```

## A3. Foundry 子项目（合约）

回到 Git Bash：

```bash
cd ~/Desktop/digital-legacy
mkdir contracts && cd contracts
forge init --no-commit --no-git
forge install OpenZeppelin/openzeppelin-contracts --no-commit
cd ..
```

> ⚠️ 如果 `forge install` 卡 5 分钟以上：Ctrl+C 终止，改用：
> ```bash
> cd contracts
> git init
> git submodule add https://github.com/OpenZeppelin/openzeppelin-contracts lib/openzeppelin-contracts
> cd ..
> ```

## A4. Next.js 子项目（前端）

```bash
cd ~/Desktop/digital-legacy
pnpm create next-app@latest web --typescript --tailwind --app --src-dir --import-alias "@/*" --eslint --turbopack
```

> 如果命令行问 y/N，全按回车走默认。

```bash
cd web
pnpm add wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
cd ..
```

## A5. 首次提交

```bash
cd ~/Desktop/digital-legacy
git add .
git commit -m "chore: scaffold digital-legacy (contracts + web)"
```

## ✅ A 段验收

```bash
ls -la
# 应该看到：contracts/  web/  .gitignore  .git/

git log --oneline
# 应该看到一条：xxxxxxx chore: scaffold digital-legacy
```

打勾 ☐ → 进 B 段

---

# B 段 · 合约代码（⏱ 90min）

## B1. 删除 Foundry 默认示例

```bash
cd ~/Desktop/digital-legacy/contracts
rm -f src/Counter.sol test/Counter.t.sol script/Counter.s.sol
```

## B2. 写主合约 `contracts/src/Legacy.sol`

在 Cursor 里**新建文件** `contracts/src/Legacy.sol`，整段粘贴：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  Legacy — A letter to the future
 * @notice 数字遗嘱合约：用户定期"心跳"证明在线；超过阈值后任意人可触发，
 *         指定继承人（guardian）即可领取遗产 + 遗言（存 0G Storage 的 CID）。
 */
contract Legacy {
    /* ============ 事件 ============ */
    event LegacyCreated(address indexed owner, address indexed guardian, uint256 amount, uint256 dormantThreshold, string letterCid);
    event Heartbeat(address indexed owner, uint256 timestamp);
    event LegacyTriggered(address indexed owner, address indexed triggeredBy, uint256 timestamp);
    event LegacyClaimed(address indexed owner, address indexed guardian, uint256 amount);

    /* ============ 数据结构 ============ */
    enum Status { None, Active, Triggered, Claimed }

    struct LegacyData {
        address guardian;
        uint256 amount;
        uint256 dormantThreshold;
        uint256 lastHeartbeat;
        string  letterCid;
        Status  status;
    }

    mapping(address => LegacyData) public legacies;

    /* ============ 写方法 ============ */

    function createLegacy(address guardian, uint256 dormantThreshold, string calldata letterCid) external payable {
        require(legacies[msg.sender].status == Status.None, "already exists");
        require(guardian != address(0) && guardian != msg.sender, "bad guardian");
        require(dormantThreshold >= 30, "threshold too small");
        require(msg.value > 0, "need funds");

        legacies[msg.sender] = LegacyData({
            guardian: guardian,
            amount: msg.value,
            dormantThreshold: dormantThreshold,
            lastHeartbeat: block.timestamp,
            letterCid: letterCid,
            status: Status.Active
        });

        emit LegacyCreated(msg.sender, guardian, msg.value, dormantThreshold, letterCid);
    }

    function ping() external {
        LegacyData storage l = legacies[msg.sender];
        require(l.status == Status.Active, "not active");
        l.lastHeartbeat = block.timestamp;
        emit Heartbeat(msg.sender, block.timestamp);
    }

    function checkAndTrigger(address owner) external {
        LegacyData storage l = legacies[owner];
        require(l.status == Status.Active, "not active");
        require(block.timestamp - l.lastHeartbeat > l.dormantThreshold, "still alive");
        l.status = Status.Triggered;
        emit LegacyTriggered(owner, msg.sender, block.timestamp);
    }

    function claim(address owner) external {
        LegacyData storage l = legacies[owner];
        require(l.status == Status.Triggered, "not triggered");
        require(msg.sender == l.guardian, "not guardian");
        uint256 amt = l.amount;
        l.amount = 0;
        l.status = Status.Claimed;
        (bool ok, ) = payable(l.guardian).call{value: amt}("");
        require(ok, "transfer failed");
        emit LegacyClaimed(owner, l.guardian, amt);
    }

    /* ============ 读方法 ============ */
    function isExpired(address owner) external view returns (bool) {
        LegacyData memory l = legacies[owner];
        if (l.status != Status.Active) return false;
        return block.timestamp - l.lastHeartbeat > l.dormantThreshold;
    }
}
```

## B3. 配置 foundry.toml

打开 `contracts/foundry.toml`，把内容整个替换为：

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.24"
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
og_galileo = "https://evmrpc-testnet.0g.ai"
```

## ✅ B 段验收

```bash
cd ~/Desktop/digital-legacy/contracts
forge build
# 期望：Compiler run successful!
```

打勾 ☐ → 进 C 段

---

# C 段 · 合约测试（⏱ 30min）

## C1. 写测试 `contracts/test/Legacy.t.sol`

在 Cursor 里**新建文件** `contracts/test/Legacy.t.sol`，整段粘贴：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/Legacy.sol";

contract LegacyTest is Test {
    Legacy legacy;
    address owner = address(0xA11CE);
    address guardian = address(0xB0B);

    function setUp() public {
        legacy = new Legacy();
        vm.deal(owner, 10 ether);
    }

    function testCreateAndClaim() public {
        vm.prank(owner);
        legacy.createLegacy{value: 1 ether}(guardian, 60, "bafy...demo");

        vm.prank(owner);
        legacy.ping();

        vm.warp(block.timestamp + 61);
        legacy.checkAndTrigger(owner);

        uint256 before = guardian.balance;
        vm.prank(guardian);
        legacy.claim(owner);
        assertEq(guardian.balance, before + 1 ether);
    }

    function testCannotClaimIfAlive() public {
        vm.prank(owner);
        legacy.createLegacy{value: 1 ether}(guardian, 60, "bafy...demo");

        vm.expectRevert("still alive");
        legacy.checkAndTrigger(owner);
    }

    function testOnlyGuardianCanClaim() public {
        vm.prank(owner);
        legacy.createLegacy{value: 1 ether}(guardian, 60, "bafy...demo");

        vm.warp(block.timestamp + 61);
        legacy.checkAndTrigger(owner);

        address randomDude = address(0xDEAD);
        vm.prank(randomDude);
        vm.expectRevert("not guardian");
        legacy.claim(owner);
    }
}
```

## ✅ C 段验收

```bash
cd ~/Desktop/digital-legacy/contracts
forge test -vv
# 期望：3 个 [PASS]
```

如果挂了：把报错截图甩给 WorkBuddy 里的我。

打勾 ☐ → **午饭 12:00-13:00** → 进 D 段

---

# D 段 · 部署 0G Galileo（⏱ 60min）

## D1. 准备一个 Demo 小号钱包

⚠️ **不要用主钱包私钥**，新建一个：

1. MetaMask 右上角头像 → **Add account or hardware wallet** → **Add a new Ethereum account**
2. 命名 `0G-demo`
3. 从主钱包转 0.5 测试 OG 给 demo 小号
4. 点这个 demo 账户右上 ⋮ → **Account details** → **Show private key**（输密码）→ 复制

## D2. 写 `.env`

在 Cursor 里**新建文件** `contracts/.env`（**确保 .gitignore 已忽略 .env**），粘贴：

```env
PRIVATE_KEY=0xYOUR_DEMO_PRIVATE_KEY_HERE
RPC_URL=https://evmrpc-testnet.0g.ai
```

把 `0xYOUR_DEMO_PRIVATE_KEY_HERE` 换成 D1 复制的私钥（保留 0x 前缀）。

## D3. 写部署脚本 `contracts/script/Deploy.s.sol`

在 Cursor 里**新建文件** `contracts/script/Deploy.s.sol`，整段粘贴：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Legacy.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        Legacy legacy = new Legacy();
        console.log("Legacy deployed at:", address(legacy));
        vm.stopBroadcast();
    }
}
```

## D4. 部署！

```bash
cd ~/Desktop/digital-legacy/contracts
source .env
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --legacy
```

## ✅ D 段验收

终端输出末尾会有一行：
```
Legacy deployed at: 0xABCD....
```

**复制这个地址**，干 3 件事：

1. 浏览器打开 `https://chainscan-galileo.0g.ai/`，搜这个地址 → 看到合约页 ✅
2. 在 `digital-legacy/` 根目录新建 `DEPLOYED.md`，写：
   ```
   # Deployed Contracts
   - Network: 0G Galileo Testnet
   - Legacy.sol: 0xABCD....
   - Deployer:   0xYOUR_DEMO_ADDRESS
   - Date:       2026-05-12
   ```
3. Commit：
   ```bash
   cd ~/Desktop/digital-legacy
   git add .
   git commit -m "feat(contracts): deploy Legacy.sol to 0G Galileo"
   ```

🎉 **D1 红线达成。** 22:00 前剩下时间全部投入 E 段。

打勾 ☐ → 进 E 段

---

# E 段 · 前端壳（⏱ 4-6h）

> 这段比较长，建议**先做 E1-E3 跑通钱包连接**，再推进。今晚做不完没关系，D2 上午继续。

## E1. 配 wagmi + RainbowKit

在 Cursor 里**新建文件** `web/src/lib/wagmi.ts`：

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

export const ogGalileo = defineChain({
  id: 16601,
  name: '0G Galileo Testnet',
  nativeCurrency: { name: '0G', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://chainscan-galileo.0g.ai' },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Digital Legacy',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // 去 cloud.walletconnect.com 免费拿
  chains: [ogGalileo],
  ssr: true,
});
```

> ⚠️ Chain ID 16601 是 placeholder——**部署 D 段成功后**，去 MetaMask 看 0G Galileo 实际 chainId，改这里。

## E2. 配 Provider `web/src/app/providers.tsx`

新建文件 `web/src/app/providers.tsx`：

```tsx
'use client';

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

## E3. 改 `web/src/app/layout.tsx`

打开 `web/src/app/layout.tsx`，找到 `<body>` 标签，把 `{children}` 用 Providers 包起来：

```tsx
import { Providers } from './providers';

// ...原有代码...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## E4. 写首页 `web/src/app/page.tsx`

整个文件替换为：

```tsx
'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-5xl font-bold tracking-tight">Digital Legacy</h1>
      <p className="text-xl text-gray-400 italic">
        Some words travel farther than we do.
      </p>
      <ConnectButton />
    </main>
  );
}
```

## E5. 跑起来

```bash
cd ~/Desktop/digital-legacy/web
pnpm dev
```

浏览器打开 http://localhost:3000

## ✅ E 段验收

- 看到黑底白字 "Digital Legacy" ✅
- 右下能点 Connect Wallet，弹 MetaMask ✅
- 连上 0G Galileo 后显示钱包地址 ✅

## E6. 提交

```bash
cd ~/Desktop/digital-legacy
git add .
git commit -m "feat(web): wallet connection + landing page"
```

---

# 🚨 故障应急清单

| 症状 | 排查 |
|---|---|
| `forge install` 卡死 | 用 `git submodule add` 替代（A3 段有备注） |
| `forge test` 编译失败 | `foundry.toml` 里 `solc = "0.8.24"` 加上 |
| 部署报 `insufficient funds` | Faucet 再领一次水到 demo 小号 |
| 部署报 `nonce too low` | 等 10 秒再跑，或 MetaMask 里 reset account |
| Next.js `pnpm dev` 报错 | `rm -rf node_modules .next && pnpm install` |
| RainbowKit 弹窗黑白 | 没引入 `@rainbow-me/rainbowkit/styles.css`，回 E2 检查 |
| Chain ID 不对 | MetaMask 里看 0G Galileo 实际 chainId，改 wagmi.ts |

任何卡 30 分钟以上的问题：**截图甩给 WorkBuddy 里的方向明**。

---

# 📋 D1 收工自检表（22:00）

- ☐ `forge test -vv` 全绿（3 PASS）
- ☐ Explorer 能搜到合约地址
- ☐ `DEPLOYED.md` 记录了地址
- ☐ Git 至少 3 条 commit
- ☐ localhost:3000 跑得动 + 钱包能连（E 段做完更好）

---

# 🎯 D2 预告

- 上午：合约前端集成（wagmi useWriteContract 调 createLegacy / ping）
- 下午：UI 主视觉（"I'm still here" 心跳按钮 + 倒计时动画）
- 晚上：0G Storage SDK 接入（letterCid 上传 + 拉取）

D1 跑完跟我说"D1 收工"，我立刻发 D2 Runbook。

---

> 本 Runbook 由产品战略团队 AI 协作生成，遇阻立刻反馈，不要硬撑。
