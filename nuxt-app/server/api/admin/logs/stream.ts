import { Readable } from 'node:stream'
import { db, eventLogs } from '~/server/utils/db'
import { desc, gt } from 'drizzle-orm'

export default eventHandler(async (event) => {
    setHeader(event, 'Content-Type', 'text/event-stream')
    setHeader(event, 'Cache-Control', 'no-cache')
    setHeader(event, 'Connection', 'keep-alive')

    const stream = new Readable({ read() {} })

    let lastId = 0
    const [last] = await db
        .select({ id: eventLogs.id })
        .from(eventLogs)
        .orderBy(desc(eventLogs.id))
        .limit(1)
    if (last) {
        lastId = last.id
    }

    const poll = async () => {
        const rows = await db
            .select()
            .from(eventLogs)
            .where(gt(eventLogs.id, lastId))
            .orderBy(eventLogs.id)
        for (const row of rows) {
            lastId = row.id
            const payload = {
                ...row,
                event_type: row.event_type === 'WAR_RISK' ? 'ORACLE' : row.event_type,
            }
            stream.push(`data: ${JSON.stringify(payload)}\n\n`)
        }
    }

    await poll()
    const interval = setInterval(poll, 1000)

    event.node.req.on('close', () => {
        clearInterval(interval)
        stream.push(null)
    })

    return stream
})