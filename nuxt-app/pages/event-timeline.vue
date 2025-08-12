<template>
  <section class="container-std section">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Event Timeline</h2>
      </div>
      <div class="mb-4 flex flex-wrap gap-2 items-center">
        <input v-model="filter" type="text" class="input" placeholder="Search events" />
        <button class="btn btn-ghost" @click="prevPage" :disabled="page===1">Prev</button>
        <button class="btn btn-ghost" @click="nextPage" :disabled="page * perPage >= filtered.length">Next</button>
        <span class="text-sm">Page {{ page }}</span>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead class="thead">
            <tr>
              <th class="th">Time</th>
              <th class="th">Type</th>
              <th class="th">Source</th>
              <th class="th">Event</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr v-for="e in paged" :key="e.id" class="tr">
              <td class="td font-mono text-xs">{{ e.time }}</td>
              <td class="td"><span :class="['badge', typeColor(e.event_type)]">{{ e.event_type }}</span></td>
              <td class="td"><span :class="['badge', sourceColor(e.source)]">{{ e.source }}</span></td>
              <td class="td">
                <NuxtLink v-if="e.deal_id" :to="`/deals/${e.deal_id}`" class="link">{{ e.message }}</NuxtLink>
                <span v-else>{{ e.message }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({ roles: ['buyer', 'seller', 'guarantor', 'insurer', 'admin'] })

const filter = ref('')
const page = ref(1)
const perPage = 20
const { data } = await useFetch('/api/events')
interface Event { id: number; time: string; message: string; event_type: string; source: string; deal_id?: number }
const events = computed<Event[]>(() =>
  (data.value || []).map((e: any) => ({
    id: e.id,
    time: e.created_at,
    message: e.message,
    event_type: e.event_type,
    source: e.source,
    deal_id: e.deal_id,
  }))
)
const filtered = computed(() =>
  events.value.filter((e) => e.message.toLowerCase().includes(filter.value.toLowerCase()))
)
const paged = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage))
function nextPage() { if (page.value * perPage < filtered.value.length) page.value++ }
function prevPage() { if (page.value > 1) page.value-- }
function typeColor(t: string) {
  return t === 'ERROR' ? 'badge-warn' : t === 'PAYOUT' ? 'badge-brand' : 'badge-ok'
}
function sourceColor(s: string) {
  return s === 'ORACLE' ? 'badge-brand' : s === 'CHAIN' ? 'badge-ok' : 'badge'
}
</script>
