<template>
  <section class="container-std section">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Seller Dashboard</h2>
      </div>

      <h3 class="font-medium mb-2">Milestones</h3>
      <div class="table-wrap mb-6">
        <table class="table">
          <thead class="thead">
            <tr>
              <th class="th">Milestone</th>
              <th class="th">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr v-for="m in milestones" :key="m.name" class="tr">
              <td class="td">{{ m.name }}</td>
              <td class="td"><span :class="['badge', m.status === 'Done' ? 'badge-ok' : 'badge-warn']">{{ m.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="font-medium mb-2">Upload Documents</h3>
      <div class="field p-4 mb-4">
        <input type="file" @change="onFile" class="input" />
      </div>
      <p v-if="fileName" class="badge badge-brand">Uploaded: {{ fileName }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const milestones = ref([
  { name: 'Shipment', status: 'Pending' },
  { name: 'POD', status: 'Pending' }
])

const fileName = ref('')

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) fileName.value = file.name
}
</script>
