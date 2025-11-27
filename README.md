# TickerTracker - Financial Data Platform

A full-stack financial data platform with real-time market data, AI-powered chat, portfolio tracking, and alerts system.

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Port**: 5004
- **API Base**: `http://localhost:5004/api`
- **Data Sources**: Alpha Vantage, CRYPTO1 (Flask), CoinGecko (fallback), Mock Data
- **Storage**: File-based JSON (alerts.json, watchlist.json)

### CRYPTO1 Service (Python + Flask)
- **Port**: 5000
- **API Base**: `http://127.0.0.1:5000/api`
- **Purpose**: Real-time cryptocurrency data with caching
- **Data Source**: CoinGecko API with 2-minute cache
- **Integration**: Provides live crypto data to TickerTracker backend

### Frontend (React + TypeScript + Vite)
- **Port**: 5173 (dev server)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Context API

## 🚀 Quick Start

### 1. CRYPTO1 Service Setup (Required for Crypto Data)

```bash
# Navigate to CRYPTO1 directory
cd CRYPTO1/CRYPTO

# Install Python dependencies
pip install flask flask-cors requests

# Start the CRYPTO1 service (keep this running)
python app.py

# Service will be running at http://127.0.0.1:5000
```

**Alternative startup methods:**
```bash
# Windows Batch File
start-crypto1.bat

# PowerShell Script  
.\start-crypto1.ps1
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Install Recharts for charting (if not already installed)
npm install recharts

# Create environment file
cp .env.example .env

# Edit .env file and add your API keys
# REQUIRED: Get Alpha Vantage API key from https://www.alphavantage.co/support/#api-key
nano .env
```

**Required Environment Variables:**
```env
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
PORT=5004
NODE_ENV=development
```

```bash
# Start the backend server
npm run dev

# Server will be running at http://localhost:5004
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Start the development server
npm run dev

# Frontend will be running at http://localhost:5173
```

## 🔑 API Keys Required

### Alpha Vantage (Required for US Stock Data)
1. Visit: https://www.alphavantage.co/support/#api-key
2. Sign up for a free account
3. Get your API key
4. Add to backend `.env` file: `ALPHA_VANTAGE_API_KEY=your_key_here`

**Free Tier Limits:**
- 25 requests per day
- 5 requests per minute

### CoinGecko (No API Key Required - via CRYPTO1)
- Used for cryptocurrency data through CRYPTO1 service
- Free tier: 10-50 requests/minute depending on plan
- No authentication required
- 2-minute caching via CRYPTO1 Flask service

### CRYPTO1 Service (Real-time Crypto Data)
- **Purpose**: Dedicated cryptocurrency data service
- **Technology**: Python Flask with caching
- **Data Source**: CoinGecko API
- **Cache Duration**: 2 minutes for optimal performance
- **Integration**: Seamlessly integrated with TickerTracker backend

## 📡 API Endpoints

### Market Data
- `GET /api/stocks/US` - US stock market data
- `GET /api/stocks/Indian` - Indian stock market data (mock)
- `GET /api/stocks/Crypto` - Cryptocurrency data (via CRYPTO1 service)
- `GET /api/ticker/:symbol` - Individual ticker details

### User Features
- `GET /api/user/profile` - User profile information
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add symbol to watchlist
- `DELETE /api/watchlist/:symbol` - Remove from watchlist

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert
- `DELETE /api/alerts/:id` - Delete alert

### AI Chat
- `POST /api/chat` - Send message to FinGPT AI assistant

### Health & Monitoring
- `GET /api/health` - Overall system health check
- `GET /api/health/crypto1` - CRYPTO1 service health check

## 🛠️ Development

### CRYPTO1 Service Development
```bash
cd CRYPTO1/CRYPTO
pip install flask flask-cors requests
python app.py  # Runs on http://127.0.0.1:5000
```

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd Frontend
npm install  # Install dependencies including Recharts
npm run dev  # Vite dev server with hot reload
```

### API Testing
The project includes comprehensive testing tools:

1. **Integration Testing**: `node test-crypto1-integration.js`
   - Tests CRYPTO1 service connectivity
   - Validates data transformation
   - Checks health endpoints

2. **Frontend API Health Check**:
   - Go to Settings page
   - Click "Check Status" under Developer Tools
   - View all endpoint statuses and response times

3. **Original Crypto API Test**: `node test-crypto-api.js`
   - Legacy test for direct CoinGecko integration

## 🌐 Environment Configuration

### Backend (.env)
```env
# Required
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key

# Optional
PORT=5004
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5004/api
VITE_APP_NAME=TickerTracker
VITE_APP_VERSION=1.0.0
```

## 📁 Project Structure

```
PriyanshiDataQuest/
├── CRYPTO1/               # Real-time crypto service
│   └── CRYPTO/
│       ├── app.py         # Flask app for crypto data
│       ├── datafetch.py   # Console crypto data viewer
│       └── templates/
│           └── index.html # Web interface
├── backend/
│   ├── services/          # API service layers
│   │   ├── alphaVantageService.js
│   │   ├── coinGeckoService.js
│   │   ├── crypto1Service.js      # NEW: CRYPTO1 integration
│   │   ├── mockDataService.js
│   │   ├── chatService.js
│   │   └── userService.js
│   ├── routes/
│   │   └── api.js         # All API routes
│   ├── data/              # JSON storage
│   │   ├── alerts.json
│   │   └── watchlist.json
│   ├── server.js          # Express server
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── PriceChart.tsx      # Enhanced charting component
│   │   │   ├── TickerDetail.tsx    # Individual stock/crypto details
│   │   │   ├── Dashboard.tsx       # Main market overview
│   │   │   └── ...                 # Other UI components
│   │   ├── contexts/      # React context providers
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript declarations
│   │   │   ├── lucide-react.d.ts
│   │   │   └── recharts.d.ts
│   │   └── main.tsx       # App entry point
│   ├── public/
│   └── package.json
├── start-crypto1.bat      # Windows CRYPTO1 startup
├── start-crypto1.ps1      # PowerShell CRYPTO1 startup
├── test-crypto1-integration.js  # Integration tests
└── README.md
```

## 🔄 Data Flow

1. **CRYPTO1 Service** fetches real-time crypto data from CoinGecko with caching
2. **Frontend** makes API calls via `src/services/api.ts`
3. **API Service** handles all HTTP requests to backend
4. **Backend Routes** (`routes/api.js`) process requests
5. **Service Layer** fetches data from:
   - CRYPTO1 Flask service (for crypto data)
   - Alpha Vantage API (for US stocks)
   - Mock data (for Indian stocks)
6. **Response** sent back through the chain to frontend components

## 🚨 Troubleshooting

### Common Issues

**CRYPTO1 service not starting:**
- Check if Python is installed and in PATH
- Install required packages: `pip install flask flask-cors requests`
- Ensure port 5000 is not in use by another service
- Check firewall settings if running across different machines

**Backend won't start:**
- Check if port 5004 is available
- Verify all required environment variables are set
- Run `npm install` to ensure dependencies are installed
- Ensure CRYPTO1 service is running for crypto data

**API calls failing:**
- Use the API health check tool in Settings
- Verify backend is running on http://localhost:5004
- Check browser console for CORS errors
- Confirm Alpha Vantage API key is valid
- Ensure CRYPTO1 service is accessible at http://127.0.0.1:5000

**No crypto data displaying:**
- Check if CRYPTO1 service is running: http://127.0.0.1:5000/health
- Verify network connectivity for CoinGecko API calls
- Check CRYPTO1 service logs for errors
- Use integration test: `node test-crypto1-integration.js`

### Rate Limiting
- **Alpha Vantage**: 5 requests per minute, 25 per day (free tier)
- **CoinGecko** (via CRYPTO1): 10-50 requests per minute (cached for 2 minutes)
- **CRYPTO1 Service**: 2-minute cache reduces API calls significantly

### Development Mode
The app includes error boundaries and detailed logging:
- Backend logs API requests and responses
- Frontend shows error states and loading indicators
- API health check tool for debugging connectivity
- CRYPTO1 service provides detailed logging and health endpoints
- Integration testing tools for comprehensive system validation

## 🚀 Production Deployment

### Environment Variables for Production
```env
# Backend (.env)
NODE_ENV=production
ALPHA_VANTAGE_API_KEY=your_production_key
PORT=5004
FRONTEND_URL=https://yourdomain.com

# CRYPTO1 Service
FLASK_ENV=production
CRYPTO1_CACHE_DURATION=120
```

### Build Commands
```bash
# CRYPTO1 Service (production setup)
cd CRYPTO1/CRYPTO
pip install -r requirements.txt  # if you create one
python app.py  # or use gunicorn for production

# Frontend production build
cd Frontend
npm run build

# Backend (no build step required)
cd backend
npm start
```

## 📊 Features Implemented

✅ **Real-time Market Data**
- US stocks via Alpha Vantage API
- Cryptocurrency data via CRYPTO1 Flask service (real-time with caching)
- Indian stocks via mock data
- Enhanced data reliability with service redundancy

✅ **AI-Powered Chat**
- Context-aware financial assistant
- Market analysis and insights
- Risk assessment capabilities

✅ **Portfolio Management**
- Personal watchlist with persistence
- Price alerts with expiration
- User profile management

✅ **Interactive UI**
- Dark/light theme toggle
- Responsive design
- Real-time price updates
- News sentiment analysis

✅ **Advanced Charting**
- Interactive price charts with Recharts library
- Multiple chart types (Line and Area charts)
- Multiple time periods (1D, 3D, 1W, 1Y)
- Real-time price data visualization
- Custom tooltips and price indicators
- High/Low/Range statistics
- Responsive chart design

## 🔮 Future Enhancements

- Real-time WebSocket connections for live data
- Technical indicators (RSI, MACD, Bollinger Bands)
- Candlestick charts with OHLC data
- Volume indicators on charts
- Chart drawing tools and annotations
- Email/SMS notifications for alerts
- Machine learning-based price predictions
- Social sentiment analysis integration
- Mobile app development

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Use the API health check tool for connectivity issues
3. Review browser console for error messages
4. Ensure all required API keys are configured correctly