import cron from 'node-cron'

async function refreshMarketData() {
    console.log('Refreshing market data or war-risk adjustments')
    // TODO: implement actual refresh logic
}

export default defineNitroPlugin(() => {
    cron.schedule('0 * * * *', refreshMarketData)
})