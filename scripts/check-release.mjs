import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const indexName = "SHA256SUMS";
const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  "target",
  "coverage",
]);
const generatedDirectories = new Set(["evm/build", "stellar/build"]);

async function collect(directory) {
  const files = [];
  for (const name of (await readdir(directory)).sort()) {
    const absolute = join(directory, name);
    const path = relative(root, absolute).replaceAll("\\", "/");
    if (name === ".DS_Store" || path === indexName) continue;
    // Local environment configuration is outside the publishable file list.
    if (name === ".env" || name.startsWith(".env.")) continue;
    if (ignoredDirectories.has(name) || generatedDirectories.has(path))
      continue;
    assert(
      !/(^|\/)\.secrets(\/|$)|\.(pem|key|log)$/.test(path),
      `Private or temporary file in release tree: ${path}`,
    );
    const info = await lstat(absolute);
    assert(
      !info.isSymbolicLink(),
      `Release files must not be symlinks: ${path}`,
    );
    if (info.isDirectory()) files.push(...(await collect(absolute)));
    else if (info.isFile()) files.push(path);
    else assert.fail(`Unsupported file type: ${path}`);
  }
  return files;
}

const files = (await collect(root)).sort();
const actual = new Map();
for (const path of files) {
  const bytes = await readFile(join(root, path));
  const text = bytes.toString("utf8");
  assert(
    !/\/Users\/[^/]+\/|\/private\/tmp\//.test(text),
    `Machine-specific path in ${path}`,
  );
  if (!path.endsWith(".wasm")) {
    assert(
      !/https?:\/\/[^\s"']*(?:alchemy\.com\/v2\/|infura\.io\/v3\/)[A-Za-z0-9_-]{12,}/.test(
        text,
      ),
      `Credential-bearing RPC URL in ${path}`,
    );
    assert(
      !/eyJhbGci[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(text),
      `JWT literal in ${path}`,
    );
    assert(
      !/(?:privateKey|secretKey|PRIVATE_KEY|SECRET_KEY)["']?\s*[:=]\s*["'](?:0x[0-9a-fA-F]{64}|S[A-Z2-7]{55})["']/.test(
        text,
      ),
      `Secret literal in ${path}`,
    );
  }
  actual.set(path, createHash("sha256").update(bytes).digest("hex"));
}

if (process.argv.includes("--write")) {
  await writeFile(
    join(root, indexName),
    [...actual].map(([path, hash]) => `${hash}  ${path}\n`).join(""),
  );
  console.log(`Recorded ${actual.size} public release files in ${indexName}.`);
} else {
  const expected = new Map();
  for (const line of (await readFile(join(root, indexName), "utf8"))
    .trim()
    .split("\n")) {
    const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
    assert(match, `Invalid ${indexName} entry`);
    const [, hash, path] = match;
    assert(!expected.has(path), `Duplicate release entry: ${path}`);
    expected.set(path, hash);
  }
  assert.deepEqual(
    [...actual.keys()],
    [...expected.keys()],
    "Release file list differs from SHA256SUMS",
  );
  for (const [path, hash] of actual)
    assert.equal(
      hash,
      expected.get(path),
      `Release checksum mismatch: ${path}`,
    );
  console.log(
    `Verified ${actual.size} public release files and credential/path checks.`,
  );
}
