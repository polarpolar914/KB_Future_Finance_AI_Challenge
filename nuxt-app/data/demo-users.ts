export const demoUsers = {
  buyer: { email: 'buyer@example.com', password: 'pass' },
  seller: { email: 'seller@example.com', password: 'pass' },
  guarantor: { email: 'guarantor@example.com', password: 'pass' },
  insurer: { email: 'insurer@example.com', password: 'pass' },
  admin: { email: 'admin@example.com', password: 'pass' }
} as const

export type DemoRole = keyof typeof demoUsers
