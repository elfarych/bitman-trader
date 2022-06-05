import requests
import time
import locale

from functions import get_difference_percent, get_formatted_value
from density.density_telegram_sender import send_telegram_message
from volatility.volatility import check_changes

densities = []
locale.setlocale(locale.LC_ALL, '')


def start():
    get_coins()


def get_coins():
    r = requests.get('https://fapi.binance.com/fapi/v1/ticker/price')
    data = r.json()
    print(f'Coins len {len(data)}')
    start_time = time.time()
    for coin in data:
        if 'symbol' in coin and coin['symbol'].endswith('USDT'):
            get_orders_book(coin)
            time.sleep(2)

    print(f'Time {time.time() - start_time} second')
    check_changes(data)
    start()


def get_orders_book(coin):
    params = {
        'symbol': coin['symbol'],
        'limit': 5000
    }

    r = requests.get('https://api1.binance.com/api/v3/depth', params=params)
    data = r.json()
    orders_handler(data, coin)


def orders_handler(orders, coin):
    if orders and 'bids' in orders:
        bids = orders['bids'] or []
        asks = orders['asks'] or []
        density_value = get_density_value(coin)
        find_density(bids, density_value, coin)
        find_density(asks, density_value, coin)


def get_density_value(coin):
    symbol = coin['symbol'].replace('USDT', '')

    if symbol == 'BTC':
        return 5000000
    if symbol == 'ETH':
        return 4000000
    if symbol == 'BNB':
        return 3000000
    if symbol == 'XRP':
        return 2000000
    if symbol == 'SOL':
        return 1000000
    if symbol == 'LTC':
        return 800000
    if symbol == 'BCH':
        return 700000
    return 500000


def find_density(orders, density_value, coin):
    for order in orders:
        price = float(order[0])
        quantity = float(order[1])
        sum = price * quantity

        if sum >= density_value and abs(get_difference_percent(price, coin['price'])) <= 2:
            get_coin_candles(coin, sum, price)


def get_coin_candles(coin, density_sum, density_price):
    params = {'symbol': coin['symbol'], 'interval': '1h', 'limit': 2}

    r = requests.get('https://api2.binance.com/api/v3/klines', params=params)
    candles = r.json()
    candle = candles[0]
    volume = float(candle[7])
    volume_in_5_min = volume / 12

    if volume_in_5_min * 2 < density_sum:
        density = {
            'symbol': coin['symbol'],
            'price': coin['price'],
            'density_price': density_price,
            'density_sum': density_sum,
            'density_sum_formatted': get_formatted_value(density_sum),
            'symbol_5_min_volume': volume_in_5_min,
            'symbol_5_min_volume_formatted': get_formatted_value(volume_in_5_min)
        }

        if check_density_in_densities(density):
            return

        densities.append(density)
        send_telegram_message(density)


def check_density_in_densities(density):
    in_densities = False
    for i in densities:
        if i['symbol'] == density['symbol'] and i['density_price'] == density['density_price']:
            in_densities = True

    return in_densities
