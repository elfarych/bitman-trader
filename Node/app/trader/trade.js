const WebSocket = require('ws')
let lossCount = 0
let profitCount = 0
let profitPercent = 0

let spotLossCount = 0
let spotProfitCount = 0
let spotProfitPercent = 0

const inTradeCoins = []


const report = () => {
    $botSendMessage(`
    Открытые сделки: ${inTradeCoins.length}
    
    Закрытые сделки:
    Убыточные сделки: ${spotLossCount} (-${spotLossCount * 5}%)
    Прибыльные сделки: ${spotProfitCount} (+${spotProfitPercent.toFixed(2)}%) 
    `)
}


const startFuturesTrade = (symbol, stopAskSum, buy) => {
    if (buy) buyFuturesOrderSocket(symbol, stopAskSum)
    else sellFuturesOrderSocket(symbol, stopAskSum)
}

const startSpotTrade = async (symbol, stopAskSum) => {
    const lastChangePercent = await getLastPriceChangePercent(symbol)
    if(lastChangePercent < 3) buySpotOrderSocket(symbol, stopAskSum)
}

const buyFuturesOrderSocket = (symbol, stopAskSum) => {
    if (inTradeCoins.includes(symbol)) {
        return null
    }

    inTradeCoins.push(symbol)
    let buyPrice

    const ws = new WebSocket(`${$appConfig.binanceSpotStreamURI}/${symbol.toLowerCase()}@ticker`)
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        const askSum = parseFloat(data.a) * parseFloat(data.A)
        if (!buyPrice) {
            buyPrice = data.c

            $botSendMessage(`
                ${symbol} | FUTURES
                Buy ${buyPrice}
            `)

        }

        if ($getDifferencePercent(buyPrice, data.c) <= -3) {
            lossCount ++
            deleteInTradesCoin(symbol)

            $botSendMessage(`
                ${symbol} Stop loss | FUTURES
                Buy ${buyPrice} -> Sell ${data.c} (-3%)
            `)
            ws.close()
        }

        if (askSum >= stopAskSum && $getDifferencePercent(buyPrice, data.c) >= 3) {
            profitCount ++
            profitPercent += $getDifferencePercent(buyPrice, data.c)
            deleteInTradesCoin(symbol)

            $botSendMessage(`
                ${symbol} Take profit | FUTURES
                Buy ${buyPrice} -> Sell ${data.c} (+${$getDifferencePercent(buyPrice, data.c).toFixed(2)}%)
            `)
            ws.close()
        }
    }
    ws.onclose = event => {
        if (!event.wasClean) {
            ws.resume()
        }
    }
}


const sellFuturesOrderSocket = (symbol, stopAskSum) => {
    if (inTradeCoins.includes(symbol)) {
        return null
    }

    inTradeCoins.push(symbol)
    let sellPrice

    const ws = new WebSocket(`${$appConfig.binanceSpotStreamURI}/${symbol.toLowerCase()}@ticker`)
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        const bidSum = parseFloat(data.b) * parseFloat(data.B)
        if (!sellPrice) {
            sellPrice = data.c

            $botSendMessage(`
                ${symbol} | FUTURES
                Sell ${sellPrice}
            `)
        }

        if ($getDifferencePercent(sellPrice, data.c) >= 3) {
            lossCount ++
            deleteInTradesCoin(symbol)

            $botSendMessage(`
                ${symbol} Stop loss | FUTURES
                Sell ${sellPrice} -> Buy ${data.c} (-3%)
            `)

            ws.close()
        }

        if (bidSum >= stopAskSum && $getDifferencePercent(sellPrice, data.c) <= -3) {
            profitCount ++
            profitPercent += $getDifferencePercent(sellPrice, data.c)
            deleteInTradesCoin(symbol)

            $botSendMessage(`
                ${symbol} Take profit | FUTURES
                Sell ${sellPrice} -> Buy ${data.c} (+${Math.abs($getDifferencePercent(sellPrice, data.c)).toFixed(2)}%)
            `)

            ws.close()
        }
    }
    ws.onclose = event => {
        if (!event.wasClean) {
            ws.resume()
        }
    }
}


const buySpotOrderSocket = (symbol, stopAskSum) => {
    if (inTradeCoins.includes(symbol)) {
        return null
    }

    inTradeCoins.push(symbol)
    let buyPrice

    const ws = new WebSocket(`${$appConfig.binanceSpotStreamURI}/${symbol.toLowerCase()}@ticker`)
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        const askSum = parseFloat(data.a) * parseFloat(data.A)
        if (!buyPrice) {
            buyPrice = data.c
            $botSendMessage(`
                ${symbol} | SPOT \n Buy ${buyPrice}
            `)
        }

        if ($getDifferencePercent(buyPrice, data.c) <= -5) {
            spotLossCount ++
            deleteInTradesCoin(symbol)

            $botSendMessage(`
                ${symbol} Stop loss | SPOT \n Buy ${buyPrice} -> Sell ${data.c} (-5%)
            `)

            ws.close()
        }

        if (askSum >= stopAskSum && $getDifferencePercent(buyPrice, data.c) >= 5.5) {
            spotProfitCount ++
            spotProfitPercent += $getDifferencePercent(buyPrice, data.c)
            deleteInTradesCoin(symbol)

            $botSendMessage(`
                ${symbol} Take profit | SPOT \n Buy ${buyPrice} -> Sell ${data.c} (+${$getDifferencePercent(buyPrice, data.c).toFixed(2)}%)
            `)
            ws.close()
        }
    }
    ws.onclose = event => {
        if (!event.wasClean) {
            ws.resume()
        }
    }

}


const getLastPriceChangePercent = async (symbol) => {
    let changePercent = 100
    try {
        await $axios(`${$appConfig.binanceSpotURI}/api/v3/klines`, {
            params: {
                symbol,
                interval: '5m',
                limit: 2
            }
        }).then(res => changePercent = $getDifferencePercent(res.data[0][1], res.data[1][4]))
    } catch (err) {
        await $errorHandler(err)
    }
    return changePercent
}


function deleteInTradesCoin(symbol) {
    const index = inTradeCoins.indexOf(symbol)
    if (index >= 0) inTradeCoins.splice(index, 1)
}

module.exports = {
    startFuturesTrade,
    startSpotTrade,
    report
}


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
