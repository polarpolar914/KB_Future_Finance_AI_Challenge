<template>
  <section class="container-std section">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Document Center</h2>
      </div>
      <div class="mb-4">
        <input type="file" @change="onFile" class="input" />
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead class="thead">
            <tr>
              <th class="th">Document</th>
              <th class="th">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr v-for="doc in docs" :key="doc.name" class="tr">
              <td class="td">{{ doc.name }}</td>
              <td class="td">
                <span :class="['badge', doc.status === 'Verified' ? 'badge-ok' : 'badge-warn']">{{ doc.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { data } = await useFetch('/api/documents')
const docs = computed(() => data.value || [])

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    // placeholder upload: insert into local list
  }
}
</script>
