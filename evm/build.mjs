import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";

const root = dirname(fileURLToPath(import.meta.url));
const checkOnly = process.argv.includes("--check");
assert(
  process.argv.slice(2).every((arg) => arg === "--check"),
  "Use build.mjs [--check]",
);
assert.equal(
  solc.version(),
  "0.8.26+commit.8a97fa7a.Emscripten.clang",
  "Install the pinned solc 0.8.26 package",
);

const targets = {
  ethereum: [
    [
      "@layerzerolabs/oft-upgradeable-evm-contracts/contracts/extended/OFTLockUnlockExtendedRBACUpgradeable.sol",
      "OFTLockUnlockExtendedRBACUpgradeable",
    ],
    [
      "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol",
      "TransparentUpgradeableProxy",
    ],
    ["@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol", "ProxyAdmin"],
  ],
  monad: [
    ["contracts/USPCMonad.sol", "USPCMonad"],
    [
      "@layerzerolabs/oft-upgradeable-evm-contracts/contracts/extended/OFTBurnMintExtendedRBACUpgradeable.sol",
      "OFTBurnMintExtendedRBACUpgradeable",
    ],
    [
      "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol",
      "TransparentUpgradeableProxy",
    ],
    ["@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol", "ProxyAdmin"],
  ],
};

const readJson = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const sourceHashes = readJson("source-hashes.json");
const layouts = readJson("bytecode-layout.json");
let checked = 0;

for (const [chain, contracts] of Object.entries(targets)) {
  const original = readJson(`compiler-inputs/${chain}.json`);
  for (const [path, source] of Object.entries(original.sources)) {
    const content = readFileSync(join(root, "sources", path), "utf8");
    assert.equal(
      content,
      source.content,
      `${path}: readable source differs from compiler input`,
    );
    assert.equal(
      createHash("sha256").update(content).digest("hex"),
      sourceHashes[path]?.sha256,
      `${path}: source differs from released snapshot`,
    );
  }

  // Request layout information without changing code-generation settings.
  const input = structuredClone(original);
  input.settings.outputSelection["*"]["*"].push(
    "evm.bytecode.linkReferences",
    "evm.deployedBytecode.immutableReferences",
    "evm.deployedBytecode.linkReferences",
  );
  console.log(
    `Compiling ${chain} (${Object.keys(input.sources).length} embedded sources)…`,
  );
  // No import callback: a missing source fails instead of consulting node_modules.
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = (output.errors ?? []).filter(
    (error) => error.severity === "error",
  );
  assert.equal(
    errors.length,
    0,
    errors.map((error) => error.formattedMessage).join("\n"),
  );

  for (const [sourceName, contractName] of contracts) {
    const contract = output.contracts?.[sourceName]?.[contractName];
    assert(contract?.evm?.bytecode?.object, `Missing ${chain}/${contractName}`);
    const artifact = {
      contractName,
      sourceName,
      compiler: solc.version(),
      settings: original.settings,
      abi: contract.abi,
      bytecode: `0x${contract.evm.bytecode.object}`,
      deployedBytecode: `0x${contract.evm.deployedBytecode.object}`,
      metadata: JSON.parse(contract.metadata),
      storageLayout: contract.storageLayout,
    };
    assert.deepEqual(
      artifact,
      readJson(`artifacts/${chain}/${contractName}.json`),
      `${chain}/${contractName}: build differs from reference artifact`,
    );
    const layout = {
      immutableReferences:
        contract.evm.deployedBytecode.immutableReferences ?? {},
      bytecodeLinkReferences: contract.evm.bytecode.linkReferences ?? {},
      deployedBytecodeLinkReferences:
        contract.evm.deployedBytecode.linkReferences ?? {},
      creationBytecodeBytes: contract.evm.bytecode.object.length / 2,
      deployedBytecodeBytes: contract.evm.deployedBytecode.object.length / 2,
    };
    assert.deepEqual(
      layout,
      layouts[chain][contractName],
      `${chain}/${contractName}: bytecode layout differs`,
    );

    if (!checkOnly) {
      const path = join(root, "build", chain, `${contractName}.json`);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, `${JSON.stringify(artifact, null, 2)}\n`);
    }
    checked++;
    console.log(
      `  ${contractName}: ABI, creation/runtime templates, metadata and storage layout match`,
    );
  }
}

console.log(
  `${checked} EVM contract artifacts reproduced exactly.${checkOnly ? " No build files written." : " Outputs: evm/build/"}`,
);
