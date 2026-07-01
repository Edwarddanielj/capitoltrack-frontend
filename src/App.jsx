import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "https://capitoltrack-production.up.railway.app";

function App() {
  const [stats, setStats] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [party, setParty] = useState("");
  const [state, setState] = useState("");
  const [ticker, setTicker] = useState("");

  async function fetchStats() {
    const response = await fetch(`${API_BASE}/api/stats`);
    const data = await response.json();
    setStats(data);
  }

  async function fetchTrades() {
    setLoading(true);

    const params = new URLSearchParams();
    params.append("page", "1");
    params.append("limit", "20");

    if (party) params.append("party", party);
    if (state) params.append("state", state);
    if (ticker) params.append("ticker", ticker);

    const response = await fetch(`${API_BASE}/api/trades?${params.toString()}`);
    const data = await response.json();

    setTrades(data.results || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchStats();
    fetchTrades();
  }, []);

  function handleSearch() {
    fetchTrades();
  }

  function clearFilters() {
    setParty("");
    setState("");
    setTicker("");
    setTimeout(() => {
      fetchTrades();
    }, 100);
  }

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Congressional Trading Dashboard</p>
          <h1>CapitolTrack</h1>
          <p className="subtitle">
            Track what U.S. politicians are trading, which stocks are getting attention,
            and where activity is happening.
          </p>
        </div>
      </header>

      <section className="stats-grid">
        <div className="card">
          <p>Total Trades</p>
          <h2>{stats ? stats.total_trades : "..."}</h2>
        </div>

        <div className="card">
          <p>Total Politicians</p>
          <h2>{stats ? stats.total_politicians : "..."}</h2>
        </div>

        <div className="card">
          <p>Top Ticker</p>
          <h2>{stats ? stats.top_ticker : "..."}</h2>
        </div>

        <div className="card">
          <p>Avg Price Change</p>
          <h2>
            {stats && stats.average_price_change
              ? `${stats.average_price_change.toFixed(2)}%`
              : "..."}
          </h2>
        </div>
      </section>

      <section className="filters">
        <h2>Recent Trades</h2>

        <div className="filter-row">
          <select value={party} onChange={(e) => setParty(e.target.value)}>
            <option value="">All Parties</option>
            <option value="Democrat">Democrat</option>
            <option value="Republican">Republican</option>
          </select>

          <input
            type="text"
            placeholder="State, ex: CA"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />

          <input
            type="text"
            placeholder="Ticker, ex: NVDA"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
          />

          <button onClick={handleSearch}>Search</button>
          <button className="secondary" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </section>

      <section className="table-card">
        {loading ? (
          <p className="loading">Loading trades...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Politician</th>
                <th>Party</th>
                <th>State</th>
                <th>Ticker</th>
                <th>Trade Type</th>
                <th>Trade Date</th>
                <th>Price Change</th>
              </tr>
            </thead>

            <tbody>
              {trades.map((trade, index) => (
                <tr key={index}>
                  <td>{trade.politician_name}</td>
                  <td>{trade.party}</td>
                  <td>{trade.state}</td>
                  <td className="ticker">{trade.ticker}</td>
                  <td>{trade.trade_type}</td>
                  <td>{trade.trade_date}</td>
                  <td>
                    {trade.price_change !== null
                      ? `${trade.price_change.toFixed(2)}%`
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;