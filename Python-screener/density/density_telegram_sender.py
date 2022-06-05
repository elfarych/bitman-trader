import telebot
from telebot import types
import requests

bot = telebot.TeleBot('5336001310:AAEAEJXYqk9yRuiIZ8DDe_HPRqDla2DPAzg')
chat_id = '-1001672957008'
img_creator_key = 'd6SAymYj7E3nsIATWmwXI67T49JbNpX58WvMjt4u'


def send_telegram_message(density):
    r = requests.get(f'https://api.chart-img.com/v1/tradingview/advanced-chart?symbol=BINANCE:{density["symbol"]}PERP&interval=5m&key={img_creator_key}')
    symbol = density['symbol'].replace('USDT', '').replace('BUSD', '')
    futures_url = f"https://www.binance.com/ru/futures/{density['symbol']}?ref=CPA_001NFUGKRY"
    futures_url_btn = types.InlineKeyboardButton(text=f"Futures {density['symbol']}", url=futures_url)
    spot_url = f"https://www.binance.com/ru/trade/{density['symbol'].replace('USDT', '_USDT')}?theme=dark&type=spot&ref=CPA_001NFUGKRY"
    spot_url_btn = types.InlineKeyboardButton(text=f"Spot {density['symbol']}", url=spot_url)
    bitman_url = f'https://bitman.trade/#/market/{symbol}'
    bitman_url_btn = types.InlineKeyboardButton(text='Подробнее', url=bitman_url)

    keyboard = types.InlineKeyboardMarkup()
    keyboard.add(bitman_url_btn)
    keyboard.add(futures_url_btn)
    keyboard.add(spot_url_btn)

    text = f'=====  {density["symbol"]}  ===== \n\n' \
           f'Цена: {density["price"]}$ \n' \
           f'Плотность на цене: {density["density_price"]}$ \n' \
           f'На сумму: {density["density_sum_formatted"]}$ \n' \
           f'Средний объем за 5 минут: {density["symbol_5_min_volume_formatted"]}$ \n\n' \
           f'[Binance Futures ({density["symbol"]})]({futures_url}) \n' \
           f'[Binance Spot ({density["symbol"]})]({spot_url}) \n'

    bot.send_photo(chat_id, r.content, caption=text, parse_mode="Markdown")
    # bot.send_message(chat_id, text=text, reply_markup=keyboard)
