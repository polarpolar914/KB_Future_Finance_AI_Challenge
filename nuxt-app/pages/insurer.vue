<template>
  <section class="container-std section">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Insurer Dashboard</h2>
      </div>
      <p class="mb-2">Pool Balance: {{ poolBalance }} USD</p>
      <div class="mb-4 max-w-xs">
        <label class="block text-sm font-medium mb-1">Coverage %</label>
        <input v-model.number="coverage" type="number" class="input" />
      </div>
      <h3 class="font-medium mb-2">Payout History</h3>
      <div class="table-wrap">
        <table class="table">
          <thead class="thead">
            <tr>
              <th class="th">Deal</th>
              <th class="th">Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr v-for="p in payouts" :key="p.id" class="tr">
              <td class="td">{{ p.deal }}</td>
              <td class="td">{{ p.amount }} USD</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const poolBalance = ref(30000)
const coverage = ref(80)
const payouts = ref([
  { id: 1, amount: 5000, deal: 'Deal A' }
])
</script>
