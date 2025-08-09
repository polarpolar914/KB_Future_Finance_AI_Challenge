<template>
  <section class="container-std section">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Admin View</h2>
      </div>
      <h3 class="font-medium mb-2">System Logs</h3>
      <div class="table-wrap mb-6">
        <table class="table">
          <thead class="thead">
            <tr>
              <th class="th">Time</th>
              <th class="th">Message</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr v-for="log in logs" :key="log.id" class="tr">
              <td class="td">{{ log.time }}</td>
              <td class="td">{{ log.message }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 class="font-medium mb-2">Oracle Status</h3>
      <p><span class="badge badge-brand">Last Trigger: {{ lastTrigger }}</span></p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const logs = ref([
  { id: 1, time: '2024-01-05', message: 'Deal A funded' }
])
const lastTrigger = ref('onShipConfirmed at 2024-01-06')
</script>
