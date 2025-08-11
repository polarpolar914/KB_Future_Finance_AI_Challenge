<template>
  <section class="container-std section">
    <div class="card max-w-xl mx-auto">
      <div class="card-header">
        <h2 class="text-xl font-semibold">Claim Waterfall</h2>
      </div>
      <div class="mb-6">
        <div class="h-2 bg-slate-200 rounded mb-4">
          <div class="h-full bg-brand-500 rounded" :style="{ width: progressPercent }"></div>
        </div>
        <ol class="space-y-2">
          <li v-for="(step, i) in steps" :key="step" class="flex items-center gap-3">
            <span class="w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium"
              :class="i < current ? 'bg-brand-500 text-white' : i === current ? 'bg-brand-100 text-brand-700' : 'bg-slate-100'">
              {{ i + 1 }}
            </span>
            <span class="flex-1">{{ step }}</span>
            <span :class="['badge', i < current ? 'badge-ok' : i === current ? 'badge-brand' : 'badge-warn']">{{ i < current ? 'done' : i === current ? 'current' : 'pending' }}</span>
          </li>
        </ol>
      </div>
      <div class="mb-4">
        <button v-if="current < steps.length - 1" class="btn btn-primary mr-2" @click="nextStep">Next Step</button>
        <span v-else class="badge badge-ok">Process Complete</span>
      </div>
      <div>
        <h3 class="font-semibold mb-2">ClaimNFT</h3>
        <p v-if="nftStatus === 'issued'" class="badge badge-ok">NFT Issued: {{ nftId }}</p>
        <p v-else-if="nftStatus === 'pending'" class="badge badge-brand">Issuing...</p>
        <template v-else>
          <p class="badge bg-slate-100 text-slate-600">Not issued</p>
          <button class="btn btn-primary mt-2" @click="issueNFT">Issue ClaimNFT</button>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const steps = ['Escrow Payout', 'Vault Payout', 'Insurance Pool Payout']
const current = ref(0)
const nftId = ref('')
const nftStatus = ref<'idle' | 'pending' | 'issued'>('idle')
const progressPercent = computed(() => ((current.value) / (steps.length - 1) * 100).toFixed(0) + '%')

async function issueNFT() {
  nftStatus.value = 'pending'
  try {
    const res = await $fetch<{ id: string }>('/api/claim/issueNFT', { method: 'POST' })
    nftId.value = res.id
    nftStatus.value = 'issued'
  } catch (err) {
    nftStatus.value = 'idle'
    throw err
  }
}

async function nextStep() {
  if (current.value < steps.length - 1) {
    await $fetch('/api/claim/distribute', { method: 'POST', body: { step: current.value } })
    current.value++
  }
}
</script>
