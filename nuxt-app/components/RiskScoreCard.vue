<template>
  <div class="card p-4">
    <h3 class="font-semibold mb-2">Risk Score</h3>
    <p class="text-3xl font-bold">{{ score.toFixed(2) }}</p>
    <ul
      v-if="subScores"
      class="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm"
    >
      <li
        v-for="(value, key) in subScores"
        :key="key"
        class="flex justify-between"
      >
        <span class="capitalize">{{ formatKey(key) }}</span>
        <span>{{ value.toFixed(2) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ dealId: number }>()
const { data } = await useFetch(`/api/deals/${props.dealId}`)
const score = computed(() => data.value?.riskScore ?? 0)
const subScores = computed(() => {
  const s = data.value?.riskSubScores
  if (!s) return null
  return {
    trader_history: s.trader_history,
    route_risk: s.route_risk,
    commodity_volatility: s.commodity_volatility,
    geopolitical_index: s.geopolitical_index,
    weather_forecast: s.weather_forecast,
    network_health: s.network_health,
  }
})
const formatKey = (key: string) => key.replace(/_/g, ' ')
</script>