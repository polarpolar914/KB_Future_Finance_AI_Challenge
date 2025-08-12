<template>
  <section class="container-std section">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Seller Dashboard</h2>
      </div>

      <h3 class="font-medium mb-2">Milestones</h3>
      <select v-model="selectedDeal" class="input mb-4">
        <option disabled value="">Select Deal</option>
        <option v-for="deal in deals" :key="deal.id" :value="deal.id">Deal #{{ deal.id }}</option>
      </select>
      <MilestoneList v-if="selectedDeal" :deal-id="selectedDeal" class="mb-6" />

      <h3 class="font-medium mb-2">Upload Documents</h3>
      <div class="field p-4 mb-4">
        <select v-model="selectedMilestone" class="input mb-2" v-if="milestones.length">
          <option disabled value="">Select Milestone</option>
          <option v-for="m in milestones" :key="m.id" :value="m.id">{{ m.description }}</option>
        </select>
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
import { ref, computed, watch } from 'vue'
import MilestoneList from '~/components/MilestoneList.vue'

definePageMeta({ roles: ['seller'] })

const { data: dealData } = await useFetch('/api/seller/deals')
const deals = computed(() => dealData.value || [])
const selectedDeal = ref<number | null>(null)
const selectedMilestone = ref<number | null>(null)

const { data: milestoneData, refresh: refreshMilestones } = await useFetch(() =>
  selectedDeal.value ? `/api/deals/${selectedDeal.value}` : null
)
const milestones = computed(() => milestoneData.value?.milestones || [])

watch(selectedDeal, () => {
  selectedMilestone.value = null
  refreshMilestones()
})

const fileName = ref('')
const uploading = ref(false)
const uploaded = ref(false)
const error = ref('')

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !selectedDeal.value || !selectedMilestone.value) return
  fileName.value = file.name
  const fd = new FormData()
  fd.append('file', file)
  fd.append('dealId', String(selectedDeal.value))
  fd.append('milestoneId', String(selectedMilestone.value))
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
