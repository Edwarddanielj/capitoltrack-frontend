import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "https://capitoltrack-production.up.railway.app";

function App() {
  const [stats, setStats] = useState(null);
  const [trades, setTrades] = useState([]);
  const [politicians, setPoliticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [party, setParty] = useState("");
  const [state, setState] = useState("");
  const [ticker, setTicker] = useState("");

  async function fetchStats() {
    const response = await fetch(`${API_BASE}/api/stats`);
    const data = await response.json();
    setStats(data);
  }

  async function fetchPoliticians() {
    const response = await fetch(`${API_BASE}/api/politicians?limit=5`);
    const data = await response.json();
    setPoliticians(data.results || data.politicians || []);
  }

  async function fetchTrades(currentPage = 1) {
    setLoading(true);

    const params = new URLSearchParams();
    params.append("page", currentPage);
    params.append("limit", "20");

    if (party) params.append("party", party);
    if (state) params.append("state", state);
    if (ticker) params.append("ticker", ticker);

    const response = await fetch(`${API_BASE}/api/trades?${params.toString()}`);
    const data = await response.json();

    setTrades(data.results || []);
    setTotalPages(data.total_pages || 1);
    setLoading(false);
  }

  useEffect(() => {
    fetchStats();
    fetchPoliticians();
    fetchTrades(1);
  }, []);

  // Re-fetch when page changes
  useEffect(() => {
    fetchTrades(page);
  }, [page]);

  function handleSearch() {
    setPage(1);
    fetchTrades(1);
  }

  function clearFilters() {
    setParty("");
    setState("");
    setTicker("");
    setPage(1);
    setTimeout(() => {
      fetchTrades(1);
    }, 100);
  }

  function getTradeTypeClass(tradeType) {
    if (!tradeType) return "";
    const lower = tradeType.toLowerCase();
    if (lower.includes("purchase")) return "trade-type-purchase";
    if (lower.includes("sale")) return "trade-type-sale";
    return "";
  }

  function getPriceChangeClass(change) {
    if (change === null || change === undefined) return "";
    return change >= 0 ? "price-positive" : "price-negative";
  }

  return (
    <div className="app">

      {/* ── HEADER ── */}
      <header className="hero">
        <div>
          <div className="live-badge">
            <span className="live-dot"></span>
            Live Data Connected
          </div>
          <p className="eyebrow">Congressional Trading Dashboard</p>
          <h1>CapitolTrack</h1>
          <p className="subtitle">
            Track what U.S. politicians are trading, which stocks are getting
            attention, and where activity is happening.
          </p>
        </div>
      </header>

      {/* ── KPI CARDS ── */}
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

      {/* ── TOP POLITICIANS ── */}
      <section className="politicians-section">
        <h2 className="section-title">Most Active Politicians</h2>
        <div className="politician-list">
          {politicians.length > 0 ? (
            politicians.map((pol) => (
              <div key={pol.id} className="politician-card">
                {pol.photo_url && (
                  <img
                    src={pol.photo_url}
                    alt={pol.name}
                    className="politician-photo"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
                <div className="politician-info">
                  <div className="politician-name">{pol.name}</div>
                  <div className="politician-meta">
                    <span className={pol.party === "D" || pol.party === "Democrat" ? "party-d" : "party-r"}>
                      {pol.party === "D" ? "Democrat" : pol.party === "R" ? "Republican" : pol.party}
                    </span>
                    <span className="politician-state">{pol.state}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="loading">Loading politicians...</p>
          )}
        </div>
      </section>

      {/* ── FILTERS ── */}
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
          <button className="secondary" onClick={clearFilters}>Clear</button>
        </div>
      </section>

      {/* ── TRADES TABLE ── */}
      <section className="table-card">
        {loading ? (
          <p className="loading">Loading trades...</p>
        ) : (
          <>
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
                    <td>
                      <span className={
                        trade.party === "D" || trade.party === "Democrat"
                          ? "party-d"
                          : "party-r"
                      }>
                        {trade.party === "D" ? "Dem" : trade.party === "R" ? "Rep" : trade.party}
                      </span>
                    </td>
                    <td>{trade.state}</td>
                    <td className="ticker">{trade.ticker}</td>
                    <td>
                      <span className={getTradeTypeClass(trade.trade_type)}>
                        {trade.trade_type}
                      </span>
                    </td>
                    <td>{trade.trade_date}</td>
                    <td>
                      <span className={getPriceChangeClass(trade.price_change)}>
                        {trade.price_change !== null && trade.price_change !== undefined
                          ? `${trade.price_change >= 0 ? "+" : ""}${trade.price_change.toFixed(2)}%`
                          : "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── PAGINATION ── */}
            <div className="pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default App;