# Digital Legacy — D1 / D2 内部评审材料（晚间收官版）

> **生成时间**：2026-05-12 18:42（UTC+8）
> **作用域**：从 D1 启动 → D2 上午阻塞 → D2 下午救场 → D2 收官的**全周期**进展、变动、阻塞、交付与决策点
> **当前状态**：**D1 红线已完成，D2 红线已完成**。仓库 + README 双语 + 端到端链上验证 + 营销草稿全部固化。剩余动作为可选项（repo Public 化、发推、D3 启动）。
> **本文与前版关系**：是 `d1-d2-progress-review-2026-05-12-1700.md`（17:00 中场评审）的**最终收官版**。两份对照即可看到 1 小时 42 分钟内做掉了什么。

---

## 0. TL;DR — 一表看完

| 维度 | 17:00 中场状态 | 18:42 当前状态 | 变化 |
|---|---|---|---|
| **D1（合约）** | ✅ 部署 + 测试 PASS | ✅ 部署 + 测试 PASS | 持平 |
| **D2 上午（钱包/前端连接）** | 🟡 80%（MetaMask 11.x 阻塞） | ✅ 100%（用 Dev Signer 绕过） | **解决** |
| **D2 下午（E2E 演示）** | ⛔ 未开始 | ✅ 4 笔上链全绿（含负例 revert） | **完成** |
| **D2 晚间（README + Push）** | ⛔ 未开始 | ✅ 中英双版 + 5 commits 推 GitHub | **完成** |
| **D2 营销（X 推文）** | — | ✅ 4 版本草稿 + 字数实测踩坑 | **额外交付** |
| **GitHub 仓库** | ❌ 未推 | ✅ Private repo，5 commits，content 干净 | **完成** |
| **截图取证** | 1 张（部署） | 6 张（部署 + 4 笔 E2E + GitHub） | **完成** |
| **0G 实战经验沉淀** | 散落在草稿 | ✅ 5 条踩坑写进 README，对生态有正贡献 | **完成** |
| **安全核查** | — | ✅ 3 层全历史扫描通过 | **完成** |

**结论**：**D2 红线（22:00）提前 3h18m 达成**，且交付质量超出原计划。

---

## 1. 项目目标 vs 实际达成

### D1 原计划 → 完成度

| Runbook 任务 | 完成 |
|---|---|
| Foundry scaffold + 写 `Legacy.sol` | ✅ |
| 单元测试 | ✅ 3 PASS |
| 部署到 0G Galileo（chainId 16602） | ✅ |
| 私钥不入库 + `.gitignore` | ✅ 已验证 |
| Explorer 截图存档 | ✅ `01-explorer-contract-deployed.png` |
| `git commit` 固化 | ✅ commit `c199bb8` + `a1787e0` |

### D2 原计划 → 完成度

| Runbook 任务 | 完成 |
|---|---|
| 修 MetaMask + RainbowKit 连接 | ⛔ **绕过**：放弃 MetaMask 路径，改用 Dev Signer |
| E 段前端壳：Connect + 三个交互卡片 | ✅ `vault-panel.tsx` 完整实现 |
| 端到端冒烟（Create / Ping / Claim 正负例） | ✅ 4 笔 tx 链上验证 |
| README 中英各 1 页 | ✅ 中 14.5 KB + 英 14.6 KB |
| GitHub 推送（私有） | ✅ 5 commits 推完 |
| 截图 02–05 | ✅ 齐全 |
| **额外**：X post 草稿 4 版本 | ✅ |
| **额外**：进度评审材料 2 份（17:00 + 18:42） | ✅ |

---

## 2. 关键链上事实（评审硬证据）

### 2.1 合约部署

| 项 | 值 |
|---|---|
| 合约地址 | [`0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6`](https://chainscan-galileo.0g.ai/address/0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6) |
| 部署 Tx | [`0xa0f02c…91ffe`](https://chainscan-galileo.0g.ai/tx/0xa0f02c538115e305cc8e290fd8602ac60eb2c661e17096c16248a3c301a91ffe) |
| Chain ID | **16602**（非 16601） |
| RPC | `http://evmrpc-testnet.0g.ai` |
| Deployer | `0xec70b55318c11D6344C29730f14A93CD7beDE874` |
| 当前余额 | ≈ 0.466 OG（起始 0.5，经过 ~10 笔 tx 含失败 tx 后正常水平） |

### 2.2 端到端冒烟（vault id = 3）

| Step | Tx Hash | Block | 状态 | 事件 |
|---|---|---|---|---|
| Create Vault | [`0x0069b5…f92b3e`](https://chainscan-galileo.0g.ai/tx/0x0069b5ecdc88ab1569f273e665793f8e298cd50e6ef707854ea1f89ad9f92b3e) | 32,903,420 | ✅ Success | `VaultCreated` |
| Ping | [`0x9d5e9c…458806`](https://chainscan-galileo.0g.ai/tx/0x9d5e9c8e65041753b9e85b2db3a25a09072db0d5a8616d75d7c5219728458806) | 32,903,453 | ✅ Success | `Pinged` |
| **Claim too early（负例）** | [`0x3ec5b4…be36e73`](https://chainscan-galileo.0g.ai/tx/0x3ec5b4a0860cf8eeca63207ce5e50bec186333f581b3988b328625dccbe36e73) | 32,903,478 | ❌ Revert | `StillActive()` |
| Claim success | [`0xe636eb…f3b64a`](https://chainscan-galileo.0g.ai/tx/0xe636eb255581f9dea32597cedbc08f03bfc5febb843df41c58d74e1308f3b64a) | 32,903,701 | ✅ Success | `Claimed` |

**关键证据**：负例 → 正例间隔 **122 秒 > 60 秒不活跃周期**，完整还原"未到期拒收 / 到期放行"双向守卫逻辑。许多黑客松项目只跑 happy path，这里**有真实的失败用例上链**作硬证据。

---

## 3. 17:00 阻塞如何被解决（核心叙事）

### 3.1 阻塞回顾

17:00 评审时的核心阻塞：**MetaMask 11.x 在 0G testnet 上调 `eth_sendTransaction` 会 `signal is aborted` + 强制 gas=21000 → 链上 revert**。表象是 MM bug。

### 3.2 阶段 0 决定性诊断（17:10–17:30）

执行 `cast send` CLI 自测，发现报错：
```
transaction gas price below minimum:
  gas tip cap 1, minimum needed 2000000000
```

**根因暴露**：**0G Galileo 强制最小 priority fee = 2 gwei**。任何用默认 1 wei tip 的工具（MetaMask、`cast send` 不带 `--priority-gas-price` 都不行）都会被节点静默拒收。

### 3.3 解决方案

**两条路并行落地**：

1. **EIP-1559 显式预填**（[`web/src/components/vault-panel.tsx`](../../../web/src/components/vault-panel.tsx)）
   每笔 tx 在调用前显式计算并设置：
   - `maxPriorityFeePerGas = 2.5 gwei`
   - `maxFeePerGas = baseFee + 2.5 gwei`

2. **Dev Signer 模式**（[`web/src/lib/dev-signer.ts`](../../../web/src/lib/dev-signer.ts)）
   完全绕开 MetaMask 的 `addDappTransaction` 路径：
   - 用 viem 的 `privateKeyToAccount` 在浏览器侧生成 raw tx
   - 经 `/api/rpc` 代理 → 0G 节点
   - MetaMask 完全不参与
   - 由 `NEXT_PUBLIC_DEV_SIGNER=true` 开关启用

### 3.4 验证

`cast send --priority-gas-price 2500000000 ...` 直接成功 → 证明根因诊断正确。
Dev Signer 测试 → 第一笔 `0x536448…219c` 上链 Success → 证明绕过方案可行。
随后 4 笔正式 E2E 全部按设计落地（§2.2）。

**深层启示**：MetaMask 在自定义链上确实有 `addDappTransaction` 流程问题（同样在 Edge、Brave 复现），但**最根本的杀手**是 0G 的最小 priority fee 要求与所有钱包默认值不匹配。**对生态有反馈价值的发现**。

---

## 4. 当前代码资产清单

### 4.1 合约层（`contracts/`）

| 文件 | 状态 |
|---|---|
| `src/Legacy.sol` | 88 行，4 个核心函数（createVault/ping/claim/withdraw）+ 6 个自定义 error + 4 个 event |
| `test/Legacy.t.sol` | 3 个 PASS 测试覆盖正/负/超时 |
| `script/Deploy.s.sol` | EIP-1559 部署脚本 |
| `foundry.toml` | solc 0.8.24 + optimizer + `og_galileo` rpc 配置 |
| `.env` | 实际私钥，**未入库**（gitignored） |
| `.gitignore` | 屏蔽 `.env*` |
| `DEPLOYED.md` | 部署详情存档 |
| `lib/openzeppelin-contracts/` | submodule，预留给 D4+ |
| `lib/forge-std/` | submodule |

### 4.2 前端（`web/`）

| 文件 | 角色 |
|---|---|
| `src/app/page.tsx` | 入口，渲染 `<Vault />` |
| `src/components/vault-panel.tsx` | 主交互组件（Create/Ping/Claim 3 卡片 + EIP-1559 预填 + Dev Signer 优先） |
| `src/components/ui/*` | shadcn 组件（Button/Input/Card） |
| `src/lib/wagmi.ts` | 链配置（id=16602，RPC `/api/rpc` 浏览器侧 + https SSR 侧） |
| `src/lib/contracts.ts` | 合约地址常量 |
| `src/lib/legacyAbi.ts` | 从 `contracts/out/...` 提取的 const ABI |
| `src/lib/dev-signer.ts` | viem `WalletClient` + `privateKeyToAccount` |
| `src/app/api/rpc/route.ts` | 服务端 JSON-RPC 代理（CORS + OPTIONS preflight + error wrap） |
| `.env.local` | dev 私钥 + RPC + 合约地址，**未入库**（gitignored） |
| `package.json` | Next.js 16 + viem 2 + wagmi 3 + RainbowKit 2 + Tailwind 4 + shadcn |

### 4.3 文档 / 交付物

| 文件 | 用途 |
|---|---|
| `README.md` | 中文版（14.5 KB，312 行，5 个 tx 链接，6 张截图） |
| `README.en.md` | 英文版（14.6 KB，308 行，平行结构 + 国际评委友好措辞） |
| `docs/screenshots/01–06.png` | 演示证据链 |
| `d1-runbook-digital-legacy-2026-05-12.md` | 原始 D1 runbook |
| `deliverables/runbooks/d2-morning-wallet-and-frontend-2026-05-12-01-12.md` | D2 上午 runbook |
| `deliverables/runbooks/d2-afternoon-rabby-rescue-and-e2e-2026-05-12-17-10.md` | D2 下午 runbook |
| `deliverables/reviews/d1-d2-progress-review-2026-05-12-1700.md` | 17:00 中场评审 |
| `deliverables/reviews/d1-d2-progress-review-2026-05-12-1842.md` | **本文件** |
| `deliverables/marketing/x-post-draft.md` | X 推文 4 版草稿 + 失败案例（实测踩坑） |

---

## 5. GitHub 仓库状态

### 5.1 Commits 时间线

```
72b4604 (HEAD -> main, origin/main) docs: add bilingual README (zh + en) for hackathon submission
8ae4045                              feat(d2): end-to-end demo on 0G Galileo testnet with dev-signer path
f75c196                              feat(web): D2 morning — Vault panel + shadcn + legacy ABI
c199bb8                              feat(d1): deploy Legacy.sol to 0G Galileo Testnet
a1787e0                              feat(d1): deploy Legacy.sol to 0G Galileo (chainId=16602)
```

**累计代码变更**：62 个文件变更，10,292 行插入。

### 5.2 远程状态

- URL：<https://github.com/zwyzjj/Digital-Legacy>
- 可见性：**Private**（待发推前改 Public）
- 远程 HEAD：`72b46049f1be0bc6d926988977d15d26c0c229b0` ✅ 与本地完全一致
- 跟踪状态：`main` ↔ `origin/main` 双向同步

### 5.3 安全核查（三层全历史扫描）

| 扫描类型 | 结果 |
|---|---|
| 历史中曾被 commit 的 `.env*` 文件 | **0 个** |
| 任何 commit diff 里出现 `PRIVATE_KEY=0x[40-char hex]+` | **0 处** |
| Dev signer 私钥字符串（`0xbed7d25…c4c17`）在历史任何位置 | **0 处** |

**结论**：repo 可立即安全改为 Public。

---

## 6. 已交付的对 0G 生态有价值的副产品

在解决自身问题的过程中，**5 条非平凡踩坑**沉淀到了 README 里，对其他黑客松选手 + 后续 0G 开发者有直接价值：

1. **`chainId = 16602`**，官方某些旧文档写 `16601` 是错的
2. **0G Galileo 最小 priority fee = 2 gwei**，默认 1 wei tip 会被 mempool 静默拒收
3. **MetaMask 11.x + 自定义链 + `addDappTransaction` 抛 `signal is aborted`**，且 gas 被强制 21000
4. **0G HTTPS RPC CORS 头不完整**，浏览器侧直连间歇失败，需服务端代理
5. **Foundry `forge create` 不要加 `--legacy`**，0G 原生 EIP-1559

每条都标注了**症状 → 根因 → 解法 → 代码位置 / CLI 等价命令**，可以原样被复用。

---

## 7. 风险与剩余动作

### 7.1 残余风险（评审需关注）

| 风险 | 严重度 | 处置建议 |
|---|---|---|
| Dev Signer 私钥放 `web/.env.local` | 低（已 gitignore + 仅 testnet） | Demo 完毕轮换该私钥；mainnet 严禁此模式 |
| 合约未做 `ReentrancyGuard` | 低（已 CEI 模式 + 单笔受益人转账） | 生产前补 `ReentrancyGuard` 防御性 wrap |
| `ping` 无 grace period | 低（用户自选周期） | 文档建议保守取值，未来可加 7-day grace 默认 |
| 仓库仍 Private，发推前必须 Public | 中（发推后才显现） | 已写明在 X 草稿 checklist 第 5 条 |
| 0G testnet 历史可能消除（重置） | 低（testnet 是 testnet） | Mainnet 上线时重新部署 + 截图重做 |
| Foundry / Next 升级可能破坏依赖 | 低 | 已 lock 在 package.json + foundry.toml 版本 |

### 7.2 剩余可选动作（按优先级）

| # | 动作 | 估时 | 阻塞性 |
|---|---|---|---|
| ① | **发推前把 repo 改 Public** | 30 秒 | 阻塞 ② |
| ② | **发首条 X 推文**（选项 A1，260 字符版） | 1 min | 黑客松强制要求 |
| ③ | 顺手 commit `deliverables/marketing/` 入库 | 1 min | 不阻塞 |
| ④ | D3 上午：录 3 min demo 视频 | 60 min | 黑客松强制要求 |
| ⑤ | D3 上午：填写 hackathon 提交表单 | 30 min | 黑客松强制要求 |
| ⑥ | D3 下午：写 X 长帖 thread（选项 B）+ 借势 @0G_labs | 30 min | 加分项 |
| ⑦ | D4+：0G Storage 集成（遗嘱文本加密存）| 1 天 | 路线图项 |

---

## 8. D3 行动建议（给评审 + 给明天的自己）

### 8.1 必做（红线）

- [ ] **08:00** 起床第一件事：repo 改 Public + 隐身窗口验证可访问
- [ ] **09:00** 发 X 推文（选项 A1）+ 附截图 05
- [ ] **10:00–11:00** 录 3 min demo 视频（屏幕录制：UI 操作 + Explorer 跳转 + Tx 确认 3 段）
- [ ] **11:00–11:30** 视频剪辑 + 上传 YouTube/B 站（建议 YouTube，对国际评委友好）
- [ ] **11:30–12:00** 填 Hackathon 提交表单（repo + 视频 + tweet 链接）

### 8.2 可加分（按时间允许）

- [ ] 14:00 发 X 三连 thread（选项 B），@评委（如能找到）
- [ ] 15:00–17:00 给 README 加一张 demo GIF（动态）替代静态截图 05
- [ ] 17:00 后：开始 D4 0G Storage 集成原型

### 8.3 不要做的事

- ❌ **不要**回头继续调 MetaMask —— D2 已经确认是上游问题，自己往下挖只会再亏时间
- ❌ **不要**改合约 —— 已部署、已验证、已截图。任何改动都要重新跑全套
- ❌ **不要**写 D5 想法 —— 黑客松提交完之前，只做能让评委加分的事

---

## 9. 需要评审决策的 3 个问题

1. **是否同意明早第一件事先把 repo 改 Public？**（推荐：是）
2. **是否同意 D3 上午投入 90 分钟优先做"视频 + 提交表单"，而不是任何代码层面的优化？**（推荐：是）
3. **是否在 D3 下午就启动 D4 的 0G Storage 集成（哪怕只是原型），以增加最终评审的"完整故事感"？**（推荐：是，但只做到能 PR 截图的程度即可，不上线）

---

## 10. 对照表：17:00 评审说要做的 vs 18:42 实际做的

| 17:00 时的待办 | 18:42 实际结果 |
|---|---|
| 评审决定走 Plan C-2（Rabby） | **改走 Plan C-1（Dev Signer）**，更快、更可控、不依赖额外扩展 |
| 不再投入 MetaMask | ✅ 严格执行，直接绕开 |
| README 移到 D2 下午 | ✅ 中英双版都做完 |
| GitHub push 固化 | ✅ 5 commits 推完 |
| 修 `contracts/.env` 里 chainId=16601 → 16602 | ✅ 已修 |
| 端到端 demo 跑通 | ✅ 4 笔 tx 上链全绿 |

**对照结论**：所有 17:00 设定的目标全部完成或超额完成。

---

## 附录 A：可点验证链接（评审现场可直接打开）

- 合约：<https://chainscan-galileo.0g.ai/address/0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6>
- 部署 Tx：<https://chainscan-galileo.0g.ai/tx/0xa0f02c538115e305cc8e290fd8602ac60eb2c661e17096c16248a3c301a91ffe>
- E2E Tx 1（Create）：<https://chainscan-galileo.0g.ai/tx/0x0069b5ecdc88ab1569f273e665793f8e298cd50e6ef707854ea1f89ad9f92b3e>
- E2E Tx 2（Ping）：<https://chainscan-galileo.0g.ai/tx/0x9d5e9c8e65041753b9e85b2db3a25a09072db0d5a8616d75d7c5219728458806>
- E2E Tx 3（Claim revert 负例）：<https://chainscan-galileo.0g.ai/tx/0x3ec5b4a0860cf8eeca63207ce5e50bec186333f581b3988b328625dccbe36e73>
- E2E Tx 4（Claim success 正例）：<https://chainscan-galileo.0g.ai/tx/0xe636eb255581f9dea32597cedbc08f03bfc5febb843df41c58d74e1308f3b64a>
- 仓库：<https://github.com/zwyzjj/Digital-Legacy>

## 附录 B：关键文件物理位置

```
d:\Digital Legacy project\
├── README.md                                                 # 中文门面
├── README.en.md                                              # 英文门面
├── contracts\
│   ├── src\Legacy.sol                                        # 合约源码
│   ├── test\Legacy.t.sol                                     # 测试
│   ├── DEPLOYED.md                                           # 部署记录
│   └── foundry.toml
├── web\
│   ├── src\components\vault-panel.tsx                        # 主 UI
│   ├── src\lib\dev-signer.ts                                 # 救场实现
│   └── src\app\api\rpc\route.ts                              # RPC 代理
├── docs\screenshots\
│   ├── 01-explorer-contract-deployed.png
│   ├── 02-create-vault-success.png
│   ├── 03-ping-success.png
│   ├── 04-claim-too-early-revert.png
│   ├── 05-claim-success.png
│   └── 06-github-repo.png
└── deliverables\
    ├── runbooks\
    │   ├── d2-morning-wallet-and-frontend-2026-05-12-01-12.md
    │   └── d2-afternoon-rabby-rescue-and-e2e-2026-05-12-17-10.md
    ├── reviews\
    │   ├── d1-d2-progress-review-2026-05-12-1700.md         # 中场评审
    │   └── d1-d2-progress-review-2026-05-12-1842.md         # 本文件
    └── marketing\
        └── x-post-draft.md                                   # X 推文 4 版
```

## 附录 C：本次评审周期的关键时间戳

| 时间 | 里程碑 |
|---|---|
| 2026-05-12 00:37 | D1 收尾 runbook 启动 |
| 2026-05-12 01:09 | 合约首次部署成功（Explorer 截图 01） |
| 2026-05-12 01:12 | D2 上午 runbook 启动 |
| 2026-05-12 ~ 14:00 | 前端 UI 完成，钱包连接 OK，但 send tx 在 MetaMask 卡死 |
| 2026-05-12 17:00 | 中场评审，决议放弃 MetaMask，写出 17:00 review doc |
| 2026-05-12 17:10 | D2 下午 runbook 启动（Rabby 救场计划） |
| 2026-05-12 ~ 17:30 | **决定性诊断**：`cast send` 命中 0G min priority fee=2 gwei |
| 2026-05-12 ~ 17:40 | Dev Signer 实现 + 首笔 tx `0x536448` 上链 Success |
| 2026-05-12 17:55–17:58 | E2E 4 笔 tx（vault 3）全绿 |
| 2026-05-12 ~ 18:15 | git commit `8ae4045` + push GitHub |
| 2026-05-12 ~ 18:30 | 中英双版 README 完成 + commit `72b4604` + push |
| 2026-05-12 ~ 18:37 | X 推文 4 版草稿完成（含字符超限失败案例） |
| 2026-05-12 18:42 | **本评审材料生成** |

**D1+D2 总耗时**：约 18 小时（含夜间睡眠 ~6h）。**净开发时间**：约 12 小时。

---

## 11. 推荐评审决议

> **建议通过**。
>
> 项目已超额完成 D1 + D2 红线。所有黑客松提交要件（代码、部署、E2E 证据、双语 README、截图、营销文案）齐备。剩余动作均为 30 分钟级别的"按下发布按钮"类操作，无任何技术阻塞。
>
> 建议立即进入"明日上午 90 分钟交付窗口"：repo 转 Public → 发推 → 录视频 → 填提交表单。完成后再决定 D3 下午是否启动 D4 路线图项。

---

*评审材料生成方式：基于 git 历史 + 链上 tx 验证 + 文件系统状态。所有数字、hash、commit ID 可在仓库内独立校验。*
