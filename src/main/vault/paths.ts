import { homedir } from 'node:os'
import { join } from 'node:path'

export function resolveVaultDir(): string {
  return process.env.SAGE_VAULT_DIR ?? join(homedir(), 'SageVault')
}
