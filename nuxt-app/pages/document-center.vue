<template>
  <section class="container-std section">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Document Center</h2>
      </div>
      <div class="mb-4 flex flex-wrap gap-2 items-center">
        <input v-model="dealId" type="number" placeholder="Deal ID" class="input w-28" />
        <input v-model="milestoneId" type="number" placeholder="Milestone" class="input w-28" />
        <input v-model="docType" type="text" placeholder="Type" class="input w-28" />
        <input type="file" @change="onFile" class="input" />
        <span v-if="uploading" class="badge badge-warn">Uploading...</span>
        <span v-if="uploaded" class="badge badge-ok">Uploaded</span>
        <span v-if="uploadError" class="text-red-500 text-sm">{{ uploadError }}</span>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead class="thead">
            <tr>
              <th class="th">Document</th>
              <th class="th">Type</th>
              <th class="th">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr v-for="doc in docs" :key="doc.name" class="tr">
              <td class="td"><a :href="doc.url" target="_blank" class="underline">{{ doc.name }}</a></td>
              <td class="td">{{ doc.mime_type || doc.doc_type }}</td>
              <td class="td">
                <span :class="['badge', doc.status === 'VERIFIED' ? 'badge-ok' : 'badge-warn']">{{ doc.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

definePageMeta({ roles: ['buyer', 'seller', 'admin'] })

const { data, refresh } = await useFetch('/api/documents')
const docs = computed(() => data.value || [])

const dealId = ref('')
const milestoneId = ref('')
const docType = ref('')
const uploading = ref(false)
const uploaded = ref(false)
const uploadError = ref('')

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file && dealId.value) {
    uploading.value = true
    uploadError.value = ''
    uploaded.value = false
    const form = new FormData()
    form.append('file', file)
    form.append('dealId', dealId.value)
    if (milestoneId.value) form.append('milestoneId', milestoneId.value)
    if (docType.value) form.append('docType', docType.value)
    try {
      await $fetch('/api/documents/upload', { method: 'POST', body: form })
      uploaded.value = true
      await refresh()
    } catch (e: any) {
      uploadError.value = e.statusMessage || 'Upload failed'
    } finally {
      uploading.value = false
    }
  }
}
</script>
