const WebSocket = require('ws')
const axios = require('axios')

const appConfig = {
    binanceSpotURI: 'https://api.binance.com',
    binanceFuturesURI: 'https://fapi.binance.com',
    binanceSpotStreamURI: 'wss://stream.binance.com:9443/ws',
    binanceFuturesStreamURI: 'wss://fstream.binance.com/ws'
}

const getDifferencePercent = (val1, val2) => {
    if (typeof val1 === 'string' || typeof val2 === 'string') {
        val1 = parseFloat(val1)
        val2 = parseFloat(val2)
    }
    return (val2 - val1)/val1 * 100
}

const errorHandler = (err) => console.log(err.message)
const logger = (log) => console.log(log)


const setGlobals = () => {
    global.$getDifferencePercent = getDifferencePercent
    global.$WebSocket = WebSocket
    global.$appConfig = appConfig
    global.$axios = axios
    global.$errorHandler = errorHandler
    global.$logger = logger
}

module.exports = {
    setGlobals
}
