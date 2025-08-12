import { demoUsers } from '~/data/demo-users'

export default defineNuxtPlugin(() => {
  if (process.client) {
    const existing = JSON.parse(localStorage.getItem('demo-users') || '{}')
    if (!Object.keys(existing).length) {
      const users: Record<string, { password: string; name: string }> = {}
      for (const role in demoUsers) {
        const { email, password } = (demoUsers as any)[role]
        users[email] = { password, name: `Demo ${role}` }
      }
      localStorage.setItem('demo-users', JSON.stringify(users))
    }
  }
})
