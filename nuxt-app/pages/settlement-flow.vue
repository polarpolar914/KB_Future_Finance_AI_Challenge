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

const { data: statData, refresh: refreshStats } = await useFetch('/api/stats', {
  params: { keys: 'escrow_balance,vault_balance,pool_balance,seller_balance' },
})
const balances = reactive({
  escrow: Number(statData.value?.escrow_balance || 0),
  vault: Number(statData.value?.vault_balance || 0),
  pool: Number(statData.value?.pool_balance || 0),
  seller: Number(statData.value?.seller_balance || 0),
})
interface Log { id: number; from: string; to: string; amount: number }
const { data: logData, refresh: refreshLogs } = await useFetch('/api/settlement/logs')
const parse = (l: any): Log => {
  const parts = l.message.split(' ')
  return { id: l.id, from: parts[0], to: parts[2], amount: Number(parts[3]) }
}
const logs = ref((logData.value || []).map(parse))

async function sync() {
  await refreshStats()
  await refreshLogs()
  balances.escrow = Number(statData.value?.escrow_balance || 0)
  balances.vault = Number(statData.value?.vault_balance || 0)
  balances.pool = Number(statData.value?.pool_balance || 0)
  balances.seller = Number(statData.value?.seller_balance || 0)
  logs.value = (logData.value || []).map(parse)
}

async function transfer(from: string, to: string, amount: number) {
  await $fetch('/api/settlement/transfer', { method: 'POST', body: { from, to, amount } })
  await sync()
}

function paySeller() {
  transfer('escrow', 'seller', 1000)
}

function claimVault() {
  transfer('vault', 'escrow', 500)
}

function claimPool() {
  transfer('pool', 'escrow', 500)
}
</script>
