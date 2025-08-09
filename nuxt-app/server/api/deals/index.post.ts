import { db, deals, dealMilestones } from '~/server/utils/db'
import { z } from 'zod'
import { deployEscrow, provider } from '~/server/utils/chain'

const schema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1),
  incoterms: z.string().optional(),
  deposit_pct: z.number().min(0).max(100).optional(),
  seller: z.string().optional(),
  guarantor: z.string().optional(),
  insurer: z.string().optional(),
  milestones: z
    .array(
      z.object({
        description: z.string(),
        amount: z.number().nonnegative(),
      }),
    )
    .default([]),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = schema.parse(body)

  const signer = await provider.getSigner()
  const amounts = data.milestones.map((m) => BigInt(Math.floor(m.amount)))
  const contract = await deployEscrow(
    await signer.getAddress(),
    data.seller || (await signer.getAddress()),
    amounts,
    signer,
  )
  const contractAddress = await contract.getAddress()
  const contractHash = contract.deploymentTransaction()?.hash || ''

  const now = new Date().toISOString()
  let dealId = 0
  await db.transaction(async (tx) => {
    const res = await tx
      .insert(deals)
      .values({
        amount: data.amount,
        currency: data.currency,
        incoterms: data.incoterms,
        deposit_pct: data.deposit_pct,
        seller: data.seller,
        guarantor: data.guarantor,
        insurer: data.insurer,
        status: 'DEPLOYED',
        contract_address: contractAddress,
        contract_hash: contractHash,
        created_at: now,
        updated_at: now,
      })
      .run()
    dealId = Number(res.lastInsertRowid)

    if (data.milestones.length) {
      const ms = data.milestones.map((m, idx) => ({
        deal_id: dealId,
        ord: idx + 1,
        description: m.description,
        status: 'PENDING',
      }))
      await tx.insert(dealMilestones).values(ms)
    }
  })

  return { dealId, contractAddress, contractHash }
})

