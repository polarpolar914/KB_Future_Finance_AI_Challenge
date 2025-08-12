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
          <input v-model.number="form.amount" type="number" min="0" step="0.01" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Currency</label>
          <select v-model="form.currency" class="input">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="KRW">KRW</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Incoterms</label>
          <input v-model="form.incoterms" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Deposit %</label>
          <input v-model.number="form.deposit" type="number" min="0" max="100" step="1" class="input" />
          <p v-if="form.amount" class="help">Deposit Amount: {{ depositAmount }} {{ form.currency }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Milestones</label>
          <div class="space-y-2">
            <div v-for="(m, idx) in form.milestones" :key="idx" class="flex space-x-2">
              <input v-model="m.description" placeholder="Description" class="input flex-1" />
              <input v-model.number="m.amount" type="number" placeholder="Amount" class="input w-24" />
              <button
                type="button"
                class="btn btn-secondary"
                @click="removeMilestone(idx)"
                v-if="form.milestones.length > 1"
              >-</button>
            </div>
            <button type="button" class="btn btn-secondary" @click="addMilestone">+</button>
          </div>
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
      <p v-if="error" class="text-red-500 text-sm mt-4">{{ error }}</p>
      <div v-if="contractHash" class="mt-6">
        <h3 class="font-semibold">Smart Contract Hash</h3>
        <div class="flex items-center gap-2">
          <p class="font-mono text-sm break-all">{{ contractHash }}</p>
          <button type="button" class="btn btn-secondary btn-xs" @click="copyHash">Copy</button>
        </div>
        <p v-if="copied" class="text-xs text-green-600 mt-1">Copied to clipboard</p>
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
import { useAuthStore } from '~/stores/auth'
const router = useRouter()
definePageMeta({ roles: ['buyer'] })
const auth = useAuthStore()

const form = reactive({
  amount: 0,
  currency: 'USD',
  incoterms: '',
  deposit: 0,
  milestones: [{ description: '', amount: 0 }] as { description: string; amount: number }[],
  seller: '',
  guarantor: '',
  insurer: ''
})

const contractHash = ref('')
const error = ref('')
const copied = ref(false)
const depositAmount = computed(() => (form.amount * form.deposit / 100).toFixed(2))
const previewRows = computed(() => [
  { key: 'amount', label: 'Amount', value: form.amount },
  { key: 'currency', label: 'Currency', value: form.currency },
  { key: 'incoterms', label: 'Incoterms', value: form.incoterms },
  { key: 'deposit', label: 'Deposit', value: `${form.deposit}% (${depositAmount.value} ${form.currency})` },
  { key: 'milestones', label: 'Milestones', value: form.milestones.map(m => `${m.description}: ${m.amount}`) },
  { key: 'seller', label: 'Seller', value: form.seller },
  { key: 'guarantor', label: 'Guarantor', value: form.guarantor },
  { key: 'insurer', label: 'Insurer', value: form.insurer }
])

function addMilestone() {
  const last = form.milestones[form.milestones.length - 1]
  if (!last.description) return
  form.milestones.push({ description: '', amount: 0 })
}

function removeMilestone(idx: number) {
  form.milestones.splice(idx, 1)
}

async function copyHash() {
  await navigator.clipboard.writeText(contractHash.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

async function createContract() {
  error.value = ''
  form.milestones = form.milestones.filter(m => m.description)
  if (!form.amount || !form.currency || !form.incoterms || !form.milestones.length) {
    error.value = 'Please fill all required fields'
    return
  }
  try {
    const res = await $fetch<{ id: number }>('/api/deals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.token}` },
      body: {
        amount: form.amount,
        currency: form.currency,
        incoterms: form.incoterms,
        deposit_pct: form.deposit,
        milestones: form.milestones.map((m, i) => ({ ord: i + 1, description: m.description, amount: m.amount })),
      }
    })
    router.push(`/deals/${res.id}`)
  } catch (e: any) {
    error.value = e.statusMessage || e.message || 'Failed to create deal'
  }
}
</script>
