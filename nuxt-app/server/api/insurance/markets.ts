import { eventHandler } from 'h3'
import { db, insuranceMarkets } from '~/server/utils/db'
import { asc } from 'drizzle-orm'

export default eventHandler(async () => {
  return db.select().from(insuranceMarkets).orderBy(asc(insuranceMarkets.id))
})
