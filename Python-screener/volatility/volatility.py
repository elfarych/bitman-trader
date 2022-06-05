from functions import get_difference_percent
from volatility.volatility_telegram_sender import send_telegram_message

coins = []


def set_coins(new_coins):
    global coins
    coins = new_coins


def get_coins():
    return coins


def check_changes(new_coins):
    if len(get_coins()):
        for new_coin in new_coins:
            for coin in get_coins():
                if coin['symbol'] == new_coin['symbol']:
                    price_change_percent = get_difference_percent(coin['price'], new_coin['price'])
                    if abs(price_change_percent) > 5:
                        send_telegram_message(new_coin, price_change_percent)

    set_coins(new_coins)
