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
      <p v-if="uploading" class="badge badge-warn">Uploading...</p>
      <p v-else-if="uploaded" class="badge badge-ok">Uploaded: {{ fileName }}</p>
      <p v-else-if="fileName" class="badge badge-brand">Ready: {{ fileName }}</p>
      <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const fileName = ref('')
const uploading = ref(false)
const uploaded = ref(false)
const error = ref('')

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  fileName.value = file.name
  const fd = new FormData()
  fd.append('file', file)
  uploading.value = true
  uploaded.value = false
  error.value = ''
  try {
    await $fetch('/api/seller/upload', { method: 'POST', body: fd })
    uploaded.value = true
  } catch (e: any) {
    error.value = e.statusMessage || e.message || 'Upload failed'
  } finally {
    uploading.value = false
  }
}
</script>
