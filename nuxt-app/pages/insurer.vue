<template>
  <section class="container-std section">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Insurer Dashboard</h2>
      </div>
      <p class="mb-2">Pool Balance: {{ poolBalance }} USD</p>
      <div class="mb-4 max-w-xs">
        <label class="block text-sm font-medium mb-1">Coverage %</label>
        <div class="flex gap-2">
          <input v-model.number="coverage" type="number" class="input flex-1" />
          <button class="btn btn-primary" @click="saveCoverage">Adjust</button>
        </div>
      </div>
      <h3 class="font-medium mb-2">Payout History</h3>
      <div class="table-wrap">
        <table class="table">
          <thead class="thead">
            <tr>
              <th class="th">Deal</th>
              <th class="th">Amount</th>
              <th class="th"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr v-for="p in payouts" :key="p.id" class="tr">
              <td class="td">{{ p.deal }}</td>
              <td class="td">{{ p.amount }} USD</td>
              <td class="td text-right">
                <button class="btn btn-secondary btn-sm" @click="approve(p.id)" :disabled="approved.includes(p.id)">Approve</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="approved.length" class="badge badge-ok mt-2">Approved: {{ approved.join(', ') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const { data: statsData } = await useFetch('/api/stats', { params: { keys: 'pool_balance' } })
const poolBalance = computed(() => Number(statsData.value?.pool_balance || 0))
const coverage = ref(80)
async function saveCoverage() {
  await $fetch('/api/insurer/coverage', { method: 'POST', body: { coverage: coverage.value } })
}

const { data: payoutData, refresh: refreshPayouts } = await useFetch('/api/insurer/payouts')
const payouts = computed(() => (payoutData.value || []).map((p: any) => {
  const parts = p.message.split(' ')
  return { id: p.id, deal: parts[0] || p.deal, amount: Number(parts[2] || p.amount) }
}))
const approved = ref<number[]>([])

async function approve(id: number) {
  if (approved.value.includes(id)) return
  await $fetch(`/api/insurer/payouts/${id}/approve`, { method: 'POST' })
  approved.value.push(id)
  await refreshPayouts()
}
</script>
