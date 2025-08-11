import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core'
import { join } from 'node:path'

const sqlite = new Database(join(process.cwd(), 'data', 'app.db'))
export const db = drizzle(sqlite)

export const insuranceMarkets = sqliteTable('insurance_markets', {
  id: integer('id').primaryKey(),
  category: text('category'),
  metric: text('metric'),
  value_num: real('value_num'),
  currency: text('currency'),
  base_year: integer('base_year'),
  notes: text('notes'),
  source: text('source'),
})

export const deals = sqliteTable('deals', {
  id: integer('id').primaryKey(),
  amount: real('amount').notNull(),
  currency: text('currency').notNull(),
  incoterms: text('incoterms'),
  deposit_pct: real('deposit_pct'),
  seller: text('seller'),
  guarantor: text('guarantor'),
  insurer: text('insurer'),
  status: text('status'),
  contract_address: text('contract_address'),
  contract_hash: text('contract_hash'),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
})

export const dealMilestones = sqliteTable('deal_milestones', {
  id: integer('id').primaryKey(),
  deal_id: integer('deal_id').references(() => deals.id),
  ord: integer('ord'),
  description: text('description'),
  status: text('status'),
  confirmed_at: text('confirmed_at'),
})

export const eventLogs = sqliteTable('event_logs', {
  id: integer('id').primaryKey(),
  deal_id: integer('deal_id'),
  source: text('source'),
  event_type: text('event_type'),
  message: text('message'),
  tx_hash: text('tx_hash'),
  created_at: text('created_at'),
})

export const riskScores = sqliteTable('risk_scores', {
  id: integer('id').primaryKey(),
  deal_id: integer('deal_id').references(() => deals.id),
  trader_history: real('trader_history'),
  route_risk: real('route_risk'),
  commodity_volatility: real('commodity_volatility'),
  geopolitical_index: real('geopolitical_index'),
  weather_forecast: real('weather_forecast'),
  network_health: real('network_health'),
  ml_score: real('ml_score'),
  computed_at: text('computed_at'),
})

export const stats = sqliteTable('stats', {
  key: text('key').primaryKey(),
  value: text('value'),
})

export const payoutRequests = sqliteTable('payout_requests', {
  id: integer('id').primaryKey(),
  deal: text('deal'),
  amount: real('amount'),
  status: text('status'),
})

export const documents = sqliteTable('documents', {
  id: integer('id').primaryKey(),
  name: text('name'),
  path: text('path'),
  status: text('status'),
})

export const pricing = sqliteTable('pricing', {
  id: integer('id').primaryKey(),
  deal_id: integer('deal_id').references(() => deals.id),
  base_rate: real('base_rate'),
  risk_score: real('risk_score'),
  market_adjustment: real('market_adjustment'),
  premium_rate: real('premium_rate'),
  premium_amount: real('premium_amount'),
})

export const claimNfts = sqliteTable('claim_nfts', {
  id: integer('id').primaryKey(),
  deal_id: integer('deal_id').references(() => deals.id),
  token_id: text('token_id'),
  metadata: text('metadata'),
})
