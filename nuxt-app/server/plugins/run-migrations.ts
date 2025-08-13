import { join } from 'node:path'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { sqlite } from '../utils/db'

export default defineNitroPlugin(() => {
  const migrationsDir = join(process.cwd(), 'server/db/migrations')
  try {
    if (existsSync(migrationsDir)) {
      const files = readdirSync(migrationsDir).sort()
      for (const file of files) {
        const sql = readFileSync(join(migrationsDir, file), 'utf-8')
        sqlite.exec(sql)
      }
    }
  } catch (err) {
    console.error('migration error', err)
  }
})
