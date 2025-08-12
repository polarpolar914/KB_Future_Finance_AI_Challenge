<template>
  <section class="container-std section" v-if="deal">
    <h2 class="text-xl font-semibold mb-4">Deal {{ deal.id }}</h2>
    <ChainStatus :deal="deal" :chain-status="chainStatus" class="mb-6" />
    <div class="grid md:grid-cols-2 gap-4 mb-6">
      <RiskScoreCard :deal-id="deal.id" />
      <PremiumBreakdown :deal-id="deal.id" />
    </div>
    <MilestoneList :milestones="milestones" @confirmed="refresh" />
  </section>
  <section v-else class="container-std section">
    <p>Loading...</p>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import RiskScoreCard from '~/components/RiskScoreCard.vue'
import PremiumBreakdown from '~/components/PremiumBreakdown.vue'
import MilestoneList from '~/components/MilestoneList.vue'
import ChainStatus from '~/components/ChainStatus.vue'

definePageMeta({ roles: ['buyer', 'seller', 'admin'] })

const route = useRoute()
const id = route.params.id
const { data, refresh } = await useFetch(`/api/deals/${id}`)

const deal = computed(() => data.value?.deal)
const milestones = computed(() => data.value?.milestones || [])
const chainStatus = computed(() => data.value?.chainStatus)
</script>
