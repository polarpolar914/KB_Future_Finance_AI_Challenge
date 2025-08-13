import { join } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import { sqlite, db, users, roles, userRoles } from '../utils/db'
import { eq } from 'drizzle-orm'

export default defineNitroPlugin(() => {
  try {
    // If the stats table has no rows we assume the database is empty and load
    // the seed data to provide a sensible starting point for the demo.
    const row = sqlite.prepare('SELECT COUNT(*) as c FROM stats').get()
    if (!row || row.c === 0) {
      const seedPath = join(process.cwd(), 'data', 'seed.sql')
      if (existsSync(seedPath)) {
        const sql = readFileSync(seedPath, 'utf-8')
        sqlite.exec(sql)
      }
    }

    // Ensure demo users exist for quick testing of each role. If a user is
    // missing we create it along with the corresponding role and mapping.
    const defaults: Record<string, { password: string; name: string; role: string }> = {
      'buyer@demo.com': {
        password: 'passtest1',
        name: 'Demo Buyer',
        role: 'buyer',
      },
      'seller@demo.com': {
        password: 'passtest1',
        name: 'Demo Seller',
        role: 'seller',
      },
      'guarantor@demo.com': {
        password: 'passtest1',
        name: 'Demo Guarantor',
        role: 'guarantor',
      },
      'insurer@demo.com': {
        password: 'passtest1',
        name: 'Demo Insurer',
        role: 'insurer',
      },
      'admin@demo.com': {
        password: 'passtest1',
        name: 'Demo Admin',
        role: 'admin',
      },
    }

    for (const [email, info] of Object.entries(defaults)) {
      const existing = db.select().from(users).where(eq(users.email, email)).get()
      if (!existing) {
        const res = db
          .insert(users)
          .values({
            email,
            password: info.password,
            name: info.name,
            created_at: new Date().toISOString(),
          })
          .run()
        const userId = res.lastInsertRowid as number
        let roleRow = db.select().from(roles).where(eq(roles.code, info.role)).get()
        if (!roleRow) {
          const roleRes = db.insert(roles).values({ code: info.role }).run()
          roleRow = { id: roleRes.lastInsertRowid as number, code: info.role }
        }
        db.insert(userRoles).values({ user_id: userId, role_id: roleRow.id }).run()
      }
    }
  } catch (err) {
    console.error('seed error', err)
  }
})
