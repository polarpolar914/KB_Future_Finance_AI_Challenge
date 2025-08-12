<template>
  <div class="max-w-sm mx-auto mt-10">
    <form v-if="step === 'email'" @submit.prevent="request" class="flex flex-col gap-4">
      <input v-model="email" placeholder="Email" class="input" />
      <button type="submit" class="btn btn-primary">Send OTP</button>
    </form>
    <form v-else @submit.prevent="verify" class="flex flex-col gap-4">
      <input v-model="code" placeholder="OTP Code" class="input" />
      <button type="submit" class="btn btn-primary">Verify</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const code = ref('')
const step = ref<'email' | 'otp'>('email')

async function request() {
  await auth.requestOtp(email.value)
  step.value = 'otp'
}

async function verify() {
  try {
    await auth.verifyOtp(code.value)
    router.push('/')
  } catch (e) {
    console.error(e);
  }
}
</script>
