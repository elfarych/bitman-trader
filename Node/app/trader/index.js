const trade = require('./trade')

let futuresCoinsSymbols
let tradeCoins
let tradeCoinsSymbols
const fiatSymbols = ['AUD', 'BDR', 'BRL', 'EUR', 'GBP', 'RUB', 'TRY', 'TUSD', 'USDC', 'DAI', 'UAH', 'VAI', 'IDRT', 'NGN', 'USDP', 'BTTC', 'BUSD']


const startStream = () => {
    // Data example
    // {
    //     "u":400900217,     // order book updateId
    //     "s":"BNBUSDT",     // symbol
    //     "b":"25.35190000", // best bid price
    //     "B":"31.21000000", // best bid qty
    //     "a":"25.36520000", // best ask price
    //     "A":"40.66000000"  // best ask qty
    // }
    const ws = new $WebSocket(`${$appConfig.binanceSpotStreamURI}/!bookTicker`)
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (tradeCoinsSymbols.includes(data.s)) {
            const coin = tradeCoins.find(item => item.symbol === data.s)
            const bidSum = data.b * data.B
            const askSum = data.a * data.A
            if (bidSum >= parseFloat(coin.quoteVolume) * 0.05) {
                trade.start(data.s, coin.quoteVolume * 0.025, true)
            }
            if (askSum >= parseFloat(coin.quoteVolume) * 0.05) {
                trade.start(data.s,coin.quoteVolume * 0.025, false)
            }
        }
    }
}


const getFuturesTradeCoins = async () => {
    try {
        await $axios(`${$appConfig.binanceFuturesURI}/fapi/v1/ticker/price`)
            .then(res => {
                futuresCoinsSymbols = res.data.map(item => item.symbol)
            })
    } catch (err) {
        $errorHandler(err)
    }
}

const getSpotTradeFilteredCoins = async () => {
    try {
        await $axios(`${$appConfig.binanceSpotURI}/api/v3/ticker/24hr`)
            .then(res => {
                tradeCoins = res.data
                    .filter(item => item.symbol.endsWith('USDT') // Только пары с USDT
                        && !fiatSymbols.includes(item.symbol.replace('USDT', '')) // Исключаем фиат и стейблы
                        && futuresCoinsSymbols.includes(item.symbol) // Только пары с фьючерсами
                    )
                tradeCoinsSymbols = tradeCoins.map(item => item.symbol)
            })
    } catch (err) {
        $errorHandler(err)
    }
}

const start = async () => {
    await getFuturesTradeCoins()
    await getSpotTradeFilteredCoins()
    startStream()
}


module.exports = {
    start
}
