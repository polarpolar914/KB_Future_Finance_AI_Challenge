<template>
  <div class="table-wrap">
    <table class="table">
      <thead class="thead">
        <tr>
          <th class="th">Category</th>
          <th class="th">Metric</th>
          <th class="th">Value</th>
          <th class="th">Year</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 bg-white">
        <tr v-for="item in markets" :key="item.id" class="tr">
          <td class="td">{{ item.category }}</td>
          <td class="td">{{ item.metric }}</td>
          <td class="td">{{ item.value_num }} {{ item.currency }}</td>
          <td class="td">{{ item.base_year }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface MarketRow {
  id: number
  category: string
  metric: string
  value_num: number
  currency: string
  base_year: number
}

defineProps<{ markets: MarketRow[] }>()
</script>

