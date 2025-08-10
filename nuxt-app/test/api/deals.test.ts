import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, rmSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { sql } from 'drizzle-orm'

let getDeals: any
let getStats: any
let db: any
let dealsTable: any
let statsTable: any
let tmpDir: string
let originalCwd: string

beforeAll(async () => {
  // Stub Nuxt helpers
  // @ts-ignore
  globalThis.defineEventHandler = (fn: any) => fn
  // @ts-ignore
  globalThis.getQuery = (event: any) => {
    const url = event.node?.req.url || event.req?.url || ''
    const query = url.split('?')[1] || ''
    return Object.fromEntries(new URLSearchParams(query).entries())
  }

  originalCwd = process.cwd()
  tmpDir = mkdtempSync(join(tmpdir(), 'nuxt-test-'))
  mkdirSync(join(tmpDir, 'data'))
  process.chdir(tmpDir)

  const dbModule = await import('../../server/utils/db')
  db = dbModule.db
  dealsTable = dbModule.deals
  statsTable = dbModule.stats

  getDeals = (await import('../../server/api/deals/index.get')).default
  getStats = (await import('../../server/api/stats.get')).default

  await db.run(sql.raw(`CREATE TABLE deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    incoterms TEXT,
    deposit_pct REAL,
    seller TEXT,
    guarantor TEXT,
    insurer TEXT,
    status TEXT,
    contract_address TEXT,
    contract_hash TEXT,
    created_at TEXT,
    updated_at TEXT
  )`))

  await db.run(sql.raw(`CREATE TABLE stats (
    key TEXT PRIMARY KEY,
    value TEXT
  )`))

  await db.insert(dealsTable).values({ amount: 1000, currency: 'USD', status: 'DEPLOYED' }).run()
  await db.insert(statsTable).values({ key: 'escrow_balance', value: '1000' }).run()
})

afterAll(() => {
  process.chdir(originalCwd)
  rmSync(tmpDir, { recursive: true, force: true })
})

describe('GET /api/deals', () => {
  it('returns list of deals', async () => {
    const result = await getDeals({} as any)
    expect(Array.isArray(result)).toBe(true)
    expect(result[0]).toMatchObject({ amount: 1000, currency: 'USD' })
  })
})

describe('GET /api/stats', () => {
  it('returns stats object', async () => {
    const event = { node: { req: { url: '/api/stats' } } } as any
    const result = await getStats(event)
    expect(result).toMatchObject({ escrow_balance: '1000' })
  })
})
