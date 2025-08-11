<template>
  <section class="container-std section">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Deal Tracker Dashboard</h2>
      </div>
      <div class="h-2 bg-slate-200 rounded mb-6">
        <div class="h-full bg-brand-500 rounded" :style="{ width: progressPercent }"></div>
      </div>
      <ul class="mb-6 space-y-2">
        <li v-for="status in statuses" :key="status.name" class="flex items-center gap-2">
          <span class="w-40 text-sm font-medium">{{ status.name }}</span>
          <span :class="['badge', status.time ? 'badge-ok' : (status.name === currentStatus ? 'badge-brand' : 'badge-warn')]">{{ status.time || 'pending' }}</span>
        </li>
      </ul>
      <button class="btn btn-primary mb-2" @click="advance" :disabled="finished">Advance Status</button>
      <p v-if="finished" class="badge badge-ok mb-4">Deal completed</p>
      <h3 class="font-semibold mb-2">Payment History</h3>
      <div class="table-wrap">
        <table class="table">
          <thead class="thead">
            <tr>
              <th class="th">Milestone</th>
              <th class="th">Amount</th>
              <th class="th">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr v-for="pay in payments" :key="pay.id" class="tr">
              <td class="td">{{ pay.milestone }}</td>
              <td class="td">{{ pay.amount }} {{ pay.currency }}</td>
              <td class="td">{{ pay.time }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
interface Status { name: string; time?: string }

const flow = ['INITIATED', 'FUNDED', 'IN_TRANSIT', 'ARRIVED', 'INSPECTING', 'ACCEPTED']
const statuses = ref<Status[]>(flow.map(name => ({ name })))
const currentIndex = ref(0)
const currentStatus = ref(flow[0])
const finished = ref(false)
const progressPercent = computed(() => (currentIndex.value / (flow.length - 1) * 100).toFixed(0) + '%')

async function advance() {
  const now = new Date().toISOString()
  statuses.value[currentIndex.value].time = now
  await $fetch('/api/deal-tracker/advance', {
    method: 'POST',
    body: { status: currentStatus.value, time: now }
  })
  if (currentIndex.value < flow.length - 1) {
    currentIndex.value++
    currentStatus.value = flow[currentIndex.value]
  } else {
    finished.value = true
  }
}

const payments = ref([
  { id: 1, milestone: 'Deposit', amount: 1000, currency: 'USD', time: '2024-01-02' }
])
</script>
