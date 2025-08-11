<template>
  <section class="container-std section">
    <div class="card max-w-2xl mx-auto">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Guarantor Dashboard</h2>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="rounded-2xl p-4 bg-slate-50 ring-1 ring-slate-200">
          <div class="text-xs text-slate-500">Guarantee Limit</div>
          <div class="text-lg font-semibold">{{ limit }} USD</div>
        </div>
        <div class="rounded-2xl p-4 bg-slate-50 ring-1 ring-slate-200">
          <div class="text-xs text-slate-500">Vault Balance</div>
          <div class="text-lg font-semibold">{{ balance }} USD</div>
        </div>
      </div>

      <h3 class="font-medium mb-2">Payout Requests</h3>
      <div class="table-wrap mb-4">
        <table class="table">
          <thead class="thead">
            <tr>
              <th class="th">Deal</th>
              <th class="th">Amount</th>
              <th class="th"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr v-for="req in requests" :key="req.id" class="tr">
              <td class="td">{{ req.deal }}</td>
              <td class="td">{{ req.amount }} USD</td>
              <td class="td text-right">
                <button class="btn btn-primary px-3 py-2 text-xs" @click="approve(req.id)" :disabled="approvedIds.includes(req.id)">Approve</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="approvedIds.length" class="badge badge-ok">Approved: {{ approvedIds.join(', ') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const { data: statsData, refresh: refreshStats } = await useFetch('/api/stats', {
  params: { keys: 'guarantee_limit,guarantee_balance' },
})
const limit = computed(() => Number(statsData.value?.guarantee_limit || 0))
const balance = computed(() => Number(statsData.value?.guarantee_balance || 0))

const { data: reqData, refresh: refreshReqs } = await useFetch('/api/guarantor/requests')
const requests = computed(() => reqData.value || [])
const approvedIds = ref<number[]>([])

async function approve(id: number) {
  if (approvedIds.value.includes(id)) return
  await $fetch('/api/guarantor/approve', { method: 'POST', body: { id } })
  approvedIds.value.push(id)
  await Promise.all([refreshReqs(), refreshStats()])
}
</script>
