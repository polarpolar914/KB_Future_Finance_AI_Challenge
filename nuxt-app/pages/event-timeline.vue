<template>
  <section class="container-std section">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Event Timeline</h2>
      </div>
      <div class="mb-4 max-w-xs">
        <label class="block text-sm mb-1">Filter</label>
        <input v-model="filter" type="text" class="input" placeholder="Search events" />
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead class="thead">
            <tr>
              <th class="th">Time</th>
              <th class="th">Event</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr v-for="e in filtered" :key="e.id" class="tr">
              <td class="td font-mono text-xs">{{ e.time }}</td>
              <td class="td">{{ e.message }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const filter = ref('')
const events = ref([
  { id: 1, time: '2024-01-01 09:00', message: 'Deal initiated' },
  { id: 2, time: '2024-01-02 10:00', message: 'Deposit funded' }
])
const filtered = computed(() =>
  events.value.filter(e =>
    e.message.toLowerCase().includes(filter.value.toLowerCase())
  )
)
</script>
