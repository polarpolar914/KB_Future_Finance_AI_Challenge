<template>
  <section class="container-std section">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Admin View</h2>
      </div>
      <h3 class="font-medium mb-2">System Logs</h3>
      <div class="flex flex-wrap items-center gap-4 mb-4">
        <label class="flex items-center"><input type="checkbox" value="CHAIN" v-model="selectedSources" class="mr-1">CHAIN</label>
        <label class="flex items-center"><input type="checkbox" value="ORACLE" v-model="selectedSources" class="mr-1">ORACLE</label>
        <label class="flex items-center"><input type="checkbox" value="APP" v-model="selectedSources" class="mr-1">APP</label>
        <input v-model="search" type="text" placeholder="Search" class="input w-40" />
        <span v-if="hasNew" class="badge badge-brand">New logs</span>
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
import { ref, computed, onBeforeUnmount, watch } from 'vue'

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
  hasNew.value = true
}
onBeforeUnmount(() => es.close())

const selectedSources = ref(['CHAIN', 'ORACLE', 'APP'])
const search = ref('')
const hasNew = ref(false)
const filteredLogs = computed(() =>
    logs.value.filter(l => selectedSources.value.includes(l.source) && l.message.toLowerCase().includes(search.value.toLowerCase()))
)
watch(filteredLogs, () => { hasNew.value = false })
const lastTrigger = computed(() => {
  const oracle = logs.value.find(l => l.event_type === 'ORACLE')
  return oracle ? oracle.message : 'N/A'
})
</script>
