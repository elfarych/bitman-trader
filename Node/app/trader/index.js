const trade = require('./trade')

let futuresCoinsSymbols
let allTradeCoins
let allTradeCoinsSymbols
let allTradeCoinsObj
let tradeCoins
let tradeCoinsObj
let tradeCoinsSymbols
let nonFuturesTradeCoins
let nonFuturesTradeCoinsObj
let nonFuturesTradeCoinsSymbols
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
        const bidSum = data.b * data.B

        // Анализ фьючерсных пар
        // if (tradeCoinsSymbols.includes(data.s)) {
        //     const quoteVolume = parseFloat(tradeCoinsObj[data.s]?.quoteVolume)
        //     const askSum = data.a * data.A
        //     if (bidSum >= quoteVolume * 0.088) {
        //         trade.startFuturesTrade(data.s, quoteVolume * 0.044, true)
        //     }
        //     if (askSum >= quoteVolume * 0.088) {
        //         trade.startFuturesTrade(data.s, quoteVolume * 0.044, false)
        //     }
        // }

        // Анализ пар SPOT
        if (allTradeCoinsSymbols.includes(data.s)) {
            const quoteVolume = parseFloat(allTradeCoinsObj[data.s]?.quoteVolume)
            if (bidSum >= quoteVolume * 0.1 && quoteVolume > 500000) {
                trade.startSpotTrade(data.s, quoteVolume * 0.07)
            }
        }
    }
}


const tradesStream = () => {
    tradeCoinsSymbols.forEach(symbol => startTradesStream(symbol, false))
    nonFuturesTradeCoinsSymbols.forEach(symbol => startTradesStream(symbol, true))
}


const startTradesStream = (symbol, spot = false) => {
    // Data example
    // {
    //     "e": "trade",     // Event type
    //     "E": 123456789,   // Event time
    //     "s": "BNBBTC",    // Symbol
    //     "t": 12345,       // Trade ID
    //     "p": "0.001",     // Price
    //     "q": "100",       // Quantity
    //     "b": 88,          // Buyer order ID
    //     "a": 50,          // Seller order ID
    //     "T": 123456785,   // Trade time
    //     "m": true,        // Is the buyer the market maker?
    //     "M": true         // Ignore
    // }
    const ws = new $WebSocket(`${$appConfig.binanceSpotStreamURI}/${symbol.toLowerCase()}@trade`)
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.m) {
            const sum = data.p * data.q
            const quoteVolume = parseFloat(allTradeCoinsObj[data.s]?.quoteVolume)
            if (sum >= quoteVolume * 0.075) {
                if (spot) trade.startSpotTrade(data.s, quoteVolume * 0.05)
                else trade.startFuturesTrade(data.s, quoteVolume * 0.044, true)
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

const getTradeFilteredCoins = async () => {
    try {
        await $axios(`${$appConfig.binanceSpotURI}/api/v3/ticker/24hr`)
            .then(res => {
                // tradeCoins = res.data
                //     .filter(item => item.symbol.endsWith('USDT') // Только пары с USDT
                //         && !fiatSymbols.includes(item.symbol.replace('USDT', '')) // Исключаем фиат и стейблы
                //         && futuresCoinsSymbols.includes(item.symbol) // Только пары с фьючерсами
                //     )
                // nonFuturesTradeCoins = res.data
                //     .filter(item => item.symbol.endsWith('USDT') // Только пары с USDT
                //         && !fiatSymbols.includes(item.symbol.replace('USDT', '')) // Исключаем фиат и стейблы
                //         && !futuresCoinsSymbols.includes(item.symbol) // Только пары без фьючерсами
                //     )
                allTradeCoins = res.data.filter(item =>
                    item.symbol.endsWith('USDT')
                    && !fiatSymbols.includes(item.symbol.replace('USDT', '')) // Исключаем фиат и стейблы
                ) // Все пары с USDT
                allTradeCoinsSymbols = allTradeCoins.map(item => item.symbol)

                // tradeCoinsSymbols = tradeCoins.map(item => item.symbol)
                // nonFuturesTradeCoinsSymbols = nonFuturesTradeCoins.map(item => item.symbol)

                // nonFuturesTradeCoinsObj = getTradeCoinsObjects(nonFuturesTradeCoins)
                // tradeCoinsObj = getTradeCoinsObjects(tradeCoins)
                allTradeCoinsObj = getTradeCoinsObjects(allTradeCoins)
            })
    } catch (err) {
        $errorHandler(err)
    }
}

const getTradeCoinsObjects = (coins) => {
    const tradeCoinsObject = {}
    coins.forEach(item => {
        tradeCoinsObject[item.symbol] = item
    })
    return tradeCoinsObject
}

const start = async () => {
    await getFuturesTradeCoins()
    await getTradeFilteredCoins()
    startStream()
    // tradesStream()
    setInterval(() => {
        getTradeFilteredCoins()
    }, 60000)

    setInterval(() => {
        trade.report()
    }, 1000*60*60)
}


module.exports = {
    start
}
