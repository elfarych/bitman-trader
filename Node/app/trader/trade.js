const WebSocket = require('ws')
let lossCount = 0
let profitCount = 0
let profitPercent = 0
const inTradeCoins = []


const start = (symbol, stopAskSum, buy) => {
    if (buy) buyOrderSocket(symbol, stopAskSum)
    else sellOrderSocket(symbol, stopAskSum)
}

const buyOrderSocket = (symbol, stopAskSum) => {
    // Data example
    // {
    //     "e": "24hrTicker",  // Event type
    //     "E": 123456789,     // Event time
    //     "s": "BNBBTC",      // Symbol
    //     "p": "0.0015",      // Price change
    //     "P": "250.00",      // Price change percent
    //     "w": "0.0018",      // Weighted average price
    //     "x": "0.0009",      // First trade(F)-1 price (first trade before the 24hr rolling window)
    //     "c": "0.0025",      // Last price
    //     "Q": "10",          // Last quantity
    //     "b": "0.0024",      // Best bid price
    //     "B": "10",          // Best bid quantity
    //     "a": "0.0026",      // Best ask price
    //     "A": "100",         // Best ask quantity
    // }
    if (inTradeCoins.includes(symbol)) {
        return null
    }

    inTradeCoins.push(symbol)
    let buyPrice

    const ws = new WebSocket(`${$appConfig.binanceFuturesStreamURI}/${symbol.toLowerCase()}@miniTicker`)
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        const askSum = parseFloat(data.a) * parseFloat(data.A)
        if (!buyPrice) {
            buyPrice = data.c
            console.log(`https://www.binance.com/ru/futures/${symbol}`)
            console.log(`Buy price ${buyPrice} ${new Date()}`)
        }

        if ($getDifferencePercent(buyPrice, data.c) <= -5) {
            lossCount ++
            console.log(`Loss ${lossCount} | ${symbol} -> buy ${buyPrice} stop ${data.c}`)
            ws.close()
            deleteInTradesCoin(symbol)
        }

        if (askSum >= stopAskSum && $getDifferencePercent(buyPrice, data.c) >= 2.5) {
            profitCount ++
            profitPercent += $getDifferencePercent(buyPrice, data.c)
            console.log(`Profit ${profitCount} (${profitPercent}%) | ${symbol} -> buy ${buyPrice} stop ${data.c} + ${$getDifferencePercent(buyPrice, data.c)}`)
            ws.close()
            deleteInTradesCoin(symbol)
        }
    }
}


const sellOrderSocket = (symbol, stopAskSum) => {
    // Data example
    // {
    //     "e": "24hrTicker",  // Event type
    //     "E": 123456789,     // Event time
    //     "s": "BNBBTC",      // Symbol
    //     "p": "0.0015",      // Price change
    //     "P": "250.00",      // Price change percent
    //     "w": "0.0018",      // Weighted average price
    //     "x": "0.0009",      // First trade(F)-1 price (first trade before the 24hr rolling window)
    //     "c": "0.0025",      // Last price
    //     "Q": "10",          // Last quantity
    //     "b": "0.0024",      // Best bid price
    //     "B": "10",          // Best bid quantity
    //     "a": "0.0026",      // Best ask price
    //     "A": "100",         // Best ask quantity
    // }
    if (inTradeCoins.includes(symbol)) {
        return null
    }
    console.log(`https://www.binance.com/ru/futures/${symbol}`)

    inTradeCoins.push(symbol)
    let sellPrice

    const ws = new WebSocket(`${$appConfig.binanceFuturesStreamURI}/${symbol.toLowerCase()}@miniTicker`)
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        const bidSum = parseFloat(data.b) * parseFloat(data.B)
        if (!sellPrice) {
            sellPrice = data.c
            console.log(`https://www.binance.com/ru/futures/${symbol}`)
            console.log(`Sell price ${sellPrice} - ${new Date()}`)
        }

        if ($getDifferencePercent(sellPrice, data.c) >= 5) {
            lossCount ++
            console.log(`Loss ${lossCount} | ${symbol} -> sell ${sellPrice} stop ${data.c}`)
            ws.close()
            deleteInTradesCoin(symbol)
        }

        if (bidSum >= stopAskSum && $getDifferencePercent(sellPrice, data.c) <= -2.5) {
            profitCount ++
            profitPercent += $getDifferencePercent(sellPrice, data.c)
            console.log(`Profit ${profitCount} (${profitPercent}%) | ${symbol} -> sell ${sellPrice} stop ${data.c} + ${Math.abs($getDifferencePercent(sellPrice, data.c))}`)
            ws.close()
            deleteInTradesCoin(symbol)
        }
    }
}


function deleteInTradesCoin(symbol) {
    const index = inTradeCoins.indexOf(symbol)
    if (index >= 0) inTradeCoins.splice(index, 1)
}

module.exports = {
    start
}
