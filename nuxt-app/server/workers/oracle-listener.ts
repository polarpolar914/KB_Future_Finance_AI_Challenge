import { provider, getEscrow, getGuaranteeVault, getInsurancePool } from '../utils/chain'
import { db, eventLogs, dealMilestones, deals, payoutRequests, stats } from '../utils/db'
import { and, eq } from 'drizzle-orm'

async function watchEscrow(dealId: number, address: string) {
  const escrow = getEscrow(address, provider)
  escrow.on('Deposited', async (from, value) => {
    const amount = Number(value.toString())
    await db.transaction(async (tx) => {
      const row = await tx
        .select()
        .from(stats)
        .where(eq(stats.key, 'escrow_balance'))
        .get()
      const bal = Number(row?.value || 0) + amount
      await tx
        .update(stats)
        .set({ value: String(bal) })
        .where(eq(stats.key, 'escrow_balance'))
      await tx.insert(eventLogs).values({
        deal_id: dealId,
        source: 'CHAIN',
        event_type: 'Deposited',
        message: JSON.stringify({ from, amount: amount.toString() })
      })
    })
  })
  escrow.on('MilestoneConfirmed', async (idx) => {
    const now = new Date().toISOString()
    await db.transaction(async (tx) => {
      await tx.update(dealMilestones)
        .set({ status: 'CONFIRMED', confirmed_at: now })
        .where(and(eq(dealMilestones.deal_id, dealId), eq(dealMilestones.ord, Number(idx))))
      await tx.insert(eventLogs).values({
        deal_id: dealId,
        source: 'CHAIN',
        event_type: 'MilestoneConfirmed',
        message: JSON.stringify({ index: Number(idx) })
      })
    })
  })
  escrow.on('FundsReleased', async (value) => {
    const amount = Number(value.toString())
    await db.transaction(async (tx) => {
      const escrowRow = await tx
        .select()
        .from(stats)
        .where(eq(stats.key, 'escrow_balance'))
        .get()
      const sellerRow = await tx
        .select()
        .from(stats)
        .where(eq(stats.key, 'seller_balance'))
        .get()
      const escrowBal = Number(escrowRow?.value || 0) - amount
      const sellerBal = Number(sellerRow?.value || 0) + amount
      await tx
        .update(stats)
        .set({ value: String(escrowBal) })
        .where(eq(stats.key, 'escrow_balance'))
      await tx
        .update(stats)
        .set({ value: String(sellerBal) })
        .where(eq(stats.key, 'seller_balance'))
      await tx.insert(eventLogs).values({
        deal_id: dealId,
        source: 'CHAIN',
        event_type: 'FundsReleased',
        message: JSON.stringify({ amount: amount.toString() })
      })
    })
  })
}

async function watchInsurance(address: string) {
  const pool = getInsurancePool(address, provider)
  pool.on('DealRegistered', async (dealId, insured, premium) => {
    const id = Number(dealId)
    const amount = Number(premium.toString())
    const now = new Date().toISOString()
    await db.transaction(async (tx) => {
      await tx
        .update(deals)
        .set({ status: 'INSURED', updated_at: now })
        .where(eq(deals.id, id))
      const row = await tx
        .select()
        .from(stats)
        .where(eq(stats.key, 'pool_balance'))
        .get()
      const bal = Number(row?.value || 0) + amount
      await tx
        .update(stats)
        .set({ value: String(bal) })
        .where(eq(stats.key, 'pool_balance'))
      await tx.insert(eventLogs).values({
        deal_id: id,
        source: 'CHAIN',
        event_type: 'DealRegistered',
        message: JSON.stringify({ insured, premium: premium.toString() })
      })
    })
  })
  pool.on('PayoutTriggered', async (dealId, to, amount) => {
    const id = Number(dealId)
    const amt = Number(amount.toString())
    const now = new Date().toISOString()
    await db.transaction(async (tx) => {
      await tx
        .update(deals)
        .set({ status: 'PAYOUT_TRIGGERED', updated_at: now })
        .where(eq(deals.id, id))
      await tx.insert(eventLogs).values({
        deal_id: id,
        source: 'CHAIN',
        event_type: 'PayoutTriggered',
        message: JSON.stringify({ to, amount: amount.toString() })
      })
      await tx.insert(payoutRequests).values({
        deal: String(id),
        amount: amt,
        status: 'PAYOUT_TRIGGERED'
      })
      const poolRow = await tx
        .select()
        .from(stats)
        .where(eq(stats.key, 'pool_balance'))
        .get()
      const poolBal = Number(poolRow?.value || 0) - amt
      await tx
        .update(stats)
        .set({ value: String(poolBal) })
        .where(eq(stats.key, 'pool_balance'))
      const claimRow = await tx
        .select()
        .from(stats)
        .where(eq(stats.key, 'claims'))
        .get()
      const claimCount = Number(claimRow?.value || 0) + 1
      await tx
        .update(stats)
        .set({ value: String(claimCount) })
        .where(eq(stats.key, 'claims'))
    })
  })
}

async function watchGuarantee(address: string) {
  const vault = getGuaranteeVault(address, provider)
  vault.on('Locked', async (dealId, amount) => {
    const amt = Number(amount.toString())
    await db.transaction(async (tx) => {
      const row = await tx
        .select()
        .from(stats)
        .where(eq(stats.key, 'vault_balance'))
        .get()
      const bal = Number(row?.value || 0) + amt
      await tx
        .update(stats)
        .set({ value: String(bal) })
        .where(eq(stats.key, 'vault_balance'))
      await tx.insert(eventLogs).values({
        deal_id: Number(dealId),
        source: 'CHAIN',
        event_type: 'Locked',
        message: JSON.stringify({ amount: amt.toString() })
      })
    })
  })
  vault.on('Unlocked', async (dealId, amount) => {
    const amt = Number(amount.toString())
    await db.transaction(async (tx) => {
      const row = await tx
        .select()
        .from(stats)
        .where(eq(stats.key, 'vault_balance'))
        .get()
      const bal = Number(row?.value || 0) - amt
      await tx
        .update(stats)
        .set({ value: String(bal) })
        .where(eq(stats.key, 'vault_balance'))
      await tx.insert(eventLogs).values({
        deal_id: Number(dealId),
        source: 'CHAIN',
        event_type: 'Unlocked',
        message: JSON.stringify({ amount: amt.toString() })
      })
    })
  })
}

async function main() {
  const allDeals = await db.select().from(deals).all()
  for (const d of allDeals) {
    if (d.contract_address) {
      watchEscrow(d.id, d.contract_address)
    }
  }
  if (process.env.INSURANCE_POOL_ADDRESS) {
    watchInsurance(process.env.INSURANCE_POOL_ADDRESS)
  }
  if (process.env.GUARANTEE_VAULT_ADDRESS) {
    watchGuarantee(process.env.GUARANTEE_VAULT_ADDRESS)
  }
  console.log('Oracle listener started')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
