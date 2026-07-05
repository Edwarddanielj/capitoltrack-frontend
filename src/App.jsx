import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import "./App.css";

const API_BASE = "https://capitoltrack-production.up.railway.app";

const COMPANY_NAMES = {
  MSFT: "Microsoft",
  AAPL: "Apple",
  NVDA: "Nvidia",
  GOOGL: "Alphabet",
  GOOG: "Alphabet",
  LLY: "Eli Lilly",
  TDG: "TransDigm Group",
  FLEX: "Flex",
  WFC: "Wells Fargo",
  CVX: "Chevron",
  IBP: "Installed Building Products",
};

function App() {
  const [stats, setStats] = useState(null);
  const [trades, setTrades] = useState([]);
  const [politicians, setPoliticians] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [partyChartData, setPartyChartData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [trendingTickers, setTrendingTickers] = useState([]);

  const [tradeFilter, setTradeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [tradeError, setTradeError] = useState("");

  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [selectedTicker, setSelectedTicker] = useState(null);
  const [tickerTrades, setTickerTrades] = useState([]);
  const [tickerLoading, setTickerLoading] = useState(false);

  const [selectedTrade, setSelectedTrade] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertWatch, setAlertWatch] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  async function fetchStats() {
    try {
      const response = await fetch(`${API_BASE}/api/stats`);

      if (!response.ok) {
        throw new Error(`Stats request failed: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Stats fetch failed:", error);
    }
  }

  async function fetchTrades() {
    try {
      setLoading(true);
      setTradeError("");

      const response = await fetch(`${API_BASE}/api/trades?page=1&limit=100`);

      if (!response.ok) {
        throw new Error(`Trades request failed: ${response.status}`);
      }

      const data = await response.json();
      setTrades(data.results || []);
    } catch (error) {
      console.error("Trades fetch failed:", error);
      setTradeError("Trades could not load from the backend.");
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPoliticians() {
    try {
      const response = await fetch(`${API_BASE}/api/politicians?limit=100`);

      if (!response.ok) {
        throw new Error(`Politicians request failed: ${response.status}`);
      }

      const data = await response.json();
      setPoliticians(data.results || []);
    } catch (error) {
      console.error("Politicians fetch failed:", error);
      setPoliticians([]);
    }
  }

  async function fetchLeaderboard() {
    try {
      const response = await fetch(`${API_BASE}/api/leaderboard?limit=8`);

      if (!response.ok) {
        throw new Error(`Leaderboard request failed: ${response.status}`);
      }

      const data = await response.json();
      setLeaderboard(data.results || []);
    } catch (error) {
      console.error("Leaderboard fetch failed:", error);
      setLeaderboard([]);
    }
  }

  async function fetchPartyChart() {
    try {
      const response = await fetch(`${API_BASE}/api/charts/buy-volume-by-party`);

      if (!response.ok) {
        throw new Error(`Party chart request failed: ${response.status}`);
      }

      const data = await response.json();
      setPartyChartData(data.results || []);
    } catch (error) {
      console.error("Party chart fetch failed:", error);
      setPartyChartData([]);
    }
  }

  async function fetchVolumeChart() {
    try {
      const response = await fetch(
        `${API_BASE}/api/charts/trade-volume-over-time?limit=12`
      );

      if (!response.ok) {
        throw new Error(`Volume chart request failed: ${response.status}`);
      }

      const data = await response.json();
      setVolumeData(data.results || []);
    } catch (error) {
      console.error("Volume chart fetch failed:", error);
      setVolumeData([]);
    }
  }

  async function fetchSummaries() {
    try {
      const response = await fetch(`${API_BASE}/api/summaries/recent-trades?limit=6`);

      if (!response.ok) {
        throw new Error(`Summaries request failed: ${response.status}`);
      }

      const data = await response.json();
      setSummaries(data.results || []);
    } catch (error) {
      console.error("Summaries fetch failed:", error);
      setSummaries([]);
    }
  }

  async function fetchTrendingTickers() {
    try {
      const response = await fetch(`${API_BASE}/api/trending-tickers?limit=8`);

      if (!response.ok) {
        throw new Error(`Trending tickers request failed: ${response.status}`);
      }

      const data = await response.json();
      setTrendingTickers(data.results || []);
    } catch (error) {
      console.error("Trending tickers fetch failed:", error);
      setTrendingTickers([]);
    }
  }

  async function openPoliticianProfile(name) {
    try {
      setProfileLoading(true);
      setSelectedProfile(null);
      setCurrentView("politician");

      const encodedName = encodeURIComponent(name);
      const response = await fetch(`${API_BASE}/api/politicians/${encodedName}`);

      if (!response.ok) {
        throw new Error(`Profile request failed: ${response.status}`);
      }

      const data = await response.json();
      setSelectedProfile(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Politician profile fetch failed:", error);
      setSelectedProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }

  async function openTickerPage(ticker) {
    try {
      setTickerLoading(true);
      setSelectedTicker(ticker);
      setTickerTrades([]);
      setCurrentView("ticker");

      const response = await fetch(
        `${API_BASE}/api/trades?ticker=${encodeURIComponent(ticker)}&page=1&limit=200`
      );

      if (!response.ok) {
        throw new Error(`Ticker trades request failed: ${response.status}`);
      }

      const data = await response.json();
      setTickerTrades(data.results || []);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Ticker page fetch failed:", error);
      setTickerTrades([]);
    } finally {
      setTickerLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    fetchTrades();
    fetchPoliticians();
    fetchLeaderboard();
    fetchPartyChart();
    fetchVolumeChart();
    fetchSummaries();
    fetchTrendingTickers();
  }, []);

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const type = trade.trade_type?.toLowerCase() || "";

      if (tradeFilter === "Buys") {
        return type.includes("purchase") || type.includes("buy");
      }

      if (tradeFilter === "Sells") {
        return type.includes("sale") || type.includes("sell");
      }

      return true;
    });
  }, [trades, tradeFilter]);

  const recentTrades = filteredTrades.slice(0, 5);
  const searchResults = getSearchResults(searchTerm, politicians, trendingTickers, trades);
  const tickerStats = selectedTicker ? getTickerStats(selectedTicker, tickerTrades) : null;
  const tickerVolumeData = selectedTicker ? getTickerVolumeData(tickerTrades) : [];

  function goHome() {
    setCurrentView("dashboard");
    setSelectedProfile(null);
    setSelectedTicker(null);
    setTickerTrades([]);
    setSearchTerm("");
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAlertSubmit(e) {
    e.preventDefault();

    const savedAlert = {
      email: alertEmail,
      watch: alertWatch,
      createdAt: new Date().toISOString(),
    };

    const existingAlerts = JSON.parse(
      localStorage.getItem("capitoltrack_alerts") || "[]"
    );

    localStorage.setItem(
      "capitoltrack_alerts",
      JSON.stringify([...existingAlerts, savedAlert])
    );

    setAlertMessage(
      "Alert saved locally. Backend email sending with Resend is the next step."
    );
    setAlertEmail("");
    setAlertWatch("");
  }

  return (
    <div className="page">
      <div className="dashboard-shell">
        <nav className="top-nav">
          <button className="brand brand-button" onClick={goHome}>
            Capitol<span>Track</span>
          </button>

          <div className="global-search">
            <input
              type="text"
              placeholder="Search politicians or tickers..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
            />

            {searchOpen && searchTerm.trim() && (
              <div className="search-dropdown">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.label}`}
                      onClick={() => {
                        if (result.type === "politician") {
                          openPoliticianProfile(result.label);
                        } else {
                          openTickerPage(result.label);
                        }

                        setSearchOpen(false);
                        setSearchTerm("");
                      }}
                    >
                      <span>{result.type === "politician" ? "Politician" : "Ticker"}</span>
                      <strong>{result.label}</strong>
                      <em>{result.meta}</em>
                    </button>
                  ))
                ) : (
                  <p>No results found.</p>
                )}
              </div>
            )}
          </div>

          <div className="nav-actions">
            <button className="nav-pill" onClick={goHome}>
              Live Data
            </button>
            <button className="nav-pill" onClick={() => setAlertsOpen(true)}>
              Alerts
            </button>
          </div>
        </nav>

        <section className="top-box-grid">
          <div className="top-stat-box">
            <p>Trades tracked</p>
            <h2>{stats ? stats.total_trades : "..."}</h2>
            <span className="green">Live database</span>
          </div>

          <div className="top-stat-box">
            <p>Active politicians</p>
            <h2>{stats ? stats.total_politicians : "..."}</h2>
            <span>Across Congress</span>
          </div>

          <div className="top-stat-box">
            <p>Avg price change</p>
            <h2>
              {stats?.average_price_change
                ? `${stats.average_price_change.toFixed(2)}%`
                : "..."}
            </h2>
            <span>Trade window</span>
          </div>

          <div className="top-stat-box">
            <p>Top traded ticker</p>
            <h2>{stats ? stats.top_ticker : "..."}</h2>
            <span className="green">Most active stock</span>
          </div>
        </section>

        <section className="trending-banner">
          <div className="trending-heading">
            <p>Trending tickers</p>
            <span>Most active tickers in the current database</span>
          </div>

          <div className="trending-ticker-list">
            {trendingTickers.length > 0 ? (
              trendingTickers.map((item) => (
                <button
                  className="trending-pill"
                  key={item.ticker}
                  onClick={() => openTickerPage(item.ticker)}
                >
                  <strong>{item.ticker}</strong>
                  <span>{item.trade_count} trades</span>
                  <em className={item.avg_price_change >= 0 ? "green" : "red"}>
                    {item.avg_price_change !== null
                      ? `${item.avg_price_change >= 0 ? "+" : ""}${item.avg_price_change.toFixed(2)}%`
                      : "N/A"}
                  </em>
                </button>
              ))
            ) : (
              <p className="muted">Loading trending tickers...</p>
            )}
          </div>
        </section>

        {currentView === "dashboard" && (
          <>
            <section className="panel active-politicians-panel">
              <div className="panel-heading panel-heading-row">
                <div>
                  <h3>Active Politicians</h3>
                  <p>Click a politician to open their profile.</p>
                </div>
              </div>

              <div className="politician-scroll-box">
                {politicians.length > 0 ? (
                  politicians.map((pol) => (
                    <button
                      className="politician-row"
                      key={pol.name}
                      onClick={() => openPoliticianProfile(pol.name)}
                    >
                      <div className="politician-image-wrap">
                        {pol.photo_url ? (
                          <img
                            src={pol.photo_url}
                            alt={pol.name}
                            className="politician-photo"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement.classList.add(
                                "show-initials"
                              );
                            }}
                          />
                        ) : null}

                        <span className="politician-initials">
                          {getInitials(pol.name)}
                        </span>
                      </div>

                      <div className="politician-details">
                        <strong>{pol.name}</strong>
                        <span>
                          {pol.party_display || formatParty(pol.party)} ·{" "}
                          {pol.state || "Unknown"}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="muted">Loading politicians...</p>
                )}
              </div>
            </section>

            <main className="dashboard-grid">
              <section className="panel recent-panel">
                <div className="panel-heading">
                  <h3>Recent Trades</h3>
                </div>

                <div className="trade-tabs">
                  <button
                    className={tradeFilter === "All" ? "active" : ""}
                    onClick={() => setTradeFilter("All")}
                  >
                    All
                  </button>

                  <button
                    className={tradeFilter === "Buys" ? "active" : ""}
                    onClick={() => setTradeFilter("Buys")}
                  >
                    Buys
                  </button>

                  <button
                    className={tradeFilter === "Sells" ? "active" : ""}
                    onClick={() => setTradeFilter("Sells")}
                  >
                    Sells
                  </button>
                </div>

                {loading ? (
                  <p className="muted">Loading trades...</p>
                ) : tradeError ? (
                  <p className="muted">{tradeError}</p>
                ) : recentTrades.length > 0 ? (
                  <div className="trade-list">
                    {recentTrades.map((trade) => (
                      <button
                        className="trade-item trade-item-button"
                        key={trade.id}
                        onClick={() => setSelectedTrade(trade)}
                      >
                        <div className="avatar">
                          {getInitials(trade.politician_name)}
                        </div>

                        <div className="trade-main">
                          <strong>{trade.politician_name}</strong>
                          <span>
                            {trade.chamber || "Congress"} · {trade.trade_date}
                          </span>
                        </div>

                        <div className="trade-side">
                          <div>
                            <strong
                              className="ticker-link"
                              onClick={(e) => {
                                e.stopPropagation();
                                openTickerPage(trade.ticker);
                              }}
                            >
                              {trade.ticker}
                            </strong>
                            <span className={getTradeBadgeClass(trade.trade_type)}>
                              {trade.trade_type_display ||
                                formatTradeType(trade.trade_type)}
                            </span>
                          </div>

                          <small>
                            {formatMoney(trade.amount_min)}-
                            {formatMoney(trade.amount_max)}
                          </small>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No trades found.</p>
                )}
              </section>

              <section className="panel leaderboard-panel">
                <div className="panel-heading">
                  <h3>Performance Leaderboard</h3>
                </div>

                <div className="leaderboard-list">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((person) => (
                      <button
                        className="leaderboard-row"
                        key={person.name}
                        onClick={() => openPoliticianProfile(person.name)}
                      >
                        <span className="rank">#{person.rank}</span>

                        <div>
                          <strong>{person.name}</strong>
                          <span>{person.trade_count} tracked trades</span>
                        </div>

                        <p
                          className={
                            person.avg_price_change >= 0 ? "green" : "red"
                          }
                        >
                          {person.avg_price_change !== null
                            ? `${person.avg_price_change >= 0 ? "+" : ""}${person.avg_price_change.toFixed(2)}%`
                            : "N/A"}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="muted">No leaderboard data found yet.</p>
                  )}
                </div>
              </section>

              <section className="panel chart-panel">
                <div className="panel-heading">
                  <h3>Buy Volume by Party</h3>
                </div>

                {partyChartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={230}>
                      <BarChart data={partyChartData}>
                        <XAxis dataKey="month" stroke="#8a8a8a" tickLine={false} />
                        <YAxis stroke="#8a8a8a" tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            background: "#101010",
                            border: "1px solid #444",
                            color: "#fff",
                          }}
                        />
                        <Bar
                          dataKey="Democrat"
                          fill="#2276c9"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="Republican"
                          fill="#b93434"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>

                    <div className="legend">
                      <span>
                        <i className="blue-dot"></i> Democrat
                      </span>

                      <span>
                        <i className="red-dot"></i> Republican
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="muted">No party chart data available yet.</p>
                )}
              </section>

              <section className="panel">
                <div className="panel-heading">
                  <h3>Top Tickers by Congressional Activity</h3>
                </div>

                <div className="ticker-list">
                  {trendingTickers.length > 0 ? (
                    trendingTickers.slice(0, 5).map((item) => (
                      <button
                        className="ticker-row ticker-row-button"
                        key={item.ticker}
                        onClick={() => openTickerPage(item.ticker)}
                      >
                        <div>
                          <strong>{item.ticker}</strong>
                          <span>
                            {item.buy_count} buys · {item.sell_count} sells
                          </span>
                        </div>

                        <p
                          className={
                            item.avg_price_change >= 0 ? "green" : "red"
                          }
                        >
                          {item.avg_price_change !== null
                            ? `${item.avg_price_change >= 0 ? "+" : ""}${item.avg_price_change.toFixed(2)}%`
                            : "N/A"}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="muted">No ticker data found.</p>
                  )}
                </div>
              </section>

              <section className="panel chart-panel">
                <div className="panel-heading">
                  <h3>Trade Volume Over Time</h3>
                </div>

                {volumeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={230}>
                    <LineChart data={volumeData}>
                      <CartesianGrid stroke="#333333" vertical={false} />
                      <XAxis dataKey="date" stroke="#8a8a8a" tickLine={false} />
                      <YAxis stroke="#8a8a8a" tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "#101010",
                          border: "1px solid #444",
                          color: "#fff",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        stroke="#13a87d"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#13a87d" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="muted">No volume chart data available yet.</p>
                )}
              </section>

              <section className="panel summaries-panel">
                <div className="panel-heading">
                  <h3>Plain English Summaries</h3>
                </div>

                <div className="summary-list">
                  {summaries.length > 0 ? (
                    summaries.map((item) => (
                      <button
                        className="summary-card summary-card-button"
                        key={item.id}
                        onClick={() => setSelectedTrade(item)}
                      >
                        <strong>
                          {item.politician_name}{" "}
                          {formatSummaryAction(item.trade_type)} {item.ticker}
                        </strong>

                        <p>{item.summary}</p>
                      </button>
                    ))
                  ) : (
                    <p className="muted">No summaries available yet.</p>
                  )}
                </div>
              </section>
            </main>
          </>
        )}

        {currentView === "politician" && (
          <PoliticianProfilePage
            profile={selectedProfile}
            loading={profileLoading}
            onBack={goHome}
            onOpenTicker={openTickerPage}
            onOpenTrade={setSelectedTrade}
          />
        )}

        {currentView === "ticker" && (
          <TickerPage
            ticker={selectedTicker}
            loading={tickerLoading}
            trades={tickerTrades}
            stats={tickerStats}
            volumeData={tickerVolumeData}
            onBack={goHome}
            onOpenPolitician={openPoliticianProfile}
            onOpenTrade={setSelectedTrade}
          />
        )}
      </div>

      {selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onOpenPolitician={openPoliticianProfile}
          onOpenTicker={openTickerPage}
        />
      )}

      {alertsOpen && (
        <div className="modal-backdrop" onClick={() => setAlertsOpen(false)}>
          <div className="trade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <p className="modal-label">Email alerts</p>
                <h2>Track politicians and tickers</h2>
              </div>

              <button className="modal-close" onClick={() => setAlertsOpen(false)}>
                Close
              </button>
            </div>

            <form className="alert-form" onSubmit={handleAlertSubmit}>
              <label>
                Email address
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                />
              </label>

              <label>
                Watchlist item
                <input
                  type="text"
                  required
                  placeholder="Example: Nancy Pelosi or NVDA"
                  value={alertWatch}
                  onChange={(e) => setAlertWatch(e.target.value)}
                />
              </label>

              <button type="submit">Save alert</button>
            </form>

            {alertMessage && <p className="alert-message">{alertMessage}</p>}

            <div className="modal-summary">
              <h3>Next backend step</h3>
              <p>
                This form is ready visually. To make it send real emails, add a
                Supabase alerts table, a backend /api/alerts route, and Resend email
                sending inside your daily GitHub Actions pipeline.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PoliticianProfilePage({
  profile,
  loading,
  onBack,
  onOpenTicker,
  onOpenTrade,
}) {
  if (loading) {
    return (
      <section className="panel profile-page-panel">
        <p className="muted">Loading politician profile...</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="panel profile-page-panel">
        <button className="back-button" onClick={onBack}>
          Back to dashboard
        </button>
        <p className="muted">Profile could not be loaded.</p>
      </section>
    );
  }

  const mostTradedTicker = getMostTradedTicker(profile.recent_trades || []);
  const personalVolumeData = getTickerVolumeData(profile.recent_trades || []);

  return (
    <section className="panel profile-page-panel">
      <button className="back-button" onClick={onBack}>
        Back to dashboard
      </button>

      <div className="profile-hero">
        <div className="profile-hero-photo">
          {profile.photo_url ? (
            <img src={profile.photo_url} alt={profile.name} />
          ) : (
            <span>{getInitials(profile.name)}</span>
          )}
        </div>

        <div>
          <h1>{profile.name}</h1>
          <div className="profile-badges">
            <span className={profile.party_display === "Democrat" ? "party-dem" : "party-rep"}>
              {profile.party_display || formatParty(profile.party)}
            </span>
            <span>{profile.state || "Unknown"}</span>
            <span>{profile.chamber || "Congress"}</span>
          </div>
          <p>{profile.summary}</p>
        </div>
      </div>

      <div className="profile-stat-grid">
        <div className="profile-stat-box">
          <p>Total trades</p>
          <h3>{profile.total_trades}</h3>
        </div>

        <div className="profile-stat-box">
          <p>Most traded ticker</p>
          <h3>{mostTradedTicker}</h3>
        </div>

        <div className="profile-stat-box">
          <p>Average return</p>
          <h3 className={profile.avg_price_change >= 0 ? "green-text" : "red-text"}>
            {profile.avg_price_change !== null
              ? `${profile.avg_price_change >= 0 ? "+" : ""}${profile.avg_price_change.toFixed(2)}%`
              : "N/A"}
          </h3>
        </div>

        <div className="profile-stat-box">
          <p>Buy/Sell split</p>
          <h3>
            {profile.buy_trades}/{profile.sell_trades}
          </h3>
        </div>
      </div>

      <div className="profile-page-grid">
        <div className="profile-history-card">
          <h3>Complete personal trade history</h3>

          {profile.recent_trades?.length > 0 ? (
            <div className="profile-table">
              {profile.recent_trades.map((trade) => (
                <button
                  className="profile-table-row"
                  key={trade.id}
                  onClick={() =>
                    onOpenTrade({
                      ...trade,
                      politician_name: profile.name,
                      party_display: profile.party_display,
                      state: profile.state,
                      chamber: profile.chamber,
                      photo_url: profile.photo_url,
                    })
                  }
                >
                  <span
                    className="ticker-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTicker(trade.ticker);
                    }}
                  >
                    {trade.ticker}
                  </span>
                  <span className={getTradeBadgeClass(trade.trade_type)}>
                    {trade.trade_type_display || formatTradeType(trade.trade_type)}
                  </span>
                  <span>{trade.trade_date || "Unknown date"}</span>
                  <span>
                    {formatMoney(trade.amount_min)}-{formatMoney(trade.amount_max)}
                  </span>
                  <span className={trade.price_change >= 0 ? "green" : "red"}>
                    {trade.price_change !== null && trade.price_change !== undefined
                      ? `${trade.price_change >= 0 ? "+" : ""}${Number(
                          trade.price_change
                        ).toFixed(2)}%`
                      : "N/A"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="muted">No trades found for this politician.</p>
          )}
        </div>

        <div className="profile-chart-card">
          <h3>Trade volume over time</h3>

          {personalVolumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={personalVolumeData}>
                <CartesianGrid stroke="#333333" vertical={false} />
                <XAxis dataKey="date" stroke="#8a8a8a" tickLine={false} />
                <YAxis stroke="#8a8a8a" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#101010",
                    border: "1px solid #444",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#13a87d"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#13a87d" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="muted">No chart data available yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function TickerPage({
  ticker,
  loading,
  trades,
  stats,
  volumeData,
  onBack,
  onOpenPolitician,
  onOpenTrade,
}) {
  if (loading) {
    return (
      <section className="panel profile-page-panel">
        <p className="muted">Loading ticker page...</p>
      </section>
    );
  }

  return (
    <section className="panel profile-page-panel">
      <button className="back-button" onClick={onBack}>
        Back to dashboard
      </button>

      <div className="ticker-hero">
        <div>
          <p className="modal-label">Ticker page</p>
          <h1>{ticker}</h1>
          <span>{COMPANY_NAMES[ticker] || "Company name not available yet"}</span>
        </div>

        <button className="nav-pill">Congressional Activity</button>
      </div>

      <div className="profile-stat-grid">
        <div className="profile-stat-box">
          <p>Total congressional trades</p>
          <h3>{stats.totalTrades}</h3>
        </div>

        <div className="profile-stat-box">
          <p>Politicians who traded it</p>
          <h3>{stats.uniquePoliticians}</h3>
        </div>

        <div className="profile-stat-box">
          <p>Purchase vs sale ratio</p>
          <h3>{stats.buySellRatio}</h3>
        </div>

        <div className="profile-stat-box">
          <p>Avg price change</p>
          <h3 className={stats.avgChange >= 0 ? "green-text" : "red-text"}>
            {stats.avgChange !== null
              ? `${stats.avgChange >= 0 ? "+" : ""}${stats.avgChange.toFixed(2)}%`
              : "N/A"}
          </h3>
        </div>
      </div>

      <div className="profile-page-grid">
        <div className="profile-history-card">
          <h3>Politicians who traded {ticker}</h3>

          {trades.length > 0 ? (
            <div className="ticker-table">
              {trades.map((trade) => (
                <button
                  className="ticker-table-row"
                  key={trade.id}
                  onClick={() => onOpenTrade(trade)}
                >
                  <span
                    className="politician-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPolitician(trade.politician_name);
                    }}
                  >
                    {trade.politician_name}
                  </span>
                  <span>{trade.trade_date || "Unknown"}</span>
                  <span className={getTradeBadgeClass(trade.trade_type)}>
                    {trade.trade_type_display || formatTradeType(trade.trade_type)}
                  </span>
                  <span>
                    {formatMoney(trade.amount_min)}-{formatMoney(trade.amount_max)}
                  </span>
                  <span className={trade.price_change >= 0 ? "green" : "red"}>
                    {trade.price_change !== null && trade.price_change !== undefined
                      ? `${trade.price_change >= 0 ? "+" : ""}${Number(
                          trade.price_change
                        ).toFixed(2)}%`
                      : "N/A"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="muted">No trades found for this ticker.</p>
          )}
        </div>

        <div className="profile-chart-card">
          <h3>{ticker} activity over time</h3>

          {volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={volumeData}>
                <CartesianGrid stroke="#333333" vertical={false} />
                <XAxis dataKey="date" stroke="#8a8a8a" tickLine={false} />
                <YAxis stroke="#8a8a8a" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#101010",
                    border: "1px solid #444",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#13a87d"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#13a87d" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="muted">No ticker chart data available yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function TradeDetailModal({ trade, onClose, onOpenPolitician, onOpenTicker }) {
  const disclosureDelay = getDisclosureDelay(trade.trade_date, trade.disclosure_date);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="trade-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <div>
            <p className="modal-label">Trade detail</p>
            <h2>
              {trade.politician_name} · {trade.ticker}
            </h2>
          </div>

          <button className="modal-close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="trade-modal-person">
          <div className="profile-avatar">
            {trade.photo_url ? (
              <img src={trade.photo_url} alt={trade.politician_name} />
            ) : (
              <span>{getInitials(trade.politician_name)}</span>
            )}
          </div>

          <div>
            <button
              className="modal-person-name"
              onClick={() => {
                onClose();
                onOpenPolitician(trade.politician_name);
              }}
            >
              {trade.politician_name}
            </button>
            <p>
              {trade.party_display || formatParty(trade.party)} ·{" "}
              {trade.state || "Unknown"} · {trade.chamber || "Congress"}
            </p>
          </div>
        </div>

        <div className="modal-grid">
          <div className="modal-box">
            <p>Ticker</p>
            <h3
              className="ticker-link"
              onClick={() => {
                onClose();
                onOpenTicker(trade.ticker);
              }}
            >
              {trade.ticker}
            </h3>
          </div>

          <div className="modal-box">
            <p>Trade type</p>
            <h3>{trade.trade_type_display || formatTradeType(trade.trade_type)}</h3>
          </div>

          <div className="modal-box">
            <p>Amount range</p>
            <h3>
              {formatMoney(trade.amount_min)}-{formatMoney(trade.amount_max)}
            </h3>
          </div>

          <div className="modal-box">
            <p>Trade date</p>
            <h3>{trade.trade_date || "Unknown"}</h3>
          </div>

          <div className="modal-box">
            <p>Disclosure date</p>
            <h3>{trade.disclosure_date || "Unknown"}</h3>
          </div>

          <div className="modal-box">
            <p>Disclosure delay</p>
            <h3>{disclosureDelay}</h3>
          </div>

          <div className="modal-box">
            <p>Price change</p>
            <h3 className={trade.price_change >= 0 ? "green-text" : "red-text"}>
              {trade.price_change !== null && trade.price_change !== undefined
                ? `${trade.price_change >= 0 ? "+" : ""}${Number(
                    trade.price_change
                  ).toFixed(2)}%`
                : "N/A"}
            </h3>
          </div>

          <div className="modal-box">
            <p>Excess return</p>
            <h3 className={trade.excess_return >= 0 ? "green-text" : "red-text"}>
              {trade.excess_return !== null && trade.excess_return !== undefined
                ? `${trade.excess_return >= 0 ? "+" : ""}${Number(
                    trade.excess_return
                  ).toFixed(2)}%`
                : "N/A"}
            </h3>
          </div>

          <div className="modal-box">
            <p>Market comparison</p>
            <h3>{getTradeInterpretation(trade.price_change, trade.excess_return)}</h3>
          </div>
        </div>

        <div className="modal-summary">
          <h3>Plain English Summary</h3>
          <p>{trade.summary || createTradeSummary(trade)}</p>
        </div>

        <button
          className="view-profile-button"
          onClick={() => {
            onClose();
            onOpenPolitician(trade.politician_name);
          }}
        >
          View full profile
        </button>
      </div>
    </div>
  );
}

function getInitials(name) {
  if (!name) return "?";

  const parts = name.replace(",", "").split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getTradeBadgeClass(type) {
  if (!type) return "";

  const lower = type.toLowerCase();

  if (lower.includes("purchase") || lower.includes("buy")) return "buy-badge";
  if (lower.includes("sale") || lower.includes("sell")) return "sell-badge";

  return "";
}

function formatTradeType(type) {
  if (!type) return "";

  const lower = type.toLowerCase();

  if (lower.includes("purchase") || lower.includes("buy")) return "Buy";
  if (lower.includes("sale") || lower.includes("sell")) return "Sell";

  return type;
}

function formatSummaryAction(type) {
  const formatted = formatTradeType(type);

  if (formatted === "Buy") return "bought";
  if (formatted === "Sell") return "sold";

  return "traded";
}

function formatMoney(value) {
  if (!value) return "$0";

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return "$0";

  if (numberValue >= 1000000) {
    return `$${(numberValue / 1000000).toFixed(1)}M`;
  }

  if (numberValue >= 1000) {
    return `$${Math.round(numberValue / 1000)}K`;
  }

  return `$${numberValue}`;
}

function formatParty(party) {
  if (!party) return "Unknown";

  const lower = party.toLowerCase();

  if (lower === "d" || lower === "dem" || lower.includes("democrat")) {
    return "Democrat";
  }

  if (lower === "r" || lower === "rep" || lower.includes("republican")) {
    return "Republican";
  }

  return party;
}

function createTradeSummary(trade) {
  const action = formatSummaryAction(trade.trade_type);
  const amount = `${formatMoney(trade.amount_min)}-${formatMoney(
    trade.amount_max
  )}`;
  const change =
    trade.price_change !== null && trade.price_change !== undefined
      ? `${Number(trade.price_change) >= 0 ? "+" : ""}${Number(
          trade.price_change
        ).toFixed(2)}%`
      : "an unknown price change";

  return `${trade.politician_name} ${action} ${trade.ticker} in a reported range of ${amount}. Since the trade window, the tracked price change is ${change}.`;
}

function getSearchResults(searchTerm, politicians, trendingTickers, trades) {
  const term = searchTerm.trim().toLowerCase();

  if (!term) return [];

  const politicianResults = politicians
    .filter((pol) => pol.name?.toLowerCase().includes(term))
    .slice(0, 4)
    .map((pol) => ({
      type: "politician",
      label: pol.name,
      meta: `${pol.party_display || formatParty(pol.party)} · ${pol.state || "Unknown"}`,
    }));

  const tickerSet = new Map();

  trendingTickers.forEach((item) => {
    if (item.ticker?.toLowerCase().includes(term)) {
      tickerSet.set(item.ticker, {
        type: "ticker",
        label: item.ticker,
        meta: `${item.trade_count} trades`,
      });
    }
  });

  trades.forEach((trade) => {
    if (trade.ticker?.toLowerCase().includes(term)) {
      tickerSet.set(trade.ticker, {
        type: "ticker",
        label: trade.ticker,
        meta: "Ticker page",
      });
    }
  });

  return [...politicianResults, ...Array.from(tickerSet.values()).slice(0, 4)];
}

function getTickerStats(ticker, trades) {
  const uniquePoliticians = new Set(
    trades.map((trade) => trade.politician_name).filter(Boolean)
  ).size;

  const buyCount = trades.filter((trade) => {
    const type = trade.trade_type?.toLowerCase() || "";
    return type.includes("purchase") || type.includes("buy");
  }).length;

  const sellCount = trades.filter((trade) => {
    const type = trade.trade_type?.toLowerCase() || "";
    return type.includes("sale") || type.includes("sell");
  }).length;

  const validChanges = trades
    .map((trade) => Number(trade.price_change))
    .filter((value) => !Number.isNaN(value));

  const avgChange =
    validChanges.length > 0
      ? validChanges.reduce((sum, value) => sum + value, 0) / validChanges.length
      : null;

  return {
    ticker,
    totalTrades: trades.length,
    uniquePoliticians,
    buySellRatio: `${buyCount}/${sellCount}`,
    avgChange,
  };
}

function getTickerVolumeData(trades) {
  const map = {};

  trades.forEach((trade) => {
    if (!trade.trade_date) return;

    const date = new Date(trade.trade_date);

    if (Number.isNaN(date.getTime())) return;

    const key = date.toISOString().split("T")[0];

    if (!map[key]) {
      map[key] = {
        key,
        date: date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
        }),
        volume: 0,
      };
    }

    map[key].volume += 1;
  });

  return Object.values(map)
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-12);
}

function getMostTradedTicker(trades) {
  const counts = {};

  trades.forEach((trade) => {
    if (!trade.ticker) return;
    counts[trade.ticker] = (counts[trade.ticker] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : "N/A";
}

function getDisclosureDelay(tradeDate, disclosureDate) {
  if (!tradeDate || !disclosureDate) return "Unknown";

  const trade = new Date(tradeDate);
  const disclosure = new Date(disclosureDate);

  if (Number.isNaN(trade.getTime()) || Number.isNaN(disclosure.getTime())) {
    return "Unknown";
  }

  const diffMs = disclosure.getTime() - trade.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Unknown";
  if (diffDays === 0) return "Same day";

  return `Disclosed ${diffDays} days after trade`;
}

function getTradeInterpretation(priceChange, excessReturn) {
  if (priceChange === null || priceChange === undefined) return "Not enough data";

  const change = Number(priceChange);
  const excess = Number(excessReturn);

  if (Number.isNaN(change)) return "Not enough data";

  if (!Number.isNaN(excess)) {
    if (excess > 0) return "Beat market";
    if (excess < 0) return "Trailed market";
  }

  if (change > 0) return "Positive move";
  if (change < 0) return "Negative move";

  return "Flat move";
}

export default App;