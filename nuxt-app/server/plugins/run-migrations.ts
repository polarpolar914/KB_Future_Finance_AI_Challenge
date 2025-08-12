import { join } from 'node:path'
import { readdirSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import Database from 'better-sqlite3'

export default defineNitroPlugin(() => {
  const dataDir = join(process.cwd(), 'data')
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
  const dbPath = join(dataDir, 'app.db')
  const db = new Database(dbPath)
  const migrationsDir = join(process.cwd(), 'server/db/migrations')
  try {
    if (existsSync(migrationsDir)) {
      const files = readdirSync(migrationsDir).sort()
      for (const file of files) {
        const sql = readFileSync(join(migrationsDir, file), 'utf-8')
        db.exec(sql)
      }
    }
  } catch (err) {
    console.error('migration error', err)
  } finally {
    db.close()
  }
})
