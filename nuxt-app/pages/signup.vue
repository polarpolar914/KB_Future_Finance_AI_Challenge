<template>
  <div class="max-w-sm mx-auto mt-10">
    <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
      <input v-model="values.email" type="email" placeholder="Email" class="input" />
      <span class="text-red-500 text-sm" v-if="errors.email">{{ errors.email }}</span>
      <input v-model="values.name" placeholder="Name" class="input" />
      <span class="text-red-500 text-sm" v-if="errors.name">{{ errors.name }}</span>
      <input v-model="values.password" type="password" placeholder="Password" class="input" />
      <span class="text-xs text-slate-500">Password must be at least 8 characters.</span>
      <span class="text-red-500 text-sm" v-if="errors.password">{{ errors.password }}</span>
      <button type="submit" class="btn btn-primary">Sign Up</button>
      <NuxtLink to="/login" class="text-sm text-center">Back to login</NuxtLink>
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
  name: yup.string().required(),
  password: yup.string().min(8).required(),
})

const { handleSubmit, errors, values } = useForm<{ email: string; name: string; password: string }>({
  validationSchema: schema,
  initialValues: { email: '', name: '', password: '' },
})

const onSubmit = handleSubmit(async (vals) => {
  try {
    await auth.register(vals.email, vals.password, vals.name)
    modal.open('회원가입이 완료되었습니다.')
    await navigateTo('/')
  } catch (e: any) {
    modal.open(e.statusMessage || '회원가입에 실패했습니다.', 'error')
  }
})
</script>
