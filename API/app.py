from flask import Flask, jsonify, render_template
from flask_cors import CORS
from utils.data_fetch import (
    fetch_stock_data,
    market_mood_barometer,
    sector_sentiment,
    upcoming_events,
    fetch_stock_history,
    market_emotion_heatmap,
    NIFTY_50_STOCKS,
    INDIAN_INDICES,
    COMMODITIES,
    US_STOCKS
)

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_market_data')
def indian_market_data():
    indices_data = [fetch_stock_data(s) for s in INDIAN_INDICES]
    commodities_data = [fetch_stock_data(s) for s in COMMODITIES]
    stocks_data = [fetch_stock_data(s) for s in NIFTY_50_STOCKS]
    indices_data = [d for d in indices_data if d]
    commodities_data = [d for d in commodities_data if d]
    stocks_data = [d for d in stocks_data if d]
    mood = market_mood_barometer(stocks_data)
    sectors = sector_sentiment(stocks_data)
    heatmap = market_emotion_heatmap(stocks_data)
    return jsonify({
        "indices": indices_data, "commodities": commodities_data,
        "stocks": stocks_data, "market_mood": mood,
        "sector_sentiment": sectors, "market_heatmap": heatmap
    })

@app.route('/get_us_market_data')
def us_market_data():
    us_stocks_data = [fetch_stock_data(s) for s in US_STOCKS]
    us_stocks_data = [d for d in us_stocks_data if d]
    return jsonify({"stocks": us_stocks_data})

@app.route('/get_stock_details/<symbol>')
def get_stock_details(symbol):
    history = fetch_stock_history(symbol)
    events = upcoming_events()
    return jsonify({"history": history or {}, "upcoming_events": events})

if __name__ == "__main__":
    app.run(debug=True, port=5001)