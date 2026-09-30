# USPC Stellar bridge contracts

This folder contains the deployed USPC OFT and SAC-manager WASMs, their Rust sources and local dependencies.

The source is pinned to LayerZero's [monorepo-external commit d20f6fa202306c9a01826cf071fcaed982490c5f](https://github.com/LayerZero-Labs/monorepo-external/tree/d20f6fa202306c9a01826cf071fcaed982490c5f).

## Deployed artifacts

| Artifact | Contract | SHA-256 |
| --- | --- | --- |
| `artifacts/oft.wasm` | `CCATTAMTXDP6ZCB3RJRCF536H5XKDRQ4T4R4QAWZNWMZ6ZL4A6S42AOV` | `9410ac84392abff5c805df7636e4988a8f40b4f2e403f8f97a7116d3ff0c70f6` |
| `artifacts/sac_manager.wasm` | `CAJPMDOLAKXKQEPNG4XRBSLF7QRQ7I3XIBF24EFLZPXWZEO5QRZCIHWV` | `4b6e32489d58e0d54cd83c1c1123c714a69a271a6674e1522ab346e28d0c10aa` |

The USPC Stellar Asset Contract, `CCIMELDVXPSNVYLMZB3YA7X52IIETA63PLHBVQJGQW3WSGEKHUC3EAPC`, is native to Stellar and has no custom Rust WASM.

The saved OFT is the **unoptimized** `oft.wasm`; the saved manager is the **optimized** `sac_manager.optimized.wasm`, exported as `sac_manager.wasm`. Optimizing both produces a different OFT hash.

## Verify the export

From the public repository root:

```sh
node stellar/verify.mjs
```

This checks source, build-file and artifact hashes against [provenance.json](provenance.json), and registry notices against their [inventory](registry-license-inventory.json). Verification is local and does not query the chain.

## Reproduce with Docker

With Docker running, execute from the repository root:

```sh
corepack pnpm check:stellar
```

The equivalent command is `node stellar/reproduce.mjs`; it requires no npm dependencies. The [Dockerfile](Dockerfile) pins the official Stellar image by digest, with Rust `1.90.0` and Stellar CLI `25.1.0`. The runner selects `linux/amd64` on Linux and macOS; ARM hosts need Docker's amd64 emulation.

Each run verifies the preserved files, fetches dependencies with `cargo fetch --locked`, compiles both projects offline into fresh target directories, and compares the rebuilt WASMs byte for byte with the deployed artifacts. Only the SAC Manager is optimized. Sources are mounted read-only, and source/artifact hashes are checked again afterward. Any mismatch fails the command and the CI job.

Registry downloads and successful rebuilt WASMs stay in the ignored `stellar/build/` directory; temporary compiler outputs are removed. The first run needs network access for the image and crates. No RPC endpoint, wallet or signing key is used.

The deployed WASMs contain no `bldimg` metadata, so the recipe does not add it. Historical build records identify the image tag `stellar/stellar-cli:25.1.0-rust1.90.0-slim-bookworm`, but did not record its digest. The digest pinned here was verified by reproducing both artifacts.

## Provenance and build results

[provenance.json](provenance.json) maps source and build files to upstream paths and hashes. All 205 Rust source files match the pinned commit byte for byte. Generated Cargo manifests retain upstream `build-utils-rust` relative-path rewrites.

**Both contracts reproduce their deployed WASMs exactly on Linux/amd64.** [build-reproduction.json](build-reproduction.json) records the environment, commands and comparison hashes. An earlier macOS arm64 build produced a different OFT binary; use the Docker workflow for exact reproduction. Preserved sources, lockfiles and deployed artifacts remain unchanged.

[Upstream audit reports](../README.md#published-audit-references) reference this source revision; they do not establish an audit of USPC's deployed WASMs or configuration.

See [LICENSES.md](LICENSES.md) for MIT application/common-package and LZBL-1.3 protocol terms. The [registry inventory](registry-license-inventory.json) covers 189 exact-version dependencies and [356 preserved notices](licenses/registry/README.md), including build, test and target-specific dependencies. It is not a precise inventory of code compiled into either WASM.
