import yfinance as yf
from datetime import datetime, timedelta
import ssl

# --- Global fix for the SSL Certificate Error ---
ssl._create_default_https_context = ssl._create_unverified_context


# --- Define Symbol Lists for Different Markets ---
NIFTY_50_STOCKS = [
    "ADANIENT.NS", "ADANIPORTS.NS", "APOLLOHOSP.NS", "ASIANPAINT.NS", "AXISBANK.NS",
    "BAJAJ-AUTO.NS", "BAJFINANCE.NS", "BAJAJFINSV.NS", "BPCL.NS", "BHARTIARTL.NS",
    "BRITANNIA.NS", "CIPLA.NS", "COALINDIA.NS", "DIVISLAB.NS", "DRREDDY.NS",
    "EICHERMOT.NS", "GRASIM.NS", "HCLTECH.NS", "HDFCBANK.NS", "HDFCLIFE.NS",
    "HEROMOTOCO.NS", "HINDALCO.NS", "HINDUNILVR.NS", "ICICIBANK.NS", "ITC.NS",
    "INDUSINDBK.NS", "INFY.NS", "JSWSTEEL.NS", "KOTAKBANK.NS", "LTIM.NS",
    "LT.NS", "M&M.NS", "MARUTI.NS", "NTPC.NS", "NESTLEIND.NS", "ONGC.NS",
    "POWERGRID.NS", "RELIANCE.NS", "SBILIFE.NS", "SHRIRAMFIN.NS", "SBIN.NS",
    "SUNPHARMA.NS", "TCS.NS", "TATACONSUM.NS", "TATAMOTORS.NS", "TATASTEEL.NS",
    "TECHM.NS", "TITAN.NS", "ULTRACEMCO.NS", "WIPRO.NS"
]

INDIAN_INDICES = ["^NSEI", "^NSEBANK", "^BSESN"]
COMMODITIES = ["GC=F", "SI=F", "CL=F"]
US_STOCKS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "BRK-B", "JPM", "V"]

SECTOR_MAP = {
    "RELIANCE.NS": "Energy", "TCS.NS": "IT", "INFY.NS": "IT", "HDFCBANK.NS": "Finance",
    "ICICIBANK.NS": "Finance", "LT.NS": "Construction", "MARUTI.NS": "Auto",
    "SBIN.NS": "Finance", "WIPRO.NS": "IT", "BHARTIARTL.NS": "Telecom"
}

def fetch_stock_data(symbol):
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        hist = stock.history(period="1d")
        if hist.empty:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=1)
            hist = stock.history(start=start_date, end=end_date, interval="15m")
            if hist.empty: return None
        latest = hist.iloc[-1]
        previous_close = info.get('previousClose', latest['Open'])
        hist_30 = stock.history(period="30d")
        start_price = hist_30['Close'].iloc[0]
        end_price = hist_30['Close'].iloc[-1]
        change_percent_30d = ((end_price - start_price) / start_price) * 100 if start_price != 0 else 0
        volatility = hist_30['Close'].pct_change().std() * 100
        risk = "Low" if volatility < 2 else "Moderate" if volatility < 4 else "High"
        return {
            "symbol": symbol, "company": info.get('longName', info.get('shortName', symbol)),
            "price": round(latest['Close'], 2), "change": round(latest['Close'] - previous_close, 2),
            "change_percent": round(((latest['Close'] - previous_close) / previous_close) * 100, 2) if previous_close != 0 else 0,
            "volume": int(latest['Volume']) if 'Volume' in latest and latest['Volume'] is not None else 0,
            "market_cap": info.get('marketCap'), "pe_ratio": info.get('trailingPE'),
            "volatility_percent": round(volatility, 2), "change_percent_30d": round(change_percent_30d, 2), "risk": risk,
            "sector": info.get('sector', SECTOR_MAP.get(symbol, "N/A"))
        }
    except Exception as e:
        print(f"Could not fetch data for {symbol}: {e}")
        return None

def market_mood_barometer(stocks):
    if not stocks: return {"mood": "Neutral", "confidence": 0}
    up = sum(1 for s in stocks if s['change'] > 0)
    down = sum(1 for s in stocks if s['change'] < 0)
    mood = "Optimistic" if up >= down else "Fearful"
    confidence = round(abs(up - down) / len(stocks) * 100, 2)
    return {"mood": mood, "confidence": confidence}

def sector_sentiment(stocks):
    sectors = {}
    for s in stocks:
        sec = s['sector']
        if sec not in sectors and sec != "N/A": sectors[sec] = []
        if sec != "N/A": sectors[sec].append(s['change'])
    return {sec: round(sum(vals) / len(vals), 2) for sec, vals in sectors.items() if vals}

def upcoming_events():
    return [
        {"event": "RBI Monetary Policy", "date": "Dec 5, 2025", "impact": "High", "predicted": "No Change"},
        {"event": "Infosys Q3 Earnings", "date": "Jan 12, 2026", "impact": "Medium", "predicted": "+2.1%"},
        {"event": "CPI Inflation Data", "date": "Dec 12, 2025", "impact": "High", "predicted": "+0.3%"}
    ]

def fetch_stock_history(symbol):
    try:
        stock = yf.Ticker(symbol)
        hist = stock.history(period="30d")
        if hist.empty: return None
        price_trend = [{"date": str(idx.date()), "close": round(row["Close"], 2)} for idx, row in hist.iterrows()]
        sentiment_trend = [{"date": str(idx.date()), "sentiment": 1 if row['Close'] > row['Open'] else -1 if row['Close'] < row['Open'] else 0} for idx, row in hist.iterrows()]
        return {"symbol": symbol, "price_trend": price_trend, "sentiment_trend": sentiment_trend}
    except Exception as e:
        print(f"Could not fetch history for {symbol}: {e}")
        return None

def market_emotion_heatmap(stocks):
    heatmap = []
    if not stocks: return []
    for s in stocks:
        change = s['change_percent']
        if change > 2: emoji = "🚀"
        elif change > 0.5: emoji = "😊"
        elif change < -2: emoji = "😨"
        elif change < -0.5: emoji = "😐"
        else: emoji = "🤔"
        heatmap.append({
            "symbol": s['symbol'], "company": s['company'],
            "change_percent": round(change, 2), "emoji": emoji
        })
    return heatmap