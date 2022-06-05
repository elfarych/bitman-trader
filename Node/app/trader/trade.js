const WebSocket = require('ws')
let lossCount = 0
let profitCount = 0
let profitPercent = 0

let spotLossCount = 0
let spotProfitCount = 0
let spotProfitPercent = 0

const inTradeCoins = []


const startFuturesTrade = (symbol, stopAskSum, buy) => {
    if (buy) buyFuturesOrderSocket(symbol, stopAskSum)
    else sellFuturesOrderSocket(symbol, stopAskSum)
}

const startSpotTrade = (symbol, stopAskSum) => {
    buySpotOrderSocket(symbol, stopAskSum)
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
                \n\n Buy ${buyPrice}
            `)

        }

        if ($getDifferencePercent(buyPrice, data.c) <= -3) {
            lossCount ++
            deleteInTradesCoin(symbol)

            $botSendMessage(`
                ${symbol} Stop loss | FUTURES
                
                \n Buy ${buyPrice} -> Sell ${data.c} (-3%)
                
                \n\n Промежуточный итог Futures: 
                \n Убыточные сделки: ${lossCount} (${lossCount * 3}%)
                \n Прибыльные сделки: ${profitCount} (${profitPercent}%) 
                
                \n\n Промежуточный итог Spot: 
                \n Убыточные сделки: ${spotLossCount} (${spotLossCount * 5}%)
                \n Прибыльные сделки: ${spotProfitCount} (${spotProfitPercent}%)  
            `)
            ws.close()
        }

        if (askSum >= stopAskSum && $getDifferencePercent(buyPrice, data.c) >= 2.5) {
            profitCount ++
            profitPercent += $getDifferencePercent(buyPrice, data.c)
            deleteInTradesCoin(symbol)

            $botSendMessage(`
                ${symbol} Take profit | FUTURES
                \n Buy ${buyPrice} -> Sell ${data.c} (+${$getDifferencePercent(buyPrice, data.c).toFixed(2)}%)
                
                \n\n Промежуточный итог Futures: 
                \n Убыточные сделки: ${lossCount} (${lossCount * 3}%)
                \n Прибыльные сделки: ${profitCount} (${profitPercent}%) 
                
                \n\n Промежуточный итог Spot: 
                \n Убыточные сделки: ${spotLossCount} (${spotLossCount * 5}%)
                \n Прибыльные сделки: ${spotProfitCount} (${spotProfitPercent}%)  
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
                \n Sell ${sellPrice}
            `)
        }

        if ($getDifferencePercent(sellPrice, data.c) >= 3) {
            lossCount ++
            deleteInTradesCoin(symbol)

            $botSendMessage(`
                ${symbol} Stop loss | FUTURES
                
                \n Sell ${sellPrice} -> Buy ${data.c} (-3%)
                
                \n\n Промежуточный итог Futures: 
                \n Убыточные сделки: ${lossCount} (${lossCount * 3}%)
                \n Прибыльные сделки: ${profitCount} (${profitPercent}%) 
                
                \n\n Промежуточный итог Spot: 
                \n Убыточные сделки: ${spotLossCount} (${spotLossCount * 5}%)
                \n Прибыльные сделки: ${spotProfitCount} (${spotProfitPercent}%)  
                
                \n\n Открытые сделки: ${inTradeCoins.length}
            `)

            ws.close()
        }

        if (bidSum >= stopAskSum && $getDifferencePercent(sellPrice, data.c) <= -2.5) {
            profitCount ++
            profitPercent += $getDifferencePercent(sellPrice, data.c)
            deleteInTradesCoin(symbol)

            $botSendMessage(`
                ${symbol} Take profit | FUTURES
                
                \n Sell ${sellPrice} -> Buy ${data.c} (+${Math.abs($getDifferencePercent(sellPrice, data.c)).toFixed(2)}%)
                
                \n\n Промежуточный итог Futures: 
                \n Убыточные сделки: ${lossCount} (${lossCount * 3}%)
                \n Прибыльные сделки: ${profitCount} (${profitPercent}%) 
                
                \n\n Промежуточный итог Spot: 
                \n Убыточные сделки: ${spotLossCount} (${spotLossCount * 5}%)
                \n Прибыльные сделки: ${spotProfitCount} (${spotProfitPercent}%)  
                
                \n\n Открытые сделки: ${inTradeCoins.length}
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
                ${symbol} | SPOT
                \n Buy ${buyPrice}
            `)
        }

        if ($getDifferencePercent(buyPrice, data.c) <= -5) {
            spotLossCount ++
            deleteInTradesCoin(symbol)

            $botSendMessage(`
                ${symbol} Stop loss | SPOT
                
                \n Buy ${buyPrice} -> Sell ${data.c} (-5%)
                
                \n\n Промежуточный итог Futures: 
                \n Убыточные сделки: ${lossCount} (${lossCount * 3}%)
                \n Прибыльные сделки: ${profitCount} (${profitPercent}%) 
                
                \n\n Промежуточный итог Spot: 
                \n Убыточные сделки: ${spotLossCount} (${spotLossCount * 5}%)
                \n Прибыльные сделки: ${spotProfitCount} (${spotProfitPercent}%) 
                
                \n\n Открытые сделки: ${inTradeCoins.length} 
            `)

            ws.close()
        }

        if (askSum >= stopAskSum && $getDifferencePercent(buyPrice, data.c) >= 2.5) {
            spotProfitCount ++
            spotProfitPercent += $getDifferencePercent(buyPrice, data.c)
            deleteInTradesCoin(symbol)

            $botSendMessage(`
                ${symbol} Take profit | SPOT      
                \n Buy ${buyPrice} -> Sell ${data.c} (+${$getDifferencePercent(buyPrice, data.c).toFixed(2)}%)
                
                \n\n Промежуточный итог Futures: 
                \n Убыточные сделки ${lossCount} (${lossCount * 3}%)
                \n Прибыльные сделки ${profitCount} (${profitPercent}%) 
                
                \n\n Промежуточный итог Spot: 
                \n Убыточные сделки ${spotLossCount} (${spotLossCount * 5}%)
                \n Прибыльные сделки ${spotProfitCount} (${spotProfitPercent}%)  
                
                \n\n Открытые сделки ${inTradeCoins.length}
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


function deleteInTradesCoin(symbol) {
    const index = inTradeCoins.indexOf(symbol)
    if (index >= 0) inTradeCoins.splice(index, 1)
}

module.exports = {
    startFuturesTrade,
    startSpotTrade
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
