import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join, relative, extname } from 'node:path'
import { scanSource, isExemptPath } from './lintTokens.mjs'

const ROOT = 'src/renderer'
const EXTENSIONS = new Set(['.ts', '.tsx'])

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walk(full, files)
    } else if (EXTENSIONS.has(extname(entry))) {
      files.push(full)
    }
  }
  return files
}

const files = walk(ROOT)
let violationCount = 0

for (const file of files) {
  const rel = relative(process.cwd(), file)
  if (isExemptPath(rel)) continue

  const content = readFileSync(file, 'utf8')
  for (const v of scanSource(content)) {
    violationCount++
    console.error(`${rel}:${v.line}:${v.column} raw ${v.kind} literal "${v.match}" — reference a token from theme/tokens.ts instead`)
  }
}

if (violationCount > 0) {
  console.error(`\nlint:tokens failed — ${violationCount} raw literal(s) found outside theme/tokens.ts`)
  process.exit(1)
}

console.log(`lint:tokens passed — scanned ${files.length} file(s) under ${ROOT}, no raw hex/px literals outside theme/tokens.ts`)
