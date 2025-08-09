<template>
  <section class="container-std section">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Settlement Flow</h2>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div class="rounded-2xl p-4 bg-slate-50 ring-1 ring-slate-200">
          <div class="text-xs text-slate-500">Escrow</div>
          <div class="text-lg font-semibold">{{ balances.escrow }} USD</div>
        </div>
        <div class="rounded-2xl p-4 bg-slate-50 ring-1 ring-slate-200">
          <div class="text-xs text-slate-500">Vault</div>
          <div class="text-lg font-semibold">{{ balances.vault }} USD</div>
        </div>
        <div class="rounded-2xl p-4 bg-slate-50 ring-1 ring-slate-200">
          <div class="text-xs text-slate-500">Pool</div>
          <div class="text-lg font-semibold">{{ balances.pool }} USD</div>
        </div>
        <div class="rounded-2xl p-4 bg-slate-50 ring-1 ring-slate-200">
          <div class="text-xs text-slate-500">Seller</div>
          <div class="text-lg font-semibold">{{ balances.seller }} USD</div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 mb-6">
        <button class="btn btn-primary" @click="paySeller">Pay Seller 1000</button>
        <button class="btn btn-secondary" @click="claimVault">Claim Vault 500</button>
        <button class="btn btn-secondary" @click="claimPool">Claim Pool 500</button>
      </div>
      <h3 class="font-semibold mb-2">Flow Log</h3>
      <div class="table-wrap">
        <table class="table">
          <thead class="thead">
            <tr>
              <th class="th">From</th>
              <th class="th">To</th>
              <th class="th">Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr v-for="(l, i) in logs" :key="i" class="tr">
              <td class="td">{{ l.from }}</td>
              <td class="td">{{ l.to }}</td>
              <td class="td">{{ l.amount }} USD</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const balances = reactive({ escrow: 10000, vault: 5000, pool: 8000, seller: 0 })
interface Log { from: string; to: string; amount: number }
const logs = ref<Log[]>([])

function paySeller() {
  if (balances.escrow >= 1000) {
    balances.escrow -= 1000
    balances.seller += 1000
    logs.value.push({ from: 'Escrow', to: 'Seller', amount: 1000 })
  }
}

function claimVault() {
  if (balances.vault >= 500) {
    balances.vault -= 500
    balances.escrow += 500
    logs.value.push({ from: 'Vault', to: 'Escrow', amount: 500 })
  }
}

function claimPool() {
  if (balances.pool >= 500) {
    balances.pool -= 500
    balances.escrow += 500
    logs.value.push({ from: 'Pool', to: 'Escrow', amount: 500 })
  }
}
</script>
