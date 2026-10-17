# Verifying this release

The release checks validate the packaged sources, build artifacts and file hashes.

| Check | What it establishes |
| --- | --- |
| Release checksums | The listed public files match the release baseline |
| EVM rebuild | Exact Solidity sources and compiler settings reproduce the archived artifacts |
| Stellar file verification | Source/build files and saved deployed WASM match their recorded hashes |
| Stellar Docker rebuild | Fresh Linux/amd64 builds reproduce both deployed WASMs byte for byte |

These checks do not establish current contract permissions, bridge availability or a comprehensive security audit.

## Offline checks

Install from the pinned lockfile and run:

```sh
corepack pnpm install --frozen-lockfile --ignore-scripts
corepack pnpm check
```

Once dependencies are installed, this command does not need network access. The EVM build compares compiled ABI, bytecode, metadata and storage layout with separate reference files, and checks embedded compiler inputs against the readable Solidity sources. The Stellar verifier checks source files, saved WASMs and dependency notices against their recorded hashes. The release checker validates every file in `SHA256SUMS` and scans for credential patterns and machine-specific paths.

Node dependencies, Git internals, local `.env` files, and generated build directories are excluded from `SHA256SUMS`. Keep those local files out of release archives. The checksum list is the explicit public-file inventory. Credential-pattern checks are a supplementary review aid, not a complete secret-detection guarantee.

## Stellar Docker rebuild

With Docker running, use `corepack pnpm check:stellar` to compile both Stellar contracts and compare their bytes with the preserved deployed WASMs. The image and toolchain are pinned; dependencies use the original lockfiles. Each run uses fresh compiler outputs and reuses only registry downloads. See the [Stellar build recipe](../stellar/README.md#reproduce-with-docker).

## Comparing deployed contracts

The [deployment manifest](../deployments/mainnet.json) records contract addresses, code hashes and deployment transactions. Runtime bytecode can contain immutable values substituted during deployment; account for the ranges in [bytecode-layout.json](../evm/bytecode-layout.json) when comparing a compiler template with a deployed instance. For proxies, inspect the current implementation separately.

Read mutable settings directly from the contracts. The manifest identifies the release and does not track current permissions or route configuration. Stellar reproduction results are documented in the [Stellar README](../stellar/README.md#provenance-and-build-results).

## Updating release checksums

Do not edit preserved contract source, compiler inputs, or reference artifacts to make a new build appear to match. A changed deployment or source version needs a new, explicitly documented baseline and new verification evidence.

For reviewed documentation or metadata changes, regenerate the public-file inventory and run the checks again:

```sh
corepack pnpm checksums:update
corepack pnpm check
```

Inspect the checksum diff together with the content diff. Regenerating the inventory is an explicit release-maintenance action, not a remedy for an unexplained mismatch. The GitHub workflow runs both the release checks and the Stellar Docker rebuild. Network access downloads dependencies and the build image; no wallet credentials or live-chain access are needed.
