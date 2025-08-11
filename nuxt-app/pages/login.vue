<template>
  <div class="max-w-sm mx-auto mt-10">
    <form @submit.prevent="submit" class="flex flex-col gap-4">
      <input v-model="username" placeholder="Username" class="input" />
      <input v-model="password" type="password" placeholder="Password" class="input" />
      <button type="submit" class="btn btn-primary">Login</button>
    </form>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const router = useRouter();
const username = ref('');
const password = ref('');

async function submit() {
  try {
    await auth.login(username.value, password.value);
    router.push('/');
  } catch (e) {
    console.error(e);
  }
}
</script>
