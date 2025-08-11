import { db, eventLogs, claimNfts } from '~/server/utils/db'
import { getClaimNFT, provider } from '~/server/utils/chain'
import { createError } from 'h3'

export default defineEventHandler(async () => {
  const address = process.env.CLAIM_NFT_ADDRESS
  if (!address) {
    throw createError({ statusCode: 500, statusMessage: 'CLAIM_NFT_ADDRESS not set' })
  }
  const signer = provider.getSigner()
  const contract = getClaimNFT(address, signer)
  const tx = await contract.issue(await signer.getAddress(), '')
  await tx.wait()
  const tokenId = (await contract.nextTokenId()).toString()
  await db.transaction(async (trx) => {
    await trx.insert(claimNfts).values({ deal_id: 1, token_id: tokenId })
    await trx.insert(eventLogs).values({ source: 'APP', event_type: 'NFT', message: `Issued ${tokenId}` })
  })
  return { id: tokenId }
})

