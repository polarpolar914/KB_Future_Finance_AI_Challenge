import { db, eventLogs, claimNfts } from '~/server/utils/db'
import { getClaimNFT, provider } from '~/server/utils/chain'

/**
 * Mint a Claim NFT either on-chain (if CLAIM_NFT_ADDRESS is set) or generate
 * an off-chain placeholder token. The minted token is recorded in the
 * claim_nfts table and an event log is written.
 */
export async function issueClaimNFT(dealId: number, metadata = '') {
  const address = process.env.CLAIM_NFT_ADDRESS
  let tokenId: string

  if (address) {
    // On-chain issuance using ClaimNFT contract
    const signer = provider.getSigner()
    const contract = getClaimNFT(address, signer)
    const tx = await contract.issue(await signer.getAddress(), metadata)
    await tx.wait()
    tokenId = (await contract.nextTokenId()).toString()
  } else {
    // Fallback off-chain token id
    tokenId = `claim-${Math.random().toString(36).slice(2, 10)}`
  }

  await db.transaction(async (trx) => {
    await trx.insert(claimNfts).values({ deal_id: dealId, token_id: tokenId, metadata })
    await trx.insert(eventLogs).values({
      deal_id: dealId,
      source: 'APP',
      event_type: 'NFT',
      message: `Issued ${tokenId}`,
    })
  })

  return tokenId
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ dealId: number; metadata?: string }>(event)
  const tokenId = await issueClaimNFT(body.dealId ?? 0, body.metadata)
  return { id: tokenId }
})

