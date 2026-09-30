#!/bin/sh
set -eu

test "$(uname -m)" = x86_64
mkdir -p "$TMPDIR" /output/artifacts
build=$(mktemp -d /output/rebuild.XXXXXX)
trap 'rm -rf "$build"' EXIT

rustc --version
stellar --version

# Reuse registry downloads, but compile into fresh target directories every time.
for package in oft sac-manager; do
  cd "/source/contracts/$package"
  export CARGO_TARGET_DIR="$build/$package"
  cargo fetch --locked
  CARGO_NET_OFFLINE=true stellar contract build --package "$package"
done

# The deployed OFT is unoptimized; only the SAC Manager was optimized.
oft="$build/oft/wasm32v1-none/release/oft.wasm"
manager="$build/sac-manager/wasm32v1-none/release/sac_manager"
stellar contract optimize --wasm "$manager.wasm"

cmp /source/artifacts/oft.wasm "$oft"
cmp /source/artifacts/sac_manager.wasm "$manager.optimized.wasm"
cp "$oft" /output/artifacts/oft.wasm
cp "$manager.optimized.wasm" /output/artifacts/sac_manager.wasm
sha256sum /output/artifacts/oft.wasm /output/artifacts/sac_manager.wasm
echo 'Both Stellar builds reproduce the deployed WASM byte for byte.'
