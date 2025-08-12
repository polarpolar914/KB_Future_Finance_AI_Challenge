import { db, deals, dealMilestones, stats, pricing, eventLogs } from '~/server/utils/db'
import { z } from 'zod'
import { deployEscrow, provider, getGuaranteeVault, getInsurancePool } from '~/server/utils/chain'
import { eq } from 'drizzle-orm'

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
  let premium = 0
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

    if (data.guarantor) {
      const gRow = await tx.select().from(stats).where(eq(stats.key, 'guarantee_balance')).get()
      const gBal = Number(gRow?.value || 0)
      const lockAmt = Math.min(gBal, data.amount)
      await tx
        .update(stats)
        .set({ value: String(gBal - lockAmt) })
        .where(eq(stats.key, 'guarantee_balance'))
      await tx.insert(eventLogs).values({
        deal_id: dealId,
        source: 'APP',
        event_type: 'GUARANTEE',
        message: `Guarantor locked ${lockAmt} USD`,
      })
    }

    if (data.insurer) {
      const pRow = await tx
        .select()
        .from(pricing)
        .where(eq(pricing.deal_id, dealId))
        .get()
      premium = Number(pRow?.premium_amount || 0)
      const poolRow = await tx.select().from(stats).where(eq(stats.key, 'pool_balance')).get()
      const poolBal = Number(poolRow?.value || 0) + premium
      await tx.update(stats).set({ value: String(poolBal) }).where(eq(stats.key, 'pool_balance'))
      await tx.insert(eventLogs).values({
        deal_id: dealId,
        source: 'APP',
        event_type: 'INSURANCE',
        message: `Premium ${premium} USD paid to pool`,
      })
    }
  })

  // Optional on-chain interactions
  if (data.guarantor && process.env.GUARANTEE_VAULT_ADDRESS) {
    try {
      const signer = await provider.getSigner()
      const vault = getGuaranteeVault(process.env.GUARANTEE_VAULT_ADDRESS, signer)
      await vault.lock(dealId, BigInt(Math.floor(data.amount)))
    } catch (err) {
      console.error('GuaranteeVault lock failed', err)
    }
  }

  if (data.insurer && process.env.INSURANCE_POOL_ADDRESS) {
    try {
      const signer = await provider.getSigner()
      const pool = getInsurancePool(process.env.INSURANCE_POOL_ADDRESS, signer)
      await pool.registerDeal(dealId, BigInt(Math.floor(premium)))
    } catch (err) {
      console.error('InsurancePool register failed', err)
    }
  }

  return { dealId, contractAddress, contractHash }
})

