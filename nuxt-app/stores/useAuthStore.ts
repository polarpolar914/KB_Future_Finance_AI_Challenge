import { defineStore } from 'pinia';

type AuthState = {
  token: string | null;
};

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: process.client ? localStorage.getItem('token') : null,
  }),
  actions: {
    async login(username: string, password: string) {
      const res = await $fetch<{ token: string }>('/api/auth/login', {
        method: 'POST',
        body: { username, password },
      });
      this.token = res.token;
      if (process.client) {
        localStorage.setItem('token', res.token);
      }
    },
    async logout() {
      await $fetch('/api/auth/logout', { method: 'POST' });
      this.token = null;
      if (process.client) {
        localStorage.removeItem('token');
      }
    },
  },
});
