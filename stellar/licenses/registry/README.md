# Cargo registry dependency notices

This directory preserves license, copying, copyright, notice and author files for the union of registry packages resolved by the shipped `oft` and `sac-manager` Cargo lockfiles. It includes build, test and target-specific dependencies as well as runtime dependencies. It is an overinclusive attribution inventory, **not** an exact list of components compiled into either WASM file.

The machine-readable inventory is [`../../registry-license-inventory.json`](../../registry-license-inventory.json). Each entry records the exact package name and version, original declared license expression, registry URL, archive SHA-256, referring lockfiles, preserved notice paths and their hashes, and any remaining gaps. Registry archive checksums were checked against the lockfiles before notice files were copied. No crate code or build script was executed to collect these notices.

Files retain their published bytes and package-relative paths. When a published crate omits its workspace's license files, the inventory explicitly identifies supplementary notices obtained from the official upstream repository at the commit recorded inside that crate's `.cargo_vcs_info.json`. These supplementary files are not represented as contents of the registry archive.

License expressions are reproduced from package metadata without choosing among alternatives. Some packages include additional notices or license exceptions; retain the whole directory when redistributing the release. The inventory documents available attribution material rather than making a legal conclusion about a particular downstream use. Local path dependencies and LayerZero's Stellar protocol license are documented separately in the parent directory and repository third-party notices.
