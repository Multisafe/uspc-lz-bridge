# EVM contracts: exact release sources

This directory contains the Solidity sources and compiler inputs used for the USPC bridge on Ethereum and Monad. It includes the complete imported source code, so compilation does not download or resolve contract dependencies.

The source text is preserved byte for byte. Files are not flattened or reformatted, and compiler source names retain their original `contracts/…`, `@layerzerolabs/…`, and `@openzeppelin/…` paths.

## Contracts included

| Chain | Contract | Purpose |
| --- | --- | --- |
| Ethereum | `OFTLockUnlockExtendedRBACUpgradeable` | LayerZero implementation that holds canonical Ethereum USPC in escrow and releases it on return. |
| Monad | `USPCMonad` | Six-decimal ERC20 representation, minted and burned through its bridge role. |
| Monad | `OFTBurnMintExtendedRBACUpgradeable` | LayerZero implementation that burns outgoing Monad USPC and mints incoming USPC. |
| Both | `TransparentUpgradeableProxy` | Proxy through which the bridge implementation is used. |
| Both | `ProxyAdmin` | Upgrade administrator contract created by each transparent proxy. |

The LayerZero and OpenZeppelin contracts are upstream code at the pinned versions below. `USPCMonad.sol` is the project-specific token. The `CompileImports.sol` and `CompileMonad.sol` files are compilation entry points, not deployed contracts.

The existing Ethereum USPC token is an external asset used by the bridge; its vault implementation is not a contract deployed by this bridge release. Disposable test tokens are also excluded.

## Reproduce the build

After installing the root package's pinned dependencies, run from the repository root:

```sh
node evm/build.mjs
```

This compiles both self-contained inputs, compares the complete generated artifacts with the release references, and writes matching results to `evm/build/`. To perform the same comparison without writing build outputs:

```sh
node evm/build.mjs --check
```

Neither command contacts a blockchain, loads a wallet, or sends a transaction. Only the pinned `solc` package and Node's standard library are needed. No Solidity packages need to be installed because all imported sources are embedded in the compiler inputs.

| Build setting | Exact value |
| --- | --- |
| Solidity compiler | `0.8.26+commit.8a97fa7a.Emscripten.clang` (`solc` npm package `0.8.26`) |
| Optimizer | Enabled, 200 runs |
| IR pipeline | `viaIR: true` |
| EVM target | `paris` |
| Metadata | Literal source contents; IPFS bytecode hash |
| LayerZero OApp, OFT and utility packages | `1.2.35`, including upgradeable variants |
| LayerZero Endpoint interface package | `@layerzerolabs/lz-evm-protocol-v2` `3.0.168` |
| OpenZeppelin contracts | `5.4.0`, including upgradeable contracts |

## Files and provenance

- `sources/`: 92 unique Solidity files, including all dependencies and compilation entry points.
- `compiler-inputs/ethereum.json`: 85-source input reconstructed from the original Ethereum compilation entry point and pinned source files. Every dependency was checked against the original artifact's source hash, and the reconstructed input reproduces the complete original artifacts.
- `compiler-inputs/monad.json`: byte-for-byte copy of the original saved 90-source Monad standard JSON input.
- `artifacts/ethereum/` and `artifacts/monad/`: reference artifacts with ABI, creation bytecode, runtime bytecode template, compiler metadata and storage layout. The five existing artifacts are copied unchanged from the original build. The two `ProxyAdmin` references are reproduced from the same exact sources and compiler settings; these contracts were created internally by their proxies.
- `verification/monad/`: the four exact standard JSON publication payloads used for Monad source verification, including the creation transaction hashes and compiler version.
- `source-hashes.json`: SHA-256 of each readable source file and its original SPDX identifier.
- `bytecode-layout.json`: compiler-reported immutable and link-reference ranges, indexed by chain and contract name.
- `provenance.json`: artifact origins and file hashes.

The build checks that readable sources, embedded input sources, reference hashes and generated artifacts agree. References are kept separate from generated build outputs so rebuilding cannot silently replace the release baseline.

## Build artifacts and deployed instances

`bytecode` is creation code **without** appended constructor arguments. `deployedBytecode` is the compiler's runtime template. Immutable values are filled during deployment, so an implementation or proxy's live runtime may differ at the compiler-reported immutable offsets. Those ranges are recorded in `bytecode-layout.json`; they must be handled explicitly when comparing a live instance with a build artifact.

Reproducing these artifacts establishes the source/compiler relationship. Read the contracts for their current implementation, administrator, peers, limits, pause state and LayerZero verification configuration. The [deployment manifest](../deployments/mainnet.json) lists the release's contract identities and code hashes.

Every bundled Solidity source declares SPDX `MIT`. Original headers are retained. See the [dependency notices](licenses/) for copyrights and license texts. Only the required MIT protocol interfaces are included; this directory does not copy the full LayerZero protocol implementation package.
