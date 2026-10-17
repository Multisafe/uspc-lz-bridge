# USPC bridge contracts

Deployed contract sources, build inputs, and verification tools for the USPC LayerZero bridge on **Ethereum, Stellar, and Monad**.

USPC locks on Ethereum and mints on the destination chain; returning burns the representation and unlocks Ethereum USPC. The bridge preserves token quantities and does not calculate NAV.

For token addresses, NAV pricing and lending requirements, see the [DeFi integration guide](docs/defi-integration.md).

## Supported routes

**Ethereum ↔ Stellar** and **Ethereum ↔ Monad**. There is no direct Stellar ↔ Monad route.

The documented policy requires all three DVNs: **LayerZero Labs, Nethermind, and Horizen**. Route settings and permissions are mutable; read the current configuration from the contracts.

## Mainnet contracts

| Chain | Contract purpose | Address |
| --- | --- | --- |
| Ethereum | Canonical USPC token / vault, referenced by the bridge | [`0xbF4e3fbE8B60062A00C7a6B1D97d0d49c2971A19`](https://etherscan.io/address/0xbF4e3fbE8B60062A00C7a6B1D97d0d49c2971A19) |
| Ethereum | Lock/unlock bridge proxy | [`0xf3E6FAE17564a95344295c428E13EaAEaD17E474`](https://etherscan.io/address/0xf3E6FAE17564a95344295c428E13EaAEaD17E474#code) |
| Monad | USPC ERC20 representation | [`0xdAFA800e2C60830cB8D2bd3C022C073e6EC8876E`](https://monadscan.com/address/0xdAFA800e2C60830cB8D2bd3C022C073e6EC8876E#code) |
| Monad | Burn/mint bridge proxy | [`0xf3E6FAE17564a95344295c428E13EaAEaD17E474`](https://monadscan.com/address/0xf3E6FAE17564a95344295c428E13EaAEaD17E474#code) |
| Stellar | USPC asset contract | [`CCIMELDVXPSNVYLMZB3YA7X52IIETA63PLHBVQJGQW3WSGEKHUC3EAPC`](https://stellar.expert/explorer/public/contract/CCIMELDVXPSNVYLMZB3YA7X52IIETA63PLHBVQJGQW3WSGEKHUC3EAPC) |
| Stellar | OFT bridge | [`CCATTAMTXDP6ZCB3RJRCF536H5XKDRQ4T4R4QAWZNWMZ6ZL4A6S42AOV`](https://stellar.expert/explorer/public/contract/CCATTAMTXDP6ZCB3RJRCF536H5XKDRQ4T4R4QAWZNWMZ6ZL4A6S42AOV) |
| Stellar | SAC Manager | [`CAJPMDOLAKXKQEPNG4XRBSLF7QRQ7I3XIBF24EFLZPXWZEO5QRZCIHWV`](https://stellar.expert/explorer/public/contract/CAJPMDOLAKXKQEPNG4XRBSLF7QRQ7I3XIBF24EFLZPXWZEO5QRZCIHWV) |

The Ethereum and Monad proxies share an address, but their implementations perform different operations. A matching address across networks does not mean matching code. Implementation addresses, ProxyAdmins, chain IDs, LayerZero endpoint IDs, issuer identity, and deployment transaction references are recorded in the [deployment manifest](deployments/mainnet.json).

## Contract sources and upstream audits

The LayerZero application contracts below come from [`LayerZero-Labs/monorepo-external`](https://github.com/LayerZero-Labs/monorepo-external). Ethereum and Monad use its EVM packages; Stellar uses its Rust contracts. The source links point to the revisions used by this release.

| Used by | LayerZero contract | Source revision |
| --- | --- | --- |
| Ethereum escrow adapter | [`OFTLockUnlockExtendedRBACUpgradeable`](https://github.com/LayerZero-Labs/monorepo-external/blob/7e73c3017040d80eaefbd57f510c79c443c208c3/apps/oft-app/contracts/evm/upgradeable/contracts/extended/OFTLockUnlockExtendedRBACUpgradeable.sol) | `@layerzerolabs/oft-upgradeable-evm-contracts@1.2.35`, matching `7e73c301` |
| Monad burn/mint adapter | [`OFTBurnMintExtendedRBACUpgradeable`](https://github.com/LayerZero-Labs/monorepo-external/blob/7e73c3017040d80eaefbd57f510c79c443c208c3/apps/oft-app/contracts/evm/upgradeable/contracts/extended/OFTBurnMintExtendedRBACUpgradeable.sol) | `@layerzerolabs/oft-upgradeable-evm-contracts@1.2.35`, matching `7e73c301` |
| Stellar bridge | [`oft`](https://github.com/LayerZero-Labs/monorepo-external/tree/d20f6fa202306c9a01826cf071fcaed982490c5f/apps/oft-app/contracts/stellar/oft) | Pinned commit `d20f6fa2` |
| Stellar asset management | [`sac-manager`](https://github.com/LayerZero-Labs/monorepo-external/tree/d20f6fa202306c9a01826cf071fcaed982490c5f/apps/oft-app/contracts/stellar/sac-manager) | Pinned commit `d20f6fa2` |

**EVM source match:** all 66 Solidity files in the six installed OFT, OApp, and utilities packages at version `1.2.35` match public commit [`7e73c3017040d80eaefbd57f510c79c443c208c3`](https://github.com/LayerZero-Labs/monorepo-external/commit/7e73c3017040d80eaefbd57f510c79c443c208c3). This establishes the matching public source revision. The npm metadata does not record a publishing Git commit. The exported import closure and source hashes are preserved under [`evm/`](evm/).

**Stellar source pin:** commit [`d20f6fa202306c9a01826cf071fcaed982490c5f`](https://github.com/LayerZero-Labs/monorepo-external/commit/d20f6fa202306c9a01826cf071fcaed982490c5f). All 205 exported Rust source files match their mapped files at that commit; [`stellar/provenance.json`](stellar/provenance.json) records the paths and hashes.

### Published audit references

The following reports are published in LayerZero's [official audit repository](https://github.com/LayerZero-Labs/Audits). They assess upstream code at the revisions stated in each report.

| Component | Report | Relevant scope and revision |
| --- | --- | --- |
| EVM extended OFT adapters | [OtterSec, 28 July 2026](https://github.com/LayerZero-Labs/Audits/blob/main/audits/OFT/Console%20%26%20Nexus%20OFT/Console%20%26%20Nexus%20OFT%20EVM/ConsoleEVM-OtterSec-28Jul2026.pdf) | Explicitly includes both adapter classes above, OFT Core, OApp, and role, fee, pause, rate-limit and credit-redirect modules. Final reviewed public commit: `135db014bd9c7e778a2282618cdab24ed6b8fff6` (PDF pp. 4–7). |
| EVM extended OFT adapters | [Guardian, 31 July 2026](https://github.com/LayerZero-Labs/Audits/blob/main/audits/OFT/Console%20%26%20Nexus%20OFT/Console%20%26%20Nexus%20OFT%20EVM/ConsoleEVM-Guardian-31Jul2026.pdf) | Includes both adapters and their supporting modules. The report maps public paths at `135db014…`, while retaining its original `audit-external` review commits as the audited boundary (PDF pp. 3, 5, 7–8). |
| Stellar OFT, OFT Core and SAC Manager | [Zellic, updated through 14 July 2026](https://github.com/LayerZero-Labs/Audits/blob/main/audits/Endpoint%20V2%20-%20Stellar/StellarEndpoint-Zellic-14Jul2026.pdf) | Explicit OFT scope on p. 9 and SAC Manager scope on p. 21. The final diff review ends at the same `d20f6fa2…` revision pinned here (PDF p. 23). |
| Stellar protocol and OFT extensions | [OtterSec, 14 July 2026](https://github.com/LayerZero-Labs/Audits/blob/main/audits/Endpoint%20V2%20-%20Stellar/StellarEndpoint-OtterSec-14Jul2026.pdf) | Records a follow-up at `d20f6fa2…` (PDF p. 4), with findings covering OFT fee and rate-limit extensions. SAC Manager is not explicitly named in this report. |

All 46 exported Solidity files from the six LayerZero application packages also match OtterSec's final public revision [`135db014bd9c7e778a2282618cdab24ed6b8fff6`](https://github.com/LayerZero-Labs/monorepo-external/commit/135db014bd9c7e778a2282618cdab24ed6b8fff6) byte for byte. This confirms source correspondence despite the later `1.2.35` package release; each report's stated scope still applies. The Stellar reports identify our pinned upstream revision, but do not establish an audit of USPC's deployed WASM or configuration.

`USPCMonad.sol` is custom USPC code built on OpenZeppelin Contracts `5.4.0`. The transparent proxies and ProxyAdmins are also OpenZeppelin contracts. The LayerZero reports above do not establish an independent audit of the custom token, USPC role assignments, bridge wiring, or the complete USPC deployment.

## Build and verify locally

Use **Node.js 22.23.1** and **pnpm 10.17.1**. No signing key is needed.

```sh
corepack pnpm install --frozen-lockfile --ignore-scripts
corepack pnpm check
```

These checks rebuild EVM artifacts and verify saved Stellar files and release checksums. To rebuild both Stellar contracts using the pinned Linux/amd64 toolchain, start Docker and run:

```sh
corepack pnpm check:stellar
```

EVM builds and both Stellar WASMs reproduce exactly with the documented toolchains. CI runs both checks. Build details: [EVM](evm/README.md), [Stellar](stellar/README.md).

See [verification details](docs/verification.md) for the scope of these checks.

## Repository contents

| Directory | Contents |
| --- | --- |
| [`evm/`](evm/) | Exact Solidity sources, compiler inputs, reference artifacts, and reproducible build script |
| [`stellar/`](stellar/) | Pinned Rust sources, deployed OFT/SAC Manager WASM files, and build provenance |
| [`deployments/`](deployments/) | Mainnet contract identities, code hashes and deployment transactions |
| [`docs/`](docs/) | Architecture, integration boundaries, and verification guidance |
| [`scripts/`](scripts/) | Release checksums and disclosure checks |

The Ethereum vault/NAV system and admin dashboard are outside this bridge release.

## Security and administration

Both routes share Ethereum collateral. Administrators can upgrade adapters and change permissions or route settings. Pauses or DVN outages can delay delivery. See [architecture](docs/architecture.md).

Report vulnerabilities privately to the repository maintainers, with the affected chain, contract, and a minimal reproduction. Do not include keys or publish unpatched exploit details.

## Licenses

Original release tooling and documentation use [MIT](LICENSE). Copied code retains its upstream terms: [EVM notices](evm/licenses/), [Stellar MIT and LZBL-1.3 notices](stellar/LICENSES.md), and [Rust dependency notices](stellar/licenses/registry/README.md). Keep these notices with redistributed source and artifacts; an audit or pinned commit does not replace them.
