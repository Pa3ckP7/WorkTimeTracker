import { copyFile, mkdir, access } from 'node:fs/promises'
import { constants } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')
const require = createRequire(import.meta.url)

const target = resolve(rootDir, 'public/assets/sql-wasm.wasm')

async function findSqlWasmPath() {
  try {
    const resolved = require.resolve('sql.js/dist/sql-wasm.wasm', { paths: [rootDir] })
    await access(resolved, constants.R_OK)
    return resolved
  } catch {
    // fallback paths below
  }

  const directPath = resolve(rootDir, 'node_modules/sql.js/dist/sql-wasm.wasm')
  try {
    await access(directPath, constants.R_OK)
    return directPath
  } catch {
    // Fallback to pnpm isolated store layout
  }

  const { readdir } = await import('node:fs/promises')
  const pnpmDir = resolve(rootDir, 'node_modules/.pnpm')
  const entries = await readdir(pnpmDir, { withFileTypes: true })
  const sqlJsPkg = entries.find((entry) => entry.isDirectory() && entry.name.startsWith('sql.js@'))

  if (!sqlJsPkg) {
    throw new Error('Could not find sql.js package in node_modules/.pnpm')
  }

  const pnpmPath = resolve(
    pnpmDir,
    sqlJsPkg.name,
    'node_modules/sql.js/dist/sql-wasm.wasm'
  )

  await access(pnpmPath, constants.R_OK)
  return pnpmPath
}

try {
  const source = await findSqlWasmPath()
  await access(source, constants.R_OK)
  await mkdir(dirname(target), { recursive: true })
  await copyFile(source, target)
  console.log('[copy:sql-wasm] Copied sql-wasm.wasm to public/assets')
} catch (error) {
  console.error('[copy:sql-wasm] Failed to copy sql-wasm.wasm:', error)
  process.exitCode = 1
}
