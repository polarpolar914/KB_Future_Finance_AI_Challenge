import { eventHandler, setHeader } from 'h3'
import { Readable } from 'node:stream'

interface ClaimEvent {
  dealId: number
  amount: number
  reason: string
  ts: number
}

const clients = new Set<Readable>()
let latest: ClaimEvent | null = null

export const broadcastClaim = (data: ClaimEvent) => {
  latest = data
  const payload = `data: ${JSON.stringify(data)}\n\n`
  for (const stream of clients) {
    stream.push(payload)
  }
}

export default eventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')

  const stream = new Readable({ read() {} })
  clients.add(stream)

  if (latest) {
    stream.push(`data: ${JSON.stringify(latest)}\n\n`)
  }

  event.node.req.on('close', () => {
    clients.delete(stream)
    stream.push(null)
  })

  return stream
})
