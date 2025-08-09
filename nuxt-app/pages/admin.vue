<template>
  <section class="container-std section">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Admin View</h2>
      </div>
      <h3 class="font-medium mb-2">System Logs</h3>
      <div class="flex gap-4 mb-4">
        <label class="flex items-center"><input type="checkbox" value="CHAIN" v-model="selectedSources" class="mr-1">CHAIN</label>
        <label class="flex items-center"><input type="checkbox" value="ORACLE" v-model="selectedSources" class="mr-1">ORACLE</label>
        <label class="flex items-center"><input type="checkbox" value="APP" v-model="selectedSources" class="mr-1">APP</label>
      </div>
      <div class="table-wrap mb-6">
        <table class="table">
          <thead class="thead">
            <tr>
              <th class="th">Time</th>
              <th class="th">Message</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
          <tr v-for="log in filteredLogs" :key="log.id" class="tr">
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
import { ref, computed, onBeforeUnmount } from 'vue'

const { data: logData } = await useFetch('/api/admin/logs')
const logs = ref((logData.value || []).map(l => ({
  id: l.id,
  time: l.created_at,
  message: l.message,
  event_type: l.event_type,
  source: l.source,
})))

const es = new EventSource('/api/admin/logs/stream')
es.onmessage = (e) => {
  const l = JSON.parse(e.data)
  logs.value.unshift({
    id: l.id,
    time: l.created_at,
    message: l.message,
    event_type: l.event_type,
    source: l.source,
  })
}
onBeforeUnmount(() => es.close())

const selectedSources = ref(['CHAIN', 'ORACLE', 'APP'])
const filteredLogs = computed(() =>
    logs.value.filter(l => selectedSources.value.includes(l.source))
)
const lastTrigger = computed(() => {
  const oracle = logs.value.find(l => l.event_type === 'ORACLE')
  return oracle ? oracle.message : 'N/A'
})
</script>
