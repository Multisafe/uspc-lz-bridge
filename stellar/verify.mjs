import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const provenance = JSON.parse(readFileSync(path.join(root, 'provenance.json'), 'utf8'))
assert(process.argv.slice(2).every(arg => arg === '--rebuilt'), 'Only --rebuilt is supported')
const registry = JSON.parse(readFileSync(path.join(root, 'registry-license-inventory.json'), 'utf8'))
assert.equal(registry.packageCount, registry.packages.length, 'Registry package count mismatch')
const notices = registry.packages.flatMap(pkg => {
  assert.equal(pkg.gaps.length, 0, `${pkg.name}: unresolved notice gap`)
  return pkg.notices.map(notice => {
    assert(notice.path.startsWith('stellar/'), 'Notice path must start with stellar/')
    return { ...notice, path: notice.path.slice('stellar/'.length) }
  })
})
const records = [...provenance.sourceFiles, ...provenance.artifacts, ...notices]
for (const record of records) {
  const file = path.resolve(root, record.path)
  assert(file.startsWith(root + path.sep), 'File must remain within the export')
  const contents = readFileSync(file)
  assert.equal(contents.length, record.bytes, `${record.path}: byte length mismatch`)
  assert.equal(createHash('sha256').update(contents).digest('hex'), record.sha256, `${record.path}: SHA-256 mismatch`)
}
console.log(`Verified ${provenance.sourceFiles.length} source/build files, ${provenance.artifacts.length} exact WASM artifacts, and ${notices.length} registry notice files for ${registry.packages.length} locked packages.`)
if (process.argv.includes('--rebuilt')) {
  for (const [artifact, output] of [
    ['artifacts/oft.wasm', 'contracts/oft/target/wasm32v1-none/release/oft.wasm'],
    ['artifacts/sac_manager.wasm', 'contracts/sac-manager/target/wasm32v1-none/release/sac_manager.optimized.wasm'],
  ]) {
    const expected = provenance.artifacts.find(record => record.path === artifact)
    const hash = createHash('sha256').update(readFileSync(path.join(root, output))).digest('hex')
    assert.equal(hash, expected.sha256, `${output}: build does not reproduce deployed WASM`)
    console.log(`Reproduced ${artifact}: ${hash}`)
  }
}
