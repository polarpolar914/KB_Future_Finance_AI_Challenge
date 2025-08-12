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

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file && dealId.value) {
    const form = new FormData()
    form.append('file', file)
    form.append('dealId', dealId.value)
    if (milestoneId.value) form.append('milestoneId', milestoneId.value)
    if (docType.value) form.append('docType', docType.value)
    await $fetch('/api/documents/upload', { method: 'POST', body: form })
    await refresh()
  }
}
</script>
