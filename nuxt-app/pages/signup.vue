<template>
  <div class="max-w-sm mx-auto mt-10">
    <form @submit.prevent="register" class="flex flex-col gap-4">
      <input v-model="email" placeholder="Email" class="input" />
      <input v-model="name" placeholder="Name" class="input" />
      <input type="password" v-model="password" placeholder="Password" class="input" />
      <button type="submit" class="btn btn-primary">Sign Up</button>
      <NuxtLink to="/login" class="text-sm text-center">Back to login</NuxtLink>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const name = ref('')
const password = ref('')

async function register() {
  try {
    await auth.register(email.value, password.value, name.value)
    router.push('/')
  } catch (e) {
    console.error(e)
  }
}
</script>
