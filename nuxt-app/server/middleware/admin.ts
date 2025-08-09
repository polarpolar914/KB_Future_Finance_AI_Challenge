import { getRequestHeader, createError } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
    if (!event.path.startsWith('/api/admin')) return

    const auth = getRequestHeader(event, 'authorization')
    if (!auth) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    const token = auth.split(' ')[1]
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string)
        if ((payload as any).role !== 'admin') {
            throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
        }
        ;(event.context as any).admin = payload
    } catch {
        throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
    }
})