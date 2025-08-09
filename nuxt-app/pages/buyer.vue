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
              <td class="td">{{ deal.title }}</td>
              <td class="td"><span class="badge badge-brand">{{ deal.status }}</span></td>
              <td class="td">{{ deal.amount }} USD</td>
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
import { ref } from 'vue'

const deals = ref([
  { id: 1, title: 'Deal A', status: 'FUNDED', amount: 10000 }
])
const escrowBalance = ref(5000)
const claims = ref(0)
const claimRequested = ref(false)

function requestClaim() {
  claimRequested.value = true
  claims.value++
}
</script>
