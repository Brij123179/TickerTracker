import requests
from flask import Flask, jsonify, render_template
from flask_cors import CORS
import time
from datetime import datetime, timedelta

# Initialize the Flask app
app = Flask(__name__)

# Enable CORS for all routes to allow React app and TickerTracker backend to access the API
CORS(app, origins=[
    "http://localhost:3000", "http://127.0.0.1:3000",  # React default
    "http://localhost:5173", "http://127.0.0.1:5173",  # Vite React default
    "http://localhost:5174", "http://127.0.0.1:5174",  # Vite fallback
    "http://localhost:5175", "http://127.0.0.1:5175",  # Vite fallback
    "http://localhost:5004", "http://127.0.0.1:5004",  # TickerTracker backend
    "http://localhost:5000", "http://127.0.0.1:5000"   # This Flask app
])

# Cache for storing API responses
cache = {
    'data': None,
    'timestamp': None,
    'cache_duration': 10  # Cache for 10 seconds for more real-time data
}

# Route to serve the main HTML page
@app.route('/')
def index():
    """Renders the main HTML page."""
    return render_template('index.html')

# Route to act as a proxy for the CoinGecko API
@app.route('/api/data')
def get_crypto_data():
    """Fetches crypto data from the CoinGecko API and returns it as JSON."""
    
    # Check if we have cached data that's still valid
    now = datetime.now()
    if (cache['data'] is not None and 
        cache['timestamp'] is not None and 
        (now - cache['timestamp']).total_seconds() < cache['cache_duration']):
        
        print(f"🔄 Returning cached data (age: {(now - cache['timestamp']).total_seconds():.1f}s)")
        return jsonify(cache['data'])
    
    # Fetch fresh data from CoinGecko
    url = (
        "https://api.coingecko.com/api/v3/coins/markets"
        "?vs_currency=usd&order=market_cap_desc&per_page=50&page=1"
    )
    try:
        print("🌐 Fetching fresh data from CoinGecko API...")
        response = requests.get(url, timeout=15)
        # Raise an HTTPError for bad responses (4xx or 5xx)
        response.raise_for_status()
        coins = response.json()
        
        # Update cache
        cache['data'] = coins
        cache['timestamp'] = now
        
        print(f"✅ Successfully fetched {len(coins)} coins from CoinGecko")
        return jsonify(coins)
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching from CoinGecko: {str(e)}")
        
        # If we have cached data, return it even if it's old
        if cache['data'] is not None:
            print("⚠️ Returning stale cached data due to API error")
            return jsonify(cache['data'])
        
        # Handle network-related errors
        error_message = {"error": "Failed to fetch data from CoinGecko API", "details": str(e)}
        # Return a 502 Bad Gateway status code
        return jsonify(error_message), 502

# Health check endpoint
@app.route('/health')
def health_check():
    """Simple health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "CRYPTO1 Flask App",
        "timestamp": datetime.now().isoformat(),
        "cache_status": {
            "has_data": cache['data'] is not None,
            "last_updated": cache['timestamp'].isoformat() if cache['timestamp'] else None,
            "cache_age_seconds": (datetime.now() - cache['timestamp']).total_seconds() if cache['timestamp'] else None
        }
    })

# API status endpoint
@app.route('/api/status')
def api_status():
    """Detailed API status information."""
    return jsonify({
        "status": "operational",
        "version": "1.0.0",
        "description": "CRYPTO1 - Real-time Cryptocurrency Data Service",
        "endpoints": {
            "/": "Web interface",
            "/api/data": "Cryptocurrency market data",
            "/api/refresh": "Force cache refresh",
            "/health": "Health check",
            "/api/status": "API status information"
        },
        "data_source": "CoinGecko API",
        "cache_ttl_seconds": cache['cache_duration'],
        "supported_currencies": ["USD (converted to INR by TickerTracker)"],
        "max_coins": 50
    })

# Force cache refresh endpoint
@app.route('/api/refresh')
def refresh_cache():
    """Force a cache refresh to get the latest data immediately."""
    global cache
    
    # Clear the cache to force fresh data
    cache['data'] = None
    cache['timestamp'] = None
    
    print("🔄 Cache cleared - forcing fresh data fetch...")
    
    # Get fresh data
    return get_crypto_data()

if __name__ == '__main__':
    print("🚀 Starting CRYPTO1 Flask App...")
    print("📊 Endpoints available:")
    print("   - Web UI: http://127.0.0.1:5000/")
    print("   - API Data: http://127.0.0.1:5000/api/data")
    print("   - Health Check: http://127.0.0.1:5000/health")
    print("   - API Status: http://127.0.0.1:5000/api/status")
    print("🔗 Integrated with TickerTracker backend on port 5004")
    # Runs the app on http://127.0.0.1:5000
    app.run(debug=True, port=5000, host='127.0.0.1')