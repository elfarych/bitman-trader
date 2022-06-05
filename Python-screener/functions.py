import locale

locale.setlocale(locale.LC_ALL, '')


def get_difference_percent(val1, val2):
    val1 = float(val1)
    val2 = float(val2)
    return (val2 - val1) / val1 * 100


def get_formatted_value(val):
    val = int(val)
    return f'{val:,}'
