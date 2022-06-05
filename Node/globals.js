const WebSocket = require('ws')
const axios = require('axios')
const TelegramBot = require('node-telegram-bot-api')

const appConfig = {
    binanceSpotURI: 'https://api.binance.com',
    binanceFuturesURI: 'https://fapi.binance.com',
    binanceSpotStreamURI: 'wss://stream.binance.com:9443/ws',
    binanceFuturesStreamURI: 'wss://fstream.binance.com/ws',
    tgBotChatId: -1001655051107,
    tgBotToken: '5530230296:AAF95jjdB7CZvnbUOzZnGm5vXTcrOA_wMa0'
}

const token = appConfig.tgBotToken
const bot = new TelegramBot(token, { polling: true })


const getDifferencePercent = (val1, val2) => {
    if (typeof val1 === 'string' || typeof val2 === 'string') {
        val1 = parseFloat(val1)
        val2 = parseFloat(val2)
    }
    return (val2 - val1)/val1 * 100
}

const errorHandler = (err) => bot.sendMessage(appConfig.tgBotChatId, err.message)
const logger = (log) => bot.sendMessage(appConfig.tgBotChatId, log)

const botSendMessage = (message) => bot.sendMessage(appConfig.tgBotChatId, message)


const setGlobals = () => {
    global.$getDifferencePercent = getDifferencePercent
    global.$WebSocket = WebSocket
    global.$appConfig = appConfig
    global.$axios = axios
    global.$errorHandler = errorHandler
    global.$logger = logger
    global.$botSendMessage = botSendMessage
}

module.exports = {
    setGlobals
}
