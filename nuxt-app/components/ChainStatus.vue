<template>
  <div class="card p-4">
    <h3 class="font-semibold mb-2">Chain Status</h3>
    <p v-if="deal.status">Status: {{ deal.status }}</p>
    <p v-if="deal.contract_address">Contract: {{ deal.contract_address }}</p>
    <p v-if="deal.contract_hash">Tx Hash: {{ deal.contract_hash }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ deal: any }>()
</script>