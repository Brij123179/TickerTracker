# datafetch.py

import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

TOP_50_TICKERS = [
    'MSFT', 'AAPL', 'NVDA', 'GOOGL', 'GOOG', 'AMZN', 'META', 'BRK-B', 'LLY', 'AVGO',
    'V', 'JPM', 'TSLA', 'WMT', 'XOM', 'UNH', 'MA', 'PG', 'JNJ', 'ORCL',
    'HD', 'COST', 'MRK', 'ABBV', 'CVX', 'CRM', 'BAC', 'AMD', 'NFLX', 'KO',
    'PEP', 'ADBE', 'TMO', 'LIN', 'WFC', 'CSCO', 'DIS', 'ACN', 'MCD', 'QCOM',
    'INTC', 'GE', 'PFE', 'CAT', 'INTU', 'AMAT', 'UBER', 'COP', 'IBM', 'NOW'
]

def get_top_stocks_data():
    """
    Yahoo Finance API का उपयोग करके टॉप 50 शेयरों का real-time डेटा प्राप्त करता है।
    """
    stock_data_list = []
    
    try:
        # एक साथ सभी टिकर के लिए डेटा प्राप्त करें
        tickers = yf.Tickers(' '.join(TOP_50_TICKERS))
        
        # वर्तमान समय और कल का समय
        end_date = datetime.now()
        start_date = end_date - timedelta(days=2)  # 2 दिन का डेटा लें
        
        for ticker_symbol in TOP_50_TICKERS:
            try:
                # टिकर ऑब्जेक्ट प्राप्त करें
                ticker = tickers.tickers[ticker_symbol]
                
                # हिस्टोरिकल डेटा प्राप्त करें (1m interval for intraday)
                hist = ticker.history(period='1d', interval='1m')
                
                if not hist.empty:
                    # सबसे recent price
                    current_price = hist['Close'].iloc[-1]
                    # पिछला close price (यesterday का close)
                    previous_close = hist['Close'].iloc[0] if len(hist) > 1 else current_price
                    
                    # परिवर्तन की गणना
                    change = current_price - previous_close
                    change_percent = (change / previous_close) * 100 if previous_close != 0 else 0
                    
                    # info डेटा
                    info = ticker.info
                    
                    stock_data = {
                        'ticker': ticker_symbol,
                        'name': info.get('shortName', ticker_symbol),
                        'price': round(current_price, 2),
                        'change': round(change, 2),
                        'change_percent': round(change_percent, 2),
                        'market_cap': info.get('marketCap', 0),
                        'volume': info.get('regularMarketVolume', hist['Volume'].iloc[-1] if not hist.empty else 0),
                        'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    }
                    stock_data_list.append(stock_data)
                else:
                    # अगर historical डेटा नहीं मिलता तो info से try करें
                    info = ticker.info
                    current_price = info.get('regularMarketPrice', info.get('currentPrice', 0))
                    previous_close = info.get('previousClose', current_price)
                    
                    change = current_price - previous_close
                    change_percent = (change / previous_close) * 100 if previous_close != 0 else 0
                    
                    stock_data = {
                        'ticker': ticker_symbol,
                        'name': info.get('shortName', ticker_symbol),
                        'price': round(current_price, 2),
                        'change': round(change, 2),
                        'change_percent': round(change_percent, 2),
                        'market_cap': info.get('marketCap', 0),
                        'volume': info.get('regularMarketVolume', 0),
                        'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    }
                    stock_data_list.append(stock_data)
                    
            except Exception as e:
                print(f"{ticker_symbol} के लिए डेटा प्राप्त करने में त्रुटि: {e}")
                continue
                
    except Exception as e:
        print(f"डेटा प्राप्त करने में त्रुटि: {e}")
        return []

    return stock_data_list

def get_real_time_prices():
    """
    Real-time prices के लिए alternative approach
    """
    try:
        # सभी टिकर एक स्ट्रिंग में
        tickers_str = ' '.join(TOP_50_TICKERS)
        
        # Real-time डेटा प्राप्त करें
        data = yf.download(tickers_str, period="1d", interval="1m", group_by='ticker')
        
        stock_data_list = []
        
        for ticker in TOP_50_TICKERS:
            if ticker in data:
                ticker_data = data[ticker]
                if not ticker_data.empty:
                    current_price = ticker_data['Close'].iloc[-1]
                    previous_close = ticker_data['Close'].iloc[0]
                    
                    change = current_price - previous_close
                    change_percent = (change / previous_close) * 100
                    
                    stock_data = {
                        'ticker': ticker,
                        'price': round(current_price, 2),
                        'change': round(change, 2),
                        'change_percent': round(change_percent, 2),
                        'volume': ticker_data['Volume'].iloc[-1]
                    }
                    stock_data_list.append(stock_data)
        
        return stock_data_list
        
    except Exception as e:
        print(f"Real-time डेटा प्राप्त करने में त्रुटि: {e}")
        return []

if __name__ == '__main__':
    # मुख्य फंक्शन टेस्ट
    data = get_top_stocks_data()
    if data:
        print(f"{len(data)} कंपनियों का डेटा सफलतापूर्वक प्राप्त हुआ।")
        print("पहला स्टॉक:", data[0])
        print("\nकुछ स्टॉक्स:")
        for i, stock in enumerate(data[:5]):
            print(f"{i+1}. {stock['ticker']}: ${stock['price']} ({stock['change_percent']:+.2f}%)")
    
    # Real-time डेटा भी टेस्ट करें
    print("\nReal-time डेटा:")
    real_time_data = get_real_time_prices()
    if real_time_data:
        for stock in real_time_data[:3]:
            print(f"{stock['ticker']}: ${stock['price']}")