<template>
  <div class="card p-4">
    <h3 class="font-semibold mb-2">Premium Breakdown</h3>
    <ClientOnly>
      <canvas ref="chartEl" class="mb-4"></canvas>
    </ClientOnly>
    <ul class="space-y-1">
      <li v-for="(item, idx) in breakdown" :key="idx" class="flex justify-between">
        <span>{{ item.label }}</span>
        <span>{{ item.amount }} {{ item.currency }}</span>
      </li>
    </ul>
    <div v-if="total" class="flex justify-between font-semibold mt-2 border-t pt-2">
      <span>Total</span>
      <span>{{ total }} {{ currency }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'

const props = defineProps<{ dealId: number }>()
const { data } = await useFetch(`/api/deals/${props.dealId}`)
const currency = computed(() => data.value?.deal.currency)
const breakdown = computed(() => {
  const p = data.value?.premium
  if (!p) return []
  return [
    { label: 'Base Rate', amount: p.base_rate, currency: currency.value },
    { label: 'Risk', amount: p.risk_score, currency: currency.value },
    { label: 'Market Adjustment', amount: p.market_adjustment, currency: currency.value },
    { label: 'Premium Rate', amount: p.premium_rate, currency: currency.value },
  ]
})
const total = computed(() => data.value?.premium?.premium_amount)

const chartEl = ref<HTMLCanvasElement | null>(null)
let chart: any

const chartData = computed(() => {
  const p = data.value?.premium
  return p ? [p.base_rate, p.risk_score, p.market_adjustment] : []
})

onMounted(async () => {
  const Chart = (await import('chart.js/auto')).default
  watch(
    chartData,
    (vals) => {
      if (!chart && chartEl.value && vals.length) {
        const ctx = chartEl.value.getContext('2d')!
        chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Base Rate', 'Risk', 'Market Adjustment'],
            datasets: [
              {
                data: vals,
                backgroundColor: ['#60a5fa', '#fbbf24', '#f87171'],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
          },
        })
      } else if (chart) {
        chart.data.datasets[0].data = vals
        chart.update()
      }
    },
    { immediate: true }
  )
})
</script>
