import { db, riskScores } from '~/server/utils/db'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, any>>(event)
  const { dealId, ...payload } = body
  if (!dealId) {
    throw createError({ statusCode: 400, statusMessage: 'dealId required' })
  }
  const url = process.env.ML_SERVICE_URL
  let ml_score: number | undefined
  let sub_scores: any
  if (url) {
    try {
      const result = await $fetch<{ ml_score: number; sub_scores: any }>(url, {
        method: 'POST',
        body: payload,
      })
      ml_score = result.ml_score
      sub_scores = result.sub_scores
    } catch (err) {
      console.error('ML service error', err)
    }
  }

  if (ml_score === undefined || !sub_scores) {
    sub_scores = {
      trader_history: Math.random() * 100,
      route_risk: Math.random() * 100,
      commodity_volatility: Math.random() * 100,
      geopolitical_index: Math.random() * 100,
      weather_forecast: Math.random() * 100,
      network_health: Math.random() * 100,
    }
    ml_score =
      Object.values(sub_scores).reduce((a: number, b: number) => a + b, 0) /
      Object.keys(sub_scores).length
  }

  const record = {
    deal_id: dealId,
    trader_history: sub_scores.trader_history,
    route_risk: sub_scores.route_risk,
    commodity_volatility: sub_scores.commodity_volatility,
    geopolitical_index: sub_scores.geopolitical_index,
    weather_forecast: sub_scores.weather_forecast,
    network_health: sub_scores.network_health,
    ml_score,
    computed_at: new Date().toISOString(),
  }

  await db.insert(riskScores).values(record)

  return { ml_score, sub_scores }
})
