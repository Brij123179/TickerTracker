import requests
import time
import os

# API URL for CoinGecko
URL = (
    "https://api.coingecko.com/api/v3/coins/markets"
    "?vs_currency=usd&order=market_cap_desc&per_page=50&page=1"
)

def clear_screen():
    """Clears the terminal screen for a clean refresh."""
    # For Windows
    if os.name == 'nt':
        _ = os.system('cls')
    # For macOS and Linux
    else:
        _ = os.system('clear')

def fetch_and_print_data():
    """Fetches data from the API and prints a formatted table to the console."""
    try:
        # Make the API request with a 10-second timeout
        response = requests.get(URL, timeout=10)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        coins = response.json()

        clear_screen()
        print("🟢 Top 50 Crypto Prices (USD) - Live")
        print(f"Last updated: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*65)
        # Table Header
        print(f"{'#':<4} {'Name':<22} {'Symbol':<10} {'Price (USD)':<25}")
        print("-"*65)

        # Table Rows
        for i, coin in enumerate(coins, start=1):
            name = coin.get('name', 'N/A')
            symbol = coin.get('symbol', 'N/A').upper()
            price = coin.get('current_price', 0)
            
            # Format the output for better alignment
            print(f"{i:<4} {name:<22} {symbol:<10} ${price:,.4f}")

    except requests.exceptions.RequestException as e:
        clear_screen()
        print(f"🔴 Network Error: Could not connect to the API.")
        print(f"   Details: {e}")
    except KeyError as e:
        clear_screen()
        print(f"🟡 Data Error: Unexpected data format from API (missing key: {e}).")

if __name__ == "__main__":
    try:
        while True:
            fetch_and_print_data()
            time.sleep(10)  # Wait 10 seconds before the next update
    except KeyboardInterrupt:
        print("\n👋 Exiting program.")