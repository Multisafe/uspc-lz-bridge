# Stellar source licenses and attribution

This export contains components with different licenses. It is **not licensed as a whole under MIT**. The original texts below were copied byte-for-byte from LayerZero's local `monorepo-external` checkout at commit `d20f6fa202306c9a01826cf071fcaed982490c5f`; they retain the original LayerZero Labs Ltd. attribution. This inventory records the notices found in that pinned source, not an independent legal opinion or a new license grant.

## Source-to-license map

Paths and patterns in the first column are relative to `stellar/`. In dependency patterns, `{oft,sac-manager}` means either exported contract directory and `**` means zero or more nested directories. These patterns cover direct and recursively copied dependencies under `contracts/oft/` and `contracts/sac-manager/`; they do not refer to a top-level `stellar/dependencies/` directory. A parent package's notice does not replace the notices of its dependencies.

| Exported source/package | Upstream license source at the pinned commit | Preserved license |
| --- | --- | --- |
| Own files in `contracts/oft/`, including its `src/interfaces/` and `src/oft_types/` | `apps/oft-app/contracts/stellar/oft/LICENSE` | [MIT: OFT](licenses/layerzero-stellar-oft-MIT.txt) |
| Own files in `contracts/sac-manager/`, including `src/interfaces/` | `apps/oft-app/contracts/stellar/sac-manager/LICENSE` | [MIT: SAC manager](licenses/layerzero-stellar-sac-manager-MIT.txt) |
| `contracts/{oft,sac-manager}/**/dependencies/oft-core-stellar-contracts/` | `apps/oft-app/contracts/stellar/oft-core/LICENSE` | [MIT: OFT core](licenses/layerzero-stellar-oft-core-MIT.txt) |
| `contracts/{oft,sac-manager}/**/dependencies/oapp-stellar-contracts/` | `apps/oapp-app/contracts/stellar/contracts/LICENSE` | [MIT: OApp](licenses/layerzero-stellar-oapp-MIT.txt) |
| `contracts/{oft,sac-manager}/**/dependencies/oapp-macros-stellar-contracts/` | `apps/oapp-app/contracts/stellar/macros/LICENSE` | [MIT: OApp macros](licenses/layerzero-stellar-oapp-macros-MIT.txt) |
| `contracts/{oft,sac-manager}/**/dependencies/common-utils-stellar-contracts/` | `contracts/common/utils/stellar/common-utils/LICENSE` | [MIT: common utilities](licenses/layerzero-stellar-common-utils-MIT.txt) |
| `contracts/{oft,sac-manager}/**/dependencies/common-utils-macros-stellar-contracts/` | `contracts/common/utils/stellar/common-utils-macros/LICENSE` | [MIT: common macros](licenses/layerzero-stellar-common-macros-MIT.txt) |
| `contracts/{oft,sac-manager}/**/dependencies/protocol-stellar-v2/`, including endpoint-v2, ULN302 and their interfaces, except components with their own different notices | `contracts/protocol/stellar/contracts/LICENSE` | [LayerZero Business License 1.3](licenses/layerzero-stellar-protocol-LZBL-1.3.txt) |

In this pinned source there is no separate Stellar OFTAdapter crate: `contracts/oft/src/oft_types/mod.rs` defines `LockUnlock` and `MintBurn`, and the lock/unlock implementation belongs to the OFT package.

## Preserving the notices

The MIT texts require their copyright and permission notices to accompany copies or substantial portions of the software. Keep the complete corresponding texts with redistributed source and artifacts.

The protocol text expressly identifies itself as **not an open-source license**. It grants copying, modification, redistribution and Non-Production Use subject to its terms, requires conspicuous display of the license and its License Text on original and modified copies, and applies to source and object code. Its definitions exclude mainnet or real-asset processing from Non-Production Use and restrict Permissioned Applications; its change provision is version-specific. See the unmodified [LZBL-1.3 text](licenses/layerzero-stellar-protocol-LZBL-1.3.txt) for the operative terms. Inclusion in this export does not expand its permissions.

The upstream Rust dependency resolver copies selected source/build files while omitting conventional `LICENSE`/`NOTICE` files and `package.json` license metadata. Its rules are in `tools/vm-utils/rust/build-utils/src/resolve/exclude.ts`, applied by `src/resolve/io.ts`; resolution recreates the dependency directories. The named files in `licenses/` preserve notices that would otherwise be lost from those generated copies. Keep this map and bundle outside regenerated dependency folders.

## Interface and compiled artifacts

The protocol's `library` feature changes which implementation code is compiled; it is not a license exception. No separate permissive notice was found for endpoint-v2 or ULN302 interface sources in the pinned protocol tree. Their LZBL-1.3 source notice remains in this bundle.

The OFT and SAC-manager package notices describe their own source; dependency notices remain separate. Keep this bundle accompanying `artifacts/oft.wasm` and `artifacts/sac_manager.wasm`. An artifact name, package-level MIT declaration, or absence of embedded license strings does not establish that the entire compiled artifact is MIT-only. Artifact hashes and deployed-source correspondence belong to the export's provenance record.

## Separate limitations

- **Historical build and optimization reproduction:** preserving source and notices does not itself establish reproducibility. The clean rebuild described in [build-reproduction.json](build-reproduction.json) matched the deployed SAC manager exactly; the OFT build succeeded but its function and code sections differ. This license inventory does not certify the build pipeline.
- **Registry dependency inventory:** [registry-license-inventory.json](registry-license-inventory.json) covers all 189 unique exact-version registry packages resolved by the two shipped Cargo lockfiles. The [registry notice bundle](licenses/registry/README.md) preserves 356 full notice files: 340 copied unchanged from checksum-verified crate archives and 16 explicitly identified upstream supplements, fetched at embedded VCS commits, for 13 crates whose archives omit workspace notices. No separate-notice gaps remain in that resolved-package inventory. It deliberately includes build, test and target-specific dependencies; it does not identify the precise set of crates compiled into each WASM or make a legal conclusion about downstream use. License alternatives and additional notices are preserved without choosing among them.
