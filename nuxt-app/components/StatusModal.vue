<template>
  <transition name="fade">
    <div v-if="modal.show" class="fixed inset-0 flex items-center justify-center bg-black/50">
      <div class="modal w-80 text-center">
        <p :class="modal.type === 'error' ? 'text-rose-600' : 'text-brand-700'">
          {{ modal.message }}
        </p>
        <button class="btn btn-primary mt-4" @click="modal.close()">확인</button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useModalStore } from '~/stores/modal'
const modal = useModalStore()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
