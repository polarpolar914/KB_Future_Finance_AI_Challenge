import cron from 'node-cron'
import logger from '../utils/logger'

async function refreshMarketData() {
    logger.info('Refreshing market data or war-risk adjustments')
    // TODO: implement actual refresh logic
}

export default defineNitroPlugin(() => {
    cron.schedule('0 * * * *', refreshMarketData)
})
