# Mainnet deployments

[`mainnet.json`](mainnet.json) records the Ethereum, Monad and Stellar contract addresses, LayerZero endpoint IDs, token precision, deployment transactions and deployed runtime hashes. Artifact paths are relative to the repository root.

The supported routes are Ethereum ↔ Stellar and Ethereum ↔ Monad. Transfers between Stellar and Monad use two transfers through Ethereum. USPC has 6 local decimals on Ethereum and Monad, 7 on Stellar, and 6 shared decimals.

## Manifest fields

- `addresses`: token, bridge and infrastructure identities. For EVM networks, `adapter` is the bridge proxy, `implementation` is its logic contract and `proxyAdmin` is the proxy administration contract. The Stellar `issuer` identifies the USPC asset.
- `artifacts`: packaged contract artifacts. For EVM networks, `adapter` contains the implementation artifact and `proxy` contains the proxy artifact.
- `runtimeCodeHashes`: Keccak-256 hashes of deployed EVM runtime bytecode, including compiler immutables. Keys refer to the corresponding entries in `addresses`.
- `wasmSha256`: SHA-256 hashes of the deployed Stellar OFT and SAC manager WASM, matching the packaged artifacts.
- `deploymentTransactions`: transaction hashes keyed by the deployed contract's purpose. EVM `adapter` transactions deploy the proxy and its ProxyAdmin; Stellar `sac` identifies creation of the Stellar Asset Contract.

Contract addresses and hashes identify the release. Upgradeable contracts can change after deployment; read the chain for current implementations and operational settings.

## Administration handoff

[`handoff-2026-10-18.json`](handoff-2026-10-18.json) is a separate, dated authority and operating baseline. Its date uses Asia/Dubai; the readback completed at `2026-10-17T21:14:22.945Z`.

| Authority or setting | Observed state |
| --- | --- |
| Ethereum and Monad bridge default admin, endpoint delegate, ProxyAdmin owner and fee recipient | Company EVM account `0x816fd5a87eb1F5d4EFCB85D824827f79cb7df967` |
| Ethereum and Monad adapter roles | Company EVM account is the sole member of the default admin and five operational roles; `MESSAGE_NILIFIER_ROLE` is empty |
| Monad USPC token | Company EVM account has `DEFAULT_ADMIN_ROLE`; the adapter has `BRIDGE_ROLE`; the retired operator has neither role |
| Stellar OFT and SAC Manager owners and authorizers; OFT endpoint delegate | Company Stellar account `GDO6NS2QLHHJLV2TV46AVVG2PRPM4AB26HN4UWQNFSXMYP4QN62AWIVM` |
| Stellar roles | Company Stellar account holds all four OFT operational roles and the Manager's `BLACKLISTER_ROLE` and `ADMIN_MANAGER_ROLE`; only the OFT holds `MINTER_ROLE` |
| Stellar asset administration | SAC Manager remains the SAC admin; the classic issuer has zero master weight and no additional signers |
| Pending ownership | No pending default admin on either EVM adapter and no pending owner on either Stellar contract |
| Route settings | Configured routes are unpaused, with zero application fees and 10,000,000 USPC inbound and outbound limits per 86,400 seconds |

The retired EVM and Stellar operators are absent from the enumerated bridge role lists. Monad token roles are not enumerable: its entries record `hasRole` results for the specified accounts, not a complete membership list. Stellar's fee recipient is unset while its effective application fee is zero.

Rate limits in the JSON use local token units: `10000000000000` at 6 decimals on Ethereum and Monad, and `100000000000000` at 7 decimals on Stellar. Application fees exclude network and LayerZero delivery fees.

Ethereum and Monad observations are pinned to blocks `26214892` and `114288268`. Stellar reads span ledgers `64997173`–`64997175` and are not an atomic snapshot. These are historical observations; read current chain state before signing. See [verification scope](../docs/verification.md#handoff-readback).
