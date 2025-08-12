<template>
  <div class="min-h-screen flex flex-col">
    <NuxtRouteAnnouncer />
    <header class="navbar">
      <div class="nav-inner">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-2xl bg-brand-500"></div>
          <NuxtLink to="/" class="font-semibold">TradeShield</NuxtLink>
        </div>
        <nav class="hidden md:flex items-center gap-6 text-sm text-slate-600">
          <NuxtLink to="/deal-creation" class="hover:text-slate-900">Deal</NuxtLink>
          <NuxtLink to="/risk-analysis" class="hover:text-slate-900">Risk</NuxtLink>
          <NuxtLink to="/claim-waterfall" class="hover:text-slate-900">Claims</NuxtLink>
        </nav>
        <div class="flex items-center gap-2">
          <template v-if="!auth.isAuthenticated">
            <NuxtLink to="/login" class="btn btn-secondary px-4 py-2">Login</NuxtLink>
            <NuxtLink to="/signup" class="btn btn-secondary px-4 py-2">Sign Up</NuxtLink>
          </template>
          <template v-else>
            <button class="btn btn-secondary px-4 py-2" @click="auth.logout()">Logout</button>
          </template>
        </div>
      </div>
   </header>
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { onMounted } from 'vue'
const auth = useAuthStore()
onMounted(() => auth.load())
</script>
