from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import yfinance as yf

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_stock')
def get_stock():
    symbol = request.args.get('symbol')
    if not symbol:
        return jsonify({"error": "No symbol provided"}), 400

    try:
        stock = yf.Ticker(symbol)
        hist = stock.history(period="1d")  # Fetch today's data

        if hist.empty:
            return jsonify({"error": f"No data found for symbol {symbol}"}), 404

        latest_data = hist.iloc[0]
        return jsonify({
            "latest_time": latest_data.name.strftime('%Y-%m-%d'),
            "open": latest_data['Open'],
            "high": latest_data['High'],
            "low": latest_data['Low'],
            "close": latest_data['Close'],
            "volume": int(latest_data['Volume'])
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
