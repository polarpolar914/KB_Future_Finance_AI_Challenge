<template>
  <section class="container-std section space-y-6">
    <div class="card">
      <div class="card-header flex items-center justify-between">
        <h2 class="text-xl font-semibold">Insurance Market Dashboard</h2>
        <WarRiskTicker />
      </div>
      <InsuranceTable :markets="markets" />
      <ClientOnly>
        <canvas ref="canvasEl" class="mt-6"></canvas>
      </ClientOnly>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHead } from '#app'
import InsuranceTable from '~/components/InsuranceTable.vue'
import WarRiskTicker from '~/components/WarRiskTicker.vue'

const { data } = await useFetch('/api/insurance/markets')
const markets = ref(data.value || [])
const canvasEl = ref<HTMLCanvasElement | null>(null)

useHead({
  script: [{ src: 'https://cdn.jsdelivr.net/npm/chart.js' }]
})

onMounted(() => {
  const Chart = (window as any).Chart
  if (canvasEl.value && markets.value.length && Chart) {
    const ctx = canvasEl.value.getContext('2d')!
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: markets.value.map((m: any) => m.category),
        datasets: [{
          data: markets.value.map((m: any) => m.value_num),
          backgroundColor: '#3b82f6'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    })
  }
})
</script>

