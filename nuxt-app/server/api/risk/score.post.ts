import { readBody, createError } from 'h3'
import { authGuard } from '../../utils/auth'
import { db, riskScores } from '../../utils/db'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['buyer', 'insurer'])
  const body = await readBody(event)
  const { deal_id, features } = body
  const url = process.env.ML_SERVICE_URL || 'http://localhost:3001/api/risk/score'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ features }),
  })

  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: 'ML service error' })
  }
  const data = await res.json()
  db.insert(riskScores)
    .values({ deal_id, ml_score: data.ml_score, computed_at: new Date().toISOString() })
    .run()
  return data
})
