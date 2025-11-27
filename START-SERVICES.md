# 🚀 Starting All TickerTracker Services

## Quick Start - All Services at Once

### Windows Command Prompt (.bat)
```bash
start-all-services.bat
```

### Windows PowerShell (.ps1)
```powershell
.\start-all-services.ps1
```

## Manual Start (Individual Services)

### 1. Backend Server (Node.js) - Port 5004
```bash
cd backend
npm install  # First time only
npm start
```
**Access:** http://localhost:5004

### 2. CRYPTO1 Service (Python Flask) - Port 5000
```bash
cd CRYPTO1/CRYPTO
pip install -r requirements.txt  # First time only
python app.py
```
**Access:** http://localhost:5000
**API Endpoint:** http://localhost:5000/api/data

### 3. API Service (Python Flask) - Port 5001
```bash
cd API
pip install -r requirements.txt  # First time only
python app.py
```
**Access:** http://localhost:5001
**Endpoints:**
- Indian Market: http://localhost:5001/get_market_data
- US Market: http://localhost:5001/get_us_market_data

### 4. Frontend (React + Vite) - Port 5173
```bash
cd Frontend
npm install  # First time only
npm run dev
```
**Access:** http://localhost:5173

## Service Architecture

```
┌─────────────────────────────────────────────┐
│         Frontend (React + Vite)             │
│              Port: 5173                     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│      Backend API (Node.js + Express)        │
│              Port: 5004                     │
└──────┬───────────┬──────────────┬───────────┘
       │           │              │
       ▼           ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│ CRYPTO1  │ │   API    │ │ Alpha Vantage│
│  Flask   │ │  Flask   │ │     API      │
│Port: 5000│ │Port: 5001│ │   External   │
└──────────┘ └──────────┘ └──────────────┘
     │            │
     ▼            ▼
CoinGecko API  yfinance
```

## Data Sources

### US Market Stocks
1. **Flask API Service** (Primary) - Real-time data via yfinance
2. **Alpha Vantage API** (Fallback) - Official stock data
3. **Mock Data** (Last Resort) - Static data with dynamic variations

### Indian Market Stocks
1. **Flask API Service** (Primary) - Real-time NSE data via yfinance
2. **Mock Data** (Fallback) - Static data with dynamic variations

### Cryptocurrency
1. **CRYPTO1 Flask Service** (Primary) - Real-time crypto via CoinGecko
2. **CoinGecko Direct** (Fallback) - Direct API integration
3. **Mock Data** (Last Resort) - Static crypto data

## Environment Variables

### Backend (.env in /backend folder)
```env
PORT=5004
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

### Frontend (.env in /Frontend folder)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

### Port Already in Use
Kill processes using specific ports:
```powershell
# PowerShell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5004).OwningProcess -Force
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess -Force
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess -Force
```

### Python Services Not Working
Ensure Python dependencies are installed:
```bash
# CRYPTO1 Service
cd CRYPTO1/CRYPTO
pip install flask flask-cors requests

# API Service
cd API
pip install flask flask-cors yfinance pandas textblob peewee websockets
```

### Node Services Not Working
Ensure Node dependencies are installed:
```bash
# Backend
cd backend
npm install

# Frontend
cd Frontend
npm install
```

## Features by Service

### Backend (Port 5004)
- Central API gateway
- Data aggregation from multiple sources
- Watchlist management
- Alerts system
- User authentication
- Chat/AI responses

### CRYPTO1 (Port 5000)
- Real-time cryptocurrency prices
- Top 50 cryptos by market cap
- Price change tracking
- Market cap data
- 24h volume data

### API Service (Port 5001)
- Indian NSE stock data
- US NASDAQ stock data
- Stock history and charts
- Market indices (NIFTY, SENSEX)
- Commodities data

### Frontend (Port 5173)
- Beautiful responsive UI
- Dark/Light theme
- Real-time price updates
- Advanced filtering and sorting
- Watchlist with star functionality
- Market statistics dashboard
- Grid and list view modes
- Mobile-responsive navigation

## API Testing

Test if services are running:

```bash
# Backend
curl http://localhost:5004/api/stocks/US

# CRYPTO1
curl http://localhost:5000/api/data

# API Service
curl http://localhost:5001/get_market_data

# Frontend
curl http://localhost:5173
```

## Development Tips

1. **Start services in order:** Backend → Flask Services → Frontend
2. **Check console logs** for error messages
3. **Use browser DevTools** to inspect network requests
4. **Monitor terminal output** for API call status
5. **Restart services** if data doesn't refresh

## Production Deployment

For production, consider:
- Using environment-specific .env files
- Setting up reverse proxy (nginx)
- Using PM2 for Node.js process management
- Using systemd services for Python apps
- Enabling HTTPS/SSL
- Setting up CDN for frontend assets

## License

MIT License - See LICENSE file for details
