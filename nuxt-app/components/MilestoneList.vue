<template>
  <div class="table-wrap">
    <table class="table">
      <thead class="thead">
      <tr>
        <th class="th">Milestone</th>
        <th class="th">Status</th>
        <th class="th">Actions</th>
      </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 bg-white">
      <tr v-for="m in milestones" :key="m.id" class="tr">
        <td class="td">{{ m.description }}</td>
        <td class="td">
          <span :class="['badge', m.status === 'CONFIRMED' ? 'badge-ok' : 'badge-warn']">{{ m.status }}</span>
        </td>
        <td class="td">
          <button
              v-if="m.status !== 'CONFIRMED'"
              class="btn btn-primary btn-sm"
              @click="confirm(m)"
          >
            Confirm
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Milestone { id: number; description: string; status: string }

const props = defineProps<{ milestones: Milestone[] }>()
const emit = defineEmits<{ (e: 'confirmed', id: number): void }>()

async function confirm(m: Milestone) {
  await $fetch(`/api/milestones/${m.id}/confirm`, { method: 'POST' })
  m.status = 'CONFIRMED'
  emit('confirmed', m.id)
}
</script>
