import logger from '../utils/logger'

export default defineEventHandler((event) => {
  const start = Date.now()

  event.node.res.on('finish', () => {
    const { method, url } = event.node.req
    const { statusCode } = event.node.res
    const duration = Date.now() - start
    logger.info({ method, url, statusCode, duration }, 'request completed')
  })
})

