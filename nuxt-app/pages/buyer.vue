<template>
  <section class="container-std section">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Buyer Dashboard</h2>
      </div>

      <h3 class="font-medium mb-2">Active Deals</h3>
      <div class="table-wrap mb-6">
        <table class="table">
          <thead class="thead">
            <tr>
              <th class="th">Deal</th>
              <th class="th">Status</th>
              <th class="th">Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr v-for="deal in deals" :key="deal.id" class="tr">
              <td class="td">Deal #{{ deal.id }}</td>
              <td class="td"><span class="badge badge-brand">{{ deal.status }}</span></td>
              <td class="td">{{ deal.amount }} {{ deal.currency }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="font-medium mb-2">Settlement Summary</h3>
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="rounded-2xl p-4 bg-slate-50 ring-1 ring-slate-200">
          <div class="text-xs text-slate-500">Escrow Balance</div>
          <div class="text-lg font-semibold">{{ escrowBalance }} USD</div>
        </div>
        <div class="rounded-2xl p-4 bg-slate-50 ring-1 ring-slate-200">
          <div class="text-xs text-slate-500">Claims Filed</div>
          <div class="text-lg font-semibold">{{ claims }}</div>
        </div>
      </div>

      <button class="btn btn-primary" @click="requestClaim">Request Claim</button>
      <p v-if="claimRequested" class="mt-4 badge badge-ok">Claim requested.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const { data: dealData } = await useFetch('/api/deals')
const deals = computed(() => dealData.value || [])
const { data: statsData, refresh: refreshStats } = await useFetch('/api/stats', {
  params: { keys: 'escrow_balance,claims' },
})
const escrowBalance = computed(() => Number(statsData.value?.escrow_balance || 0))
const claims = computed(() => Number(statsData.value?.claims || 0))
const claimRequested = ref(false)

async function requestClaim() {
  await $fetch('/api/buyer/claim', { method: 'POST' })
  claimRequested.value = true
  await refreshStats()
}
</script>
