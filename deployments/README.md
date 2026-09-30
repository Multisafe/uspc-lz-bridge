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
