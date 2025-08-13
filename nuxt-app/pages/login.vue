<template>
  <div class="max-w-sm mx-auto mt-10">
    <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
      <input v-model="values.email" type="email" placeholder="Email" class="input" />
      <span class="text-red-500 text-sm" v-if="errors.email">{{ errors.email }}</span>
      <input v-model="values.password" type="password" placeholder="Password" class="input" />
      <span class="text-red-500 text-sm" v-if="errors.password">{{ errors.password }}</span>
      <button type="submit" class="btn btn-primary">Login</button>
      <NuxtLink to="/signup" class="text-sm text-center">Sign up</NuxtLink>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useModalStore } from '~/stores/modal'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
const auth = useAuthStore()
const modal = useModalStore()

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
})

const { handleSubmit, errors, values } = useForm<{ email: string; password: string }>({
  validationSchema: schema,
  initialValues: { email: '', password: '' },
})

const onSubmit = handleSubmit(async (vals) => {
  try {
    await auth.login(vals.email, vals.password)
    modal.open('로그인되었습니다.')
    await navigateTo('/')
  } catch (e: any) {
    modal.open(e.statusMessage || '로그인에 실패했습니다.', 'error')
  }
})
</script>
