import { useState, useEffect, useCallback } from 'react';
import './App.css';
import axios from 'axios';

// ============================================
// CONFIGURATION
// ============================================
const API_BASE_URL = 'http://localhost:5000';

// ============================================
// MAIN COMPONENT
// ============================================
function App() {
  // ----------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioWithPrices, setPortfolioWithPrices] = useState([]);
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const [availableCoins, setAvailableCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ----------------------------------------
  // COIN SEARCH & AUTOCOMPLETE
  // ----------------------------------------
  // Fetch available coins from backend
  const fetchAvailableCoins = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/coins`);
      setAvailableCoins(response.data);
    } catch (err) {
      console.error('Error fetching available coins:', err);
    }
  };

  // Filter coins based on input
  const handleSymbolChange = (value) => {
    setSymbol(value);
    if (value.length > 0) {
      const filtered = availableCoins.filter(coin => 
        coin.symbol.toLowerCase().includes(value.toLowerCase()) ||
        coin.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Limit to 10 suggestions
      setFilteredCoins(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCoins([]);
      setShowSuggestions(false);
    }
  };

  // Select coin from suggestions
  const selectCoin = (coinSymbol) => {
    setSymbol(coinSymbol);
    setShowSuggestions(false);
    setFilteredCoins([]);
  };

  // Handle input blur with delay to allow click
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // ----------------------------------------
  // PORTFOLIO DATA MANAGEMENT
  // ----------------------------------------
  // Fetch portfolio from backend
  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/portfolio`);
      setPortfolio(response.data);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    }
  };

  // Fetch prices for all tokens in portfolio
  const fetchPrices = useCallback(async () => {
    if (portfolio.length === 0) {
      setPortfolioWithPrices([]);
      setTotalValue(0);
      return;
    }

    try {
      const pricesPromises = portfolio.map(async (item) => {
        try {
          const response = await axios.get(`${API_BASE_URL}/price/${item.symbol}`);
          const value = item.amount * response.data.price;
          
          // Find coin image from available coins
          const coinData = availableCoins.find(
            coin => coin.symbol.toLowerCase() === item.symbol.toLowerCase()
          );
          
          return {
            ...item,
            price: response.data.price,
            change24h: response.data.change24h,
            value: value,
            image: coinData?.image || null,
            name: coinData?.name || item.symbol
          };
        } catch (err) {
          console.error(`Error fetching price for ${item.symbol}:`, err);
          const coinData = availableCoins.find(
            coin => coin.symbol.toLowerCase() === item.symbol.toLowerCase()
          );
          return {
            ...item,
            price: 0,
            change24h: 0,
            value: 0,
            error: true,
            image: coinData?.image || null,
            name: coinData?.name || item.symbol
          };
        }
      });

      const results = await Promise.all(pricesPromises);
      setPortfolioWithPrices(results);

      // Calculate total portfolio value
      const total = results.reduce((sum, item) => sum + item.value, 0);
      setTotalValue(total);
    } catch (err) {
      console.error('Error fetching prices:', err);
    }
  }, [portfolio, availableCoins]);

  // ----------------------------------------
  // PORTFOLIO ACTIONS
  // ----------------------------------------
  // Add token to portfolio
  const addToken = async (e) => {
    e.preventDefault();
    setError('');

    if (!symbol || !amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid symbol and amount');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/portfolio`, {
        symbol: symbol.toUpperCase(),
        amount: parseFloat(amount)
      });

      setSymbol('');
      setAmount('');
      await fetchPortfolio();
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding token');
    } finally {
      setLoading(false);
    }
  };

  // Delete token from portfolio
  const deleteToken = async (tokenSymbol) => {
    try {
      await axios.delete(`${API_BASE_URL}/portfolio/${tokenSymbol}`);
      await fetchPortfolio();
    } catch (err) {
      console.error('Error deleting token:', err);
    }
  };

  // ----------------------------------------
  // LIFECYCLE & EFFECTS
  // ----------------------------------------
  // Load portfolio and available coins on mount
  useEffect(() => {
    fetchPortfolio();
    fetchAvailableCoins();
  }, []);

  // Fetch prices when portfolio changes
  useEffect(() => {
    fetchPrices();
  }, [portfolio, fetchPrices]);

  // Auto-refresh prices every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPrices();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchPrices]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="App">
      {/* ---------------------------------------- */}
      {/* HEADER */}
      {/* ---------------------------------------- */}
      <header className="App-header">
        <h1>💰 Web3 Crypto Portfolio Tracker</h1>
        <p className="subtitle">Track your crypto assets in real-time</p>
      </header>

      <main className="container">
        {/* ---------------------------------------- */}
        {/* ADD TOKEN SECTION */}
        {/* ---------------------------------------- */}
        <section className="add-token-section">
          <h2>Add Token</h2>
          <form onSubmit={addToken} className="add-token-form">
            {/* Autocomplete Input */}
            <div className="form-group autocomplete-wrapper">
              <input
                type="text"
                placeholder="Token Symbol (e.g., BTC, ETH, SOL)"
                value={symbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
                onFocus={() => symbol && filteredCoins.length > 0 && setShowSuggestions(true)}
                onBlur={handleBlur}
                className="input"
                autoComplete="off"
              />
              {/* Suggestions Dropdown */}
              {showSuggestions && filteredCoins.length > 0 && (
                <div className="suggestions-dropdown">
                  {filteredCoins.map((coin) => (
                    <div
                      key={coin.id}
                      className="suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur
                        selectCoin(coin.symbol);
                      }}
                    >
                      {coin.image && <img src={coin.image} alt={coin.symbol} className="coin-icon" />}
                      <div className="coin-info">
                        <span className="coin-symbol">{coin.symbol}</span>
                        <span className="coin-name">{coin.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div className="form-group">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="any"
                min="0"
                className="input"
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Token'}
            </button>
          </form>

          {/* Error Message */}
          {error && <p className="error-message">{error}</p>}
        </section>

        {/* ---------------------------------------- */}
        {/* PORTFOLIO SECTION */}
        {/* ---------------------------------------- */}
        <section className="portfolio-section">
          <h2>Your Portfolio</h2>
          {portfolioWithPrices.length === 0 ? (
            <p className="empty-message">No tokens in your portfolio. Add some to get started!</p>
          ) : (
            <>
              {/* Portfolio Cards Grid */}
              <div className="portfolio-cards">
                {portfolioWithPrices.map((token, index) => (
                  <div key={index} className="token-card">
                    {/* Card Header */}
                    <div className="card-header">
                      {token.image && (
                        <img src={token.image} alt={token.symbol} className="token-image" />
                      )}
                      <div className="token-title">
                        <h3 className="token-symbol">{token.symbol}</h3>
                        <p className="token-name">{token.name}</p>
                      </div>
                      <button 
                        onClick={() => deleteToken(token.symbol)} 
                        className="btn-delete-card"
                        title="Remove token"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {/* Card Body */}
                    <div className="card-body">
                      {/* Amount Row */}
                      <div className="card-row">
                        <span className="card-label">Amount</span>
                        <span className="card-value">{token.amount.toLocaleString(undefined, { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 8 
                        })}</span>
                      </div>
                      
                      {/* Price Row */}
                      <div className="card-row">
                        <span className="card-label">Price (PHP)</span>
                        <span className="card-value">
                          {token.error ? (
                            <span className="error-text">Error</span>
                          ) : (
                            `₱${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          )}
                        </span>
                      </div>
                      
                      {/* 24h Change Row */}
                      <div className="card-row">
                        <span className="card-label">24h Change</span>
                        <span className="card-value">
                          {token.error ? (
                            <span className="error-text">-</span>
                          ) : (
                            <span className={token.change24h >= 0 ? 'positive' : 'negative'}>
                              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                            </span>
                          )}
                        </span>
                      </div>
                      
                      {/* Total Value Row */}
                      <div className="card-row card-total">
                        <span className="card-label">Value</span>
                        <span className="card-value-highlight">
                          ₱{token.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Portfolio Value */}
              <div className="total-section">
                <h3>Total Portfolio Value</h3>
                <p className="total-value">
                  ₱{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </>
          )}
        </section>

        {/* ---------------------------------------- */}
        {/* FOOTER */}
        {/* ---------------------------------------- */}
        <footer className="info-footer">
          <p>📊 Prices update every 30 seconds | Data from CoinGecko API</p>
          <p className="supported-tokens">
            🚀 Search from 250+ cryptocurrencies | Type to see suggestions
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
