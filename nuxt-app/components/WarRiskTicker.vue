<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-slate-500">War Risk AP%:</span>
    <span class="font-semibold">{{ rate }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const rate = ref('0.00')
let es: EventSource | null = null

onMounted(() => {
  es = new EventSource('/api/oracle/war-risk/stream')
  es.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data)
      rate.value = Number(data.ap_rate).toFixed(2)
    } catch (e) {
      // ignore parse errors
    }
  }
})

onBeforeUnmount(() => {
  es?.close()
})
</script>

