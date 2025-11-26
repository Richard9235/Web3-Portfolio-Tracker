import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory portfolio storage
let portfolio = [];

// Price cache with 30-second TTL
const priceCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

// Coin list cache with 1-hour TTL
let coinListCache = {
  data: new Map(), // Maps symbol -> coin data
  timestamp: 0
};
const COIN_LIST_CACHE_TTL = 3600000; // 1 hour

// File path for persistence
const PORTFOLIO_FILE = path.join(__dirname, 'portfolio.json');

// Load portfolio from file on startup
async function loadPortfolio() {
  try {
    const data = await fs.readFile(PORTFOLIO_FILE, 'utf-8');
    portfolio = JSON.parse(data);
    console.log('Portfolio loaded from file');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No existing portfolio file found, starting fresh');
    } else {
      console.error('Error loading portfolio:', error.message);
    }
  }
}

// Save portfolio to file
async function savePortfolio() {
  try {
    await fs.writeFile(PORTFOLIO_FILE, JSON.stringify(portfolio, null, 2));
    console.log('Portfolio saved to file');
  } catch (error) {
    console.error('Error saving portfolio:', error.message);
  }
}

// CoinGecko API mapping for common symbols (fallback)
const symbolToId = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'LTC': 'litecoin',
  'XRP': 'ripple',
  'BNB': 'binancecoin',
  'DOGE': 'dogecoin',
  'SHIB': 'shiba-inu',
  'USDT': 'tether',
  'USDC': 'usd-coin'
};

// Fetch and cache full coin list from CoinGecko
async function fetchCoinList() {
  // Check cache first
  if (coinListCache.data.size > 0 && Date.now() - coinListCache.timestamp < COIN_LIST_CACHE_TTL) {
    return coinListCache.data;
  }

  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=php&per_page=250&page=1',
      {
        timeout: 15000
      }
    );

    const coinMap = new Map();
    
    // Map each coin by its symbol
    response.data.forEach(coin => {
      if (coin.symbol) {
        const upperSymbol = coin.symbol.toUpperCase();
        coinMap.set(upperSymbol, {
          id: coin.id,
          symbol: upperSymbol,
          name: coin.name,
          image: coin.image,
          current_price: coin.current_price,
          price_change_percentage_24h: coin.price_change_percentage_24h || 0
        });
      }
    });

    // Update cache
    coinListCache = {
      data: coinMap,
      timestamp: Date.now()
    };

    console.log(`✅ Cached ${coinMap.size} coins`);
    return coinMap;

  } catch (error) {
    console.error('Error fetching coin list:', error.message);
    // Return existing cache or empty map
    return coinListCache.data.size > 0 ? coinListCache.data : new Map();
  }
}

// Get coin ID from symbol (dynamic lookup)
async function getCoinId(symbol) {
  const upperSymbol = symbol.toUpperCase();
  
  // Try fetching from dynamic coin list
  const coinList = await fetchCoinList();
  
  if (coinList.has(upperSymbol)) {
    return coinList.get(upperSymbol).id;
  }
  
  // Fallback to hardcoded mapping
  if (symbolToId[upperSymbol]) {
    return symbolToId[upperSymbol];
  }
  
  // Last resort: use lowercase symbol as ID
  return symbol.toLowerCase();
}

// Fetch price from CoinGecko with caching
async function fetchPrice(symbol) {
  const upperSymbol = symbol.toUpperCase();
  
  // Check cache first
  const cached = priceCache.get(upperSymbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Cache hit for ${upperSymbol}`);
    return cached.data;
  }

  // Get coin ID dynamically
  const coinId = await getCoinId(symbol);

  try {
    // Fetch from CoinGecko API (free tier, no API key needed)
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=php&include_24hr_change=true`,
      {
        timeout: 10000
      }
    );

    if (!response.data[coinId]) {
      throw new Error('Coin not found');
    }

    const priceData = {
      symbol: upperSymbol,
      price: response.data[coinId].php,
      change24h: response.data[coinId].php_24h_change || 0
    };

    // Update cache
    priceCache.set(upperSymbol, {
      data: priceData,
      timestamp: Date.now()
    });

    console.log(`Fetched price for ${upperSymbol}: ₱${priceData.price}`);
    return priceData;

  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error.message);
    throw new Error(`Unable to fetch price for ${symbol}`);
  }
}

// Routes

// GET /coins - Get list of available coins
app.get('/coins', async (req, res) => {
  try {
    const coinList = await fetchCoinList();
    const coins = Array.from(coinList.values()).map(coin => ({
      symbol: coin.symbol,
      name: coin.name,
      id: coin.id,
      image: coin.image
    }));
    res.json(coins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coin list' });
  }
});

// GET /price/:symbol - Get current price for a token
app.get('/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const priceData = await fetchPrice(symbol);
    res.json(priceData);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// GET /portfolio - Get full portfolio
app.get('/portfolio', (req, res) => {
  res.json(portfolio);
});

// POST /portfolio - Add a token to portfolio
app.post('/portfolio', async (req, res) => {
  try {
    const { symbol, amount } = req.body;

    if (!symbol || amount === undefined || amount <= 0) {
      return res.status(400).json({ error: 'Valid symbol and amount required' });
    }

    const upperSymbol = symbol.toUpperCase();

    // Check if token already exists
    const existingIndex = portfolio.findIndex(
      item => item.symbol.toUpperCase() === upperSymbol
    );

    if (existingIndex !== -1) {
      // Update existing token
      portfolio[existingIndex].amount = parseFloat(amount);
    } else {
      // Add new token
      portfolio.push({
        symbol: upperSymbol,
        amount: parseFloat(amount)
      });
    }

    await savePortfolio();
    res.json({ message: 'Token added successfully', portfolio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /portfolio/:symbol - Remove a token from portfolio
app.delete('/portfolio/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const upperSymbol = symbol.toUpperCase();

    const initialLength = portfolio.length;
    portfolio = portfolio.filter(
      item => item.symbol.toUpperCase() !== upperSymbol
    );

    if (portfolio.length === initialLength) {
      return res.status(404).json({ error: 'Token not found in portfolio' });
    }

    await savePortfolio();
    res.json({ message: 'Token removed successfully', portfolio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  await loadPortfolio();
  // Preload coin list on startup
  await fetchCoinList();
});
