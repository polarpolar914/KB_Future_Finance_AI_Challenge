<template>
  <section class="container-std section">
    <div class="card max-w-xl mx-auto">
      <div class="card-header">
        <div>
          <h2 class="text-xl font-semibold">Deal Creation</h2>
          <p class="text-sm text-slate-500">거래 조건을 설정하고 스마트 계약을 생성합니다</p>
        </div>
      </div>
      <form @submit.prevent="createContract" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Amount</label>
          <input v-model.number="form.amount" type="number" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Currency</label>
          <input v-model="form.currency" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Incoterms</label>
          <input v-model="form.incoterms" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Deposit %</label>
          <input v-model.number="form.deposit" type="number" class="input" />
          <p v-if="form.amount" class="help">Deposit Amount: {{ depositAmount }} {{ form.currency }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Milestones (comma separated)</label>
          <input v-model="milestoneInput" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Seller</label>
          <input v-model="form.seller" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Guarantor</label>
          <input v-model="form.guarantor" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Insurer</label>
          <input v-model="form.insurer" type="text" class="input" />
        </div>
        <button type="submit" class="btn btn-primary">Create</button>
      </form>
      <div v-if="contractHash" class="mt-6">
        <h3 class="font-semibold">Smart Contract Hash</h3>
        <p class="font-mono text-sm break-all">{{ contractHash }}</p>
      </div>
      <div class="mt-6" v-if="previewRows.length">
        <h3 class="font-semibold mb-2">Preview</h3>
        <div class="table-wrap">
          <table class="table">
            <tbody class="divide-y divide-slate-200 bg-white">
              <tr v-for="row in previewRows" :key="row.key" class="tr">
                <th class="th text-left align-top">{{ row.label }}</th>
                <td class="td">
                  <template v-if="Array.isArray(row.value)">
                    <ul class="list-disc pl-4 space-y-1">
                      <li v-for="item in row.value" :key="item">{{ item }}</li>
                    </ul>
                  </template>
                  <template v-else>
                    {{ row.value }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'

const form = reactive({
  amount: 0,
  currency: 'USD',
  incoterms: '',
  deposit: 0,
  milestones: [] as string[],
  seller: '',
  guarantor: '',
  insurer: ''
})

const milestoneInput = ref('')
const contractHash = ref('')
const depositAmount = computed(() => (form.amount * form.deposit / 100).toFixed(2))
const previewRows = computed(() => [
  { key: 'amount', label: 'Amount', value: form.amount },
  { key: 'currency', label: 'Currency', value: form.currency },
  { key: 'incoterms', label: 'Incoterms', value: form.incoterms },
  { key: 'deposit', label: 'Deposit', value: `${form.deposit}% (${depositAmount.value} ${form.currency})` },
  { key: 'milestones', label: 'Milestones', value: form.milestones },
  { key: 'seller', label: 'Seller', value: form.seller },
  { key: 'guarantor', label: 'Guarantor', value: form.guarantor },
  { key: 'insurer', label: 'Insurer', value: form.insurer }
])

function simpleHash(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(16)
}

async function createContract() {
  form.milestones = milestoneInput.value.split(',').map(m => m.trim()).filter(Boolean)
  // simulate blockchain deployment by hashing form data
  const payload = JSON.stringify(form)
  contractHash.value = simpleHash(payload)
}
</script>
