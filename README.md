# Web3 Crypto Portfolio Tracker

A real-time cryptocurrency portfolio tracking application that helps you monitor your crypto assets with live prices, 24-hour price changes, and total portfolio valuation in PHP (Philippine Peso). Built with React and Node.js.

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Technologies Used](#technologies-used)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Libraries & Dependencies](#libraries--dependencies)
- [Usage Guide](#usage-guide)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Features

### Core Functionality
- **Real-time Crypto Prices** - Live prices in PHP from CoinGecko API
- **24h Price Tracking** - See percentage changes with color indicators (green = up, red = down)
- **Auto-refresh** - Prices update every 30 seconds automatically
- **Persistent Storage** - Your portfolio is saved and survives server restarts
- **Responsive Design** - Works beautifully on desktop, tablet, and mobile

### Advanced Features
- **Smart Search** - Autocomplete with 250+ cryptocurrencies
- **Visual Icons** - Coin logos displayed in search and portfolio cards
- **Flexible Amounts** - Support for tiny fractions (e.g., 0.00000123 BTC)
- **Eye-friendly Theme** - Modern navy, coral, and gold color scheme
- **Fast Performance** - Smart caching reduces API calls

---

## Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Richard9235/Web3-Portfolio-Tracker.git
   cd Web3-Portfolio-Tracker
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

**Terminal 1 - Start Backend Server:**
```bash
cd backend
npm start
```
Wait for: `✅ Cached XXX coins` and `🚀 Server running on http://localhost:5000`

**Terminal 2 - Start Frontend (in a new terminal):**
```bash
cd frontend
npm start
```
Wait for: `Compiled successfully!`

**Open your browser:**
The app will automatically open at http://localhost:3000

---

## How It Works

### The Complete Process

1. **Application Startup**
   - Backend server starts and connects to CoinGecko API
   - Fetches list of 250+ cryptocurrencies (cached for 1 hour)
   - Loads your saved portfolio from `portfolio.json`
   - Frontend loads and connects to backend

2. **Adding a Token**
   - You type a coin symbol or name (e.g., "BTC" or "bitcoin")
   - Autocomplete shows matching coins with icons
   - You select a coin and enter the amount you own
   - Backend saves it to `portfolio.json`
   - Frontend fetches current price from CoinGecko

3. **Price Updates**
   - Every 30 seconds, frontend requests updated prices
   - Backend checks its cache first (30-second cache)
   - If cache is expired, fetches fresh data from CoinGecko
   - Prices and changes are displayed in your portfolio cards

4. **Calculations**
   - For each token: `Token Value = Amount × Current Price`
   - Total Portfolio: `Sum of all token values`
   - 24h Change: Shows price movement percentage

5. **Data Flow**
   ```
   You → Frontend → Backend → CoinGecko API
                ↓
           portfolio.json (saves data)
                ↓
           Backend → Frontend → You (displays results)
   ```

---

## Technologies Used

### Frontend
- **React 19.2.0** - Modern JavaScript library for building user interfaces
- **Axios** - HTTP client for making API requests to backend
- **CSS3** - Custom styling with gradients and animations

### Backend
- **Node.js** - JavaScript runtime for server
- **Express 5.1.0** - Web framework for building the API
- **Axios** - HTTP client for fetching data from CoinGecko
- **CORS** - Enables frontend to communicate with backend

### External API
- **CoinGecko API** - Free cryptocurrency data provider (no API key required)

---

## API Endpoints

The backend server provides these endpoints:

### 1. Get Available Coins
```http
GET /coins
```
**Purpose:** Returns list of 250+ cryptocurrencies with icons  
**Response:** Array of coin objects
```json
[
  {
    "symbol": "BTC",
    "name": "Bitcoin",
    "id": "bitcoin",
    "image": "https://..."
  }
]
```
**Cache:** 1 hour

---

### 2. Get Token Price
```http
GET /price/:symbol
```
**Purpose:** Fetch current price and 24h change for a specific token  
**Example:** `GET /price/BTC`  
**Response:**
```json
{
  "symbol": "BTC",
  "price": 2840567.89,
  "change24h": 2.34
}
```
**Cache:** 30 seconds

---

### 3. Get Portfolio
```http
GET /portfolio
```
**Purpose:** Retrieve all tokens in your portfolio  
**Response:**
```json
[
  {
    "symbol": "BTC",
    "amount": 0.5
  },
  {
    "symbol": "ETH",
    "amount": 2.5
  }
]
```

---

### 4. Add Token
```http
POST /portfolio
Content-Type: application/json

{
  "symbol": "BTC",
  "amount": 0.5
}
```
**Purpose:** Add a new token or update existing amount  
**Response:**
```json
{
  "message": "Token added successfully",
  "portfolio": [...]
}
```

---

### 5. Delete Token
```http
DELETE /portfolio/:symbol
```
**Purpose:** Remove a token from portfolio  
**Example:** `DELETE /portfolio/BTC`  
**Response:**
```json
{
  "message": "Token removed successfully",
  "portfolio": [...]
}
```

---

## Project Structure

```
Web3-Portfolio-Tracker/
├── backend/
│   ├── server.js              # API server with all endpoints
│   ├── package.json           # Backend dependencies
│   └── portfolio.json         # Your saved portfolio (auto-generated)
│
├── frontend/
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── App.js             # Main React component (organized with comments)
│   │   ├── App.css            # Styling with navy/coral/gold theme
│   │   └── index.js           # React entry point
│   └── package.json           # Frontend dependencies
│
├── README.md                  # This file
└── .gitignore                 # Git ignore rules
```

---

## Libraries & Dependencies

### Backend Dependencies

| Library | Version | Purpose | Impact |
|---------|---------|---------|--------|
| **express** | 5.1.0 | Web framework | Creates API endpoints, handles HTTP requests |
| **cors** | 2.8.5 | Cross-Origin Resource Sharing | Allows frontend to communicate with backend |
| **axios** | 1.6.2 | HTTP client | Fetches data from CoinGecko API |
| **nodemon** | 3.1.11 | Dev tool | Auto-restarts server when code changes (dev only) |

**Why these matter:**
- **Express** makes it easy to create `/coins`, `/price/:symbol`, etc. endpoints
- **CORS** is essential - without it, browser blocks frontend requests
- **Axios** handles API calls with automatic JSON parsing
- **Nodemon** improves development speed (not used in production)

---

### Frontend Dependencies

| Library | Version | Purpose | Impact |
|---------|---------|---------|--------|
| **react** | 19.2.0 | UI library | Builds interactive user interface |
| **react-dom** | 19.2.0 | React renderer | Renders React components to browser |
| **axios** | 1.6.2 | HTTP client | Communicates with backend API |
| **react-scripts** | 5.0.1 | Build tools | Bundles and runs React app |

**Why these matter:**
- **React** enables component-based UI with real-time updates
- **Axios** handles all API communication (get prices, add tokens, etc.)
- **React-scripts** provides development server and build tools

---

## Usage Guide

### Adding Your First Token

1. **Type in the search box**
   - Enter symbol like "BTC" or name like "Bitcoin"
   - Autocomplete dropdown appears with matching coins

2. **Select from suggestions**
   - Click on the coin you want (includes icon and full name)
   - Symbol auto-fills in the input field

3. **Enter amount**
   - Type how much you own (supports decimals like 0.00000123)
   - Examples: `0.5` for half a Bitcoin, `1000` for 1000 tokens

4. **Add to portfolio**
   - Click "Add Token" button
   - Card appears showing your token with current price

### Viewing Your Portfolio

Your tokens display as **cards** showing:
- **Coin Logo** - Visual icon from CoinGecko
- **Symbol & Name** - BTC - Bitcoin
- **Amount** - How much you own (up to 8 decimals)
- **Current Price** - In Philippine Peso (₱)
- **24h Change** - Green (↑) or Red (↓) percentage
- **Total Value** - Amount × Price

At the bottom, see your **Total Portfolio Value** across all tokens.

### Managing Tokens

- **Update Amount:** Add the same token again with a new amount
- **Delete Token:** Click the × button on the card
- **Auto-refresh:** Prices update every 30 seconds automatically

---

## Configuration

### Backend Settings

**File:** `backend/server.js`

```javascript
const PORT = 5000;                    // Backend server port
const CACHE_TTL = 30000;              // Price cache: 30 seconds
const COIN_LIST_CACHE_TTL = 3600000;  // Coin list cache: 1 hour
```

### Frontend Settings

**File:** `frontend/src/App.js`

```javascript
const API_BASE_URL = 'http://localhost:5000';  // Backend URL

// Auto-refresh interval: Line ~200
setInterval(() => fetchPrices(), 30000);       // 30 seconds
```

### Changing Currency

Currently set to **PHP (Philippine Peso)**. To change:

**Backend (`server.js`):**
```javascript
// Change 'php' to 'usd', 'eur', 'jpy', etc.
?vs_currency=php  →  ?vs_currency=usd
```

**Frontend (`App.js`):**
```javascript
// Update the ₱ symbol
₱  →  $
```

---

## Troubleshooting

### Port Already in Use

**Problem:** "Port 5000 is already in use"

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port in backend/server.js
const PORT = 5001;
```

---

### Connection Refused Error

**Problem:** Frontend shows "ERR_CONNECTION_REFUSED"

**Solution:**
1. Make sure backend is running (`npm start` in backend folder)
2. Check terminal shows: `🚀 Server running on http://localhost:5000`
3. Verify frontend uses correct URL in `App.js`

---

### Autocomplete Not Working

**Problem:** Dropdown doesn't appear or closes too fast

**Solution:**
1. Backend must be running (coin list needs to load)
2. Check browser console for errors
3. Verify you see: `✅ Cached XXX coins` in backend terminal
4. Try refreshing the page

---

### Prices Not Updating

**Problem:** Prices show "Error" or don't refresh

**Causes & Solutions:**
1. **CoinGecko API limit** - Free tier has rate limits (50 calls/min)
   - Wait a minute and try again
2. **Internet connection** - Check your connection
3. **Wrong symbol** - Use supported symbols (BTC, ETH, SOL, etc.)

---

### Portfolio Not Saving

**Problem:** Tokens disappear when restarting server

**Check:**
1. Look for `portfolio.json` in backend folder
2. Check file permissions (should be writable)
3. Check backend console for save/load messages

---

## Customization

### Color Scheme

The app uses a navy, coral, and gold theme. To customize:

**File:** `frontend/src/App.css`

```css
/* Main colors */
--background: #1a1a2e;      /* Navy blue */
--primary: #e94560;         /* Coral red */
--secondary: #feca57;       /* Gold yellow */
--accent: #48dbfb;          /* Cyan blue */
--text: #f4e8c1;           /* Cream text */
```

---

## Supported Cryptocurrencies

**250+ tokens** including:

| Category | Examples |
|----------|----------|
| **Major Coins** | BTC, ETH, BNB, SOL, XRP, ADA, DOT, AVAX |
| **DeFi Tokens** | UNI, AAVE, LINK, COMP, SUSHI, CAKE |
| **Stablecoins** | USDT, USDC, DAI, BUSD |
| **Layer 2** | MATIC, ARB, OP |
| **Meme Coins** | DOGE, SHIB, PEPE, FLOKI |
| **And more...** | 230+ additional tokens |

*List automatically updates from CoinGecko's top 250 by market cap*

---

## Security & Privacy

- No authentication required (single-user app)
- No blockchain wallet connection needed
- Data stored locally on your computer
- No personal information collected
- API calls to CoinGecko only (free, public API)

---

## Future Enhancements

Potential features to add:
- [ ] Historical price charts
- [ ] Multiple currency support (USD, EUR, etc.)
- [ ] Export portfolio to CSV
- [ ] Price alerts/notifications
- [ ] Multiple portfolios
- [ ] Dark/light theme toggle
- [ ] Mobile app version

---

## License

MIT License - Feel free to use and modify for your projects!

---

## Author

Built as part of the OJT project for Bitskwela

**Repository:** [Web3-Portfolio-Tracker](https://github.com/Richard9235/Web3-Portfolio-Tracker)

---

## Support

Having issues? Check:
1. [Troubleshooting section](#-troubleshooting) above
2. `TROUBLESHOOTING.md` file for detailed help
3. Make sure both backend AND frontend are running

---
 


