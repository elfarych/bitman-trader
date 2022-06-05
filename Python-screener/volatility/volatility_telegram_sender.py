from decimal import Decimal
import requests
import telebot
from telebot import types


bot = telebot.TeleBot('5336001310:AAEAEJXYqk9yRuiIZ8DDe_HPRqDla2DPAzg')
chat_id = '-1001672957008'
img_creator_key = 'd6SAymYj7E3nsIATWmwXI67T49JbNpX58WvMjt4u'


def send_telegram_message(coin, change_percent):
    r = requests.get(f'https://api.chart-img.com/v1/tradingview/advanced-chart?symbol=BINANCE:{coin["symbol"]}PERP&interval=5m&key={img_creator_key}')
    symbol = coin['symbol'].replace('USDT', '').replace('BUSD', '')
    futures_url = f"https://www.binance.com/ru/futures/{coin['symbol']}?ref=CPA_001NFUGKRY"
    futures_url_btn = types.InlineKeyboardButton(text=f"Futures {coin['symbol']}", url=futures_url)
    spot_url = f"https://www.binance.com/ru/trade/{coin['symbol'].replace('USDT', '_USDT')}?theme=dark&type=spot&ref=CPA_001NFUGKRY"
    spot_url_btn = types.InlineKeyboardButton(text=f"Spot {coin['symbol']}", url=spot_url)
    bitman_url = f'https://bitman.trade/#/market/{symbol}'
    bitman_url_btn = types.InlineKeyboardButton(text='Подробнее', url=bitman_url)

    keyboard = types.InlineKeyboardMarkup()
    keyboard.add(bitman_url_btn)
    keyboard.add(futures_url_btn)
    keyboard.add(spot_url_btn)

    text = f'=====  {coin["symbol"]}  ===== \n\n' \
           f'Изменение цены: {round(Decimal(change_percent), 2)}% \n' \
           f'Интервал: менее 10 минут \n' \
           f'Текушая цена: {coin["price"]} \n\n' \
           f'[Binance Futures ({coin["symbol"]})]({futures_url}) \n' \
           f'[Binance Spot ({coin["symbol"]})]({spot_url}) \n'

    bot.send_photo(chat_id, r.content, caption=text, parse_mode="Markdown")
    # bot.send_photo(chat_id, r.content, caption=text, reply_markup=keyboard)
    # bot.send_message(chat_id, text=text, reply_markup=keyboard)