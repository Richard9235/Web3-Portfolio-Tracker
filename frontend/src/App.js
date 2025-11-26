import { useState, useEffect, useCallback } from 'react';
import './App.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioWithPrices, setPortfolioWithPrices] = useState([]);
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalValue, setTotalValue] = useState(0);

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
          return {
            ...item,
            price: response.data.price,
            change24h: response.data.change24h,
            value: value
          };
        } catch (err) {
          console.error(`Error fetching price for ${item.symbol}:`, err);
          return {
            ...item,
            price: 0,
            change24h: 0,
            value: 0,
            error: true
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
  }, [portfolio]);

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

  // Load portfolio on mount
  useEffect(() => {
    fetchPortfolio();
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>💰 Web3 Crypto Portfolio Tracker</h1>
        <p className="subtitle">Track your crypto assets in real-time</p>
      </header>

      <main className="container">
        <section className="add-token-section">
          <h2>Add Token</h2>
          <form onSubmit={addToken} className="add-token-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Token Symbol (e.g., BTC, ETH, SOL)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="input"
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.000001"
                className="input"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Token'}
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </section>

        <section className="portfolio-section">
          <h2>Your Portfolio</h2>
          {portfolioWithPrices.length === 0 ? (
            <p className="empty-message">No tokens in your portfolio. Add some to get started!</p>
          ) : (
            <>
              <div className="portfolio-grid">
                <div className="grid-header">Symbol</div>
                <div className="grid-header">Amount</div>
                <div className="grid-header">Price (PHP)</div>
                <div className="grid-header">24h Change</div>
                <div className="grid-header">Value (PHP)</div>
                <div className="grid-header">Action</div>

                {portfolioWithPrices.map((token) => (
                  <>
                    <div className="grid-cell symbol-cell">{token.symbol}</div>
                    <div className="grid-cell">{token.amount.toLocaleString()}</div>
                    <div className="grid-cell">
                      {token.error ? (
                        <span className="error-text">Error</span>
                      ) : (
                        `₱${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      )}
                    </div>
                    <div className="grid-cell">
                      {token.error ? (
                        <span className="error-text">-</span>
                      ) : (
                        <span className={token.change24h >= 0 ? 'positive' : 'negative'}>
                          {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                        </span>
                      )}
                    </div>
                    <div className="grid-cell value-cell">
                      ₱{token.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="grid-cell">
                      <button 
                        onClick={() => deleteToken(token.symbol)} 
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                ))}
              </div>

              <div className="total-section">
                <h3>Total Portfolio Value</h3>
                <p className="total-value">
                  ₱{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </>
          )}
        </section>

        <footer className="info-footer">
          <p>📊 Prices update every 30 seconds | Data from CoinGecko API</p>
          <p className="supported-tokens">
            Supported tokens: BTC, ETH, SOL, ADA, DOT, MATIC, AVAX, LINK, UNI, LTC, XRP, BNB, DOGE, SHIB, USDT, USDC
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
