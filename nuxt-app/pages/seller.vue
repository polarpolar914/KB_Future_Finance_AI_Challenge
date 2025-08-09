<template>
  <section class="container-std section">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Seller Dashboard</h2>
      </div>

      <h3 class="font-medium mb-2">Milestones</h3>
      <MilestoneList :deal-id="1" class="mb-6" />

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

const fileName = ref('')

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) fileName.value = file.name
}
</script>
