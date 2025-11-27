import requests

# ✅ Your API key from Alpha Vantage
api_key = "ZLDEYA5OOHGNISF1"

# ✅ The stock symbol you want to track
symbol = "AAPL"  # Example: Apple Inc.

# ✅ API URL to fetch the stock data (5 minute interval)
url = f"https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval=5min&apikey={api_key}"

# ✅ Send request to API
response = requests.get(url)

# ✅ Convert response to JSON format
data = response.json()

# ✅ Extract and print the latest data
time_series = data.get("Time Series (5min)", {})

if time_series:
    latest_time = sorted(time_series.keys())[-1]
    latest_data = time_series[latest_time]
    
    print(f"Stock: {symbol}")
    print(f"Latest Time: {latest_time}")
    print(f"Open Price: {latest_data['1. open']}")
    print(f"High Price: {latest_data['2. high']}")
    print(f"Low Price: {latest_data['3. low']}")
    print(f"Close Price: {latest_data['4. close']}")
    print(f"Volume: {latest_data['5. volume']}")
else:
    print("No data available.")
