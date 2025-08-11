<template>
  <section class="container-std section">
    <div class="card max-w-xl mx-auto">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Risk Analysis & Premium</h2>
      </div>
      <form @submit.prevent="calculate" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Counterparty</label>
          <input v-model="input.counterparty" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Goods</label>
          <input v-model="input.goods" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Route</label>
          <input v-model="input.route" type="text" class="input" />
        </div>
        <button type="submit" class="btn btn-primary">Analyze</button>
      </form>
      <div v-if="score" class="mt-6">
        <div class="mb-4">
          <div class="h-2 bg-slate-200 rounded">
            <div class="h-full bg-brand-500 rounded" :style="{ width: score + '%' }"></div>
          </div>
        </div>
        <div class="table-wrap mb-4">
          <table class="table">
            <tbody class="divide-y divide-slate-200 bg-white">
              <tr class="tr">
                <th class="th text-left">Risk Score</th>
                <td class="td">{{ score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <PremiumBreakdown v-if="breakdown" :data="breakdown" class="mb-4" />
        <div class="table-wrap">
          <table class="table">
            <thead class="thead">
              <tr>
                <th class="th">Factor</th>
                <th class="th">Value</th>
                <th class="th">Weight</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              <tr v-for="f in factors" :key="f.label" class="tr">
                <td class="td">{{ f.label }}</td>
                <td class="td">{{ f.value }}</td>
                <td class="td">{{ (f.weight * 100).toFixed(0) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import PremiumBreakdown from "~/components/PremiumBreakdown.vue";

const input = reactive({ counterparty: '', goods: '', route: '' })
const score = ref(0)
const breakdown = ref<null | {
  base_rate: number
  ml_score: number
  market_adjustment: number
  base_amount: number
  premium_rate: number
  premium_amount: number
}>(null)
const baseRate = 0.02
const marketAdjustment = 1.05
const baseAmount = 1000
const factors = computed(() => [
  { label: 'Counterparty', value: input.counterparty, weight: 0.5 },
  { label: 'Goods', value: input.goods, weight: 0.3 },
  { label: 'Route', value: input.route, weight: 0.2 }
])

async function calculate() {
  const res = await $fetch<{ score: number }>('/api/risk/score', {
    method: 'POST',
    body: {
      features: {
        counterparty: input.counterparty,
        goods: input.goods,
        route: input.route,
      },
    },
  })
  score.value = Math.min(100, Math.round(res.score || 0))
  const quote = await $fetch<{ premium_rate: number; premium_amount: number }>(
    '/api/pricing/quote',
    {
      method: 'POST',
      body: {
        dealId: 1,
        baseRate,
        mlScore: score.value / 100,
        marketAdjustment,
        baseAmount,
      },
    },
  )
  breakdown.value = {
    base_rate: baseRate,
    ml_score: score.value / 100,
    market_adjustment: marketAdjustment,
    base_amount: baseAmount,
    premium_rate: quote.premium_rate,
    premium_amount: quote.premium_amount,
  }
}
</script>
