const $axios = require('axios')

let coins
let ordersAskDifferencesArr = []
let ordersBidDifferencesArr = []
const fiatSymbols = ['AUD', 'BDR', 'BRL', 'EUR', 'GBP', 'RUB', 'TRY', 'TUSD', 'USDC', 'DAI', 'UAH', 'VAI', 'IDRT', 'NGN', 'USDP', 'BTTC', 'BUSD']

const $getDifferencePercent = (val1, val2) => {
    if (typeof val1 === 'string' || typeof val2 === 'string') {
        val1 = parseFloat(val1)
        val2 = parseFloat(val2)
    }
    return (val2 - val1) / val1 * 100
}

const getCoins = async () => {
    try {
        await $axios(`https://api.binance.com/api/v3/ticker/24hr`)
            .then(res => {
                coins = res.data
                    .filter(item => item.symbol.endsWith('USDT') // Только пары с USDT
                        && !fiatSymbols.includes(item.symbol.replace('USDT', '')) // Исключаем фиат и стейблы
                        && parseFloat(item.quoteVolume) < 20000000
                    )
                console.log(coins.length)
            })
    } catch (err) {
        console.log(err.message)
    }
}


const getOrders = async (sliceStart, sliceEnd) => {
    coins.slice(sliceStart, sliceEnd).forEach(item => {
        if (!item) return null
        try {
             $axios(`https://api.binance.com/api/v3/depth`, {
                 params: {
                     limit: 999,
                     symbol: item.symbol
                 }
             })
                .then(res => {
                    console.log('loaded...')
                    let bidsSum = 0
                    res.data.bids.forEach(item => {
                        bidsSum += item[0] * item[1]
                    })
                    let asksSum = 0
                    res.data.asks.forEach(item => {
                        asksSum += item[0] * item[1]
                    })
                    ordersAskDifferencesArr.push({ symbol: item.symbol.replace('USDT', ''), difference: $getDifferencePercent(bidsSum, asksSum) })
                    ordersBidDifferencesArr.push({ symbol: item.symbol.replace('USDT', ''), difference: $getDifferencePercent(asksSum, bidsSum) })
                })
        } catch (err) {
            console.log(err.message)
        }
    })
}


getCoins().then(() => {
    let sliceStart = 0
    let sliceEnd = 80
    let count = 1

    const interval = setInterval(async () => {
        await getOrders(sliceStart, sliceEnd)
        sliceStart += 80
        sliceEnd += 80
        count ++
        if (count === 9) {
            clearInterval(interval)
            showCoins()
        }
    }, 4000)
})


const showCoins = () => {
    const sortedAskArr = ordersAskDifferencesArr.sort((a, b) => a.difference < b.difference ? 1 : -1)
    const sortedBidArr = ordersBidDifferencesArr.sort((a, b) => a.difference < b.difference ? 1 : -1)

    console.log('asks ', sortedAskArr.slice(0, 15))
    console.log('bids ', sortedBidArr.slice(0, 15))
}
