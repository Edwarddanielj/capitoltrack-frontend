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

function App() {
  const [stats, setStats] = useState(null);
  const [trades, setTrades] = useState([]);
  const [politicians, setPoliticians] = useState([]);
  const [tradeFilter, setTradeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [tradeError, setTradeError] = useState("");
  const [selectedPolitician, setSelectedPolitician] = useState(null);

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

      const allTrades = [];
      const limit = 100;

      const firstResponse = await fetch(
        `${API_BASE}/api/trades?page=1&limit=${limit}`
      );

      if (!firstResponse.ok) {
        throw new Error(`Trades request failed: ${firstResponse.status}`);
      }

      const firstData = await firstResponse.json();
      allTrades.push(...(firstData.results || []));

      const totalPages = firstData.total_pages || 1;
      const safeTotalPages = Math.min(totalPages, 10);

      for (let page = 2; page <= safeTotalPages; page++) {
        const response = await fetch(
          `${API_BASE}/api/trades?page=${page}&limit=${limit}`
        );

        if (!response.ok) {
          console.warn(`Page ${page} failed with status ${response.status}`);
          continue;
        }

        const data = await response.json();
        allTrades.push(...(data.results || []));
      }

      setTrades(allTrades);
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

  useEffect(() => {
    fetchStats();
    fetchTrades();
    fetchPoliticians();
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
  const topTickers = getTopTickers(trades);
  const partyChartData = getBuyVolumeByParty(trades);
  const volumeData = getTradeVolumeOverTime(trades);
  const leaderboard = getPerformanceLeaderboard(trades);
  const selectedProfile = selectedPolitician
    ? buildPoliticianProfile(selectedPolitician, trades)
    : null;

  return (
    <div className="page">
      <div className="dashboard-shell">
        <nav className="top-nav">
          <div className="brand">
            Capitol<span>Track</span>
          </div>

          <div className="nav-actions">
            <button className="nav-pill">Live Data</button>
            <button className="nav-pill">Alerts</button>
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
                  onClick={() => setSelectedPolitician(pol)}
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
                      {formatParty(pol.party)} · {pol.state || "Unknown"}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <p className="muted">Loading politicians...</p>
            )}
          </div>
        </section>

        {selectedProfile && (
          <section className="panel profile-panel">
            <div className="profile-top">
              <div className="profile-person">
                <div className="profile-avatar">
                  {selectedPolitician.photo_url ? (
                    <img
                      src={selectedPolitician.photo_url}
                      alt={selectedPolitician.name}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span>{getInitials(selectedPolitician.name)}</span>
                  )}
                </div>

                <div>
                  <h2>{selectedPolitician.name}</h2>
                  <p>
                    {formatParty(selectedPolitician.party)} ·{" "}
                    {selectedPolitician.state || "Unknown"}
                  </p>
                </div>
              </div>

              <button
                className="close-profile"
                onClick={() => setSelectedPolitician(null)}
              >
                Close
              </button>
            </div>

            <div className="profile-stat-grid">
              <div className="profile-stat-box">
                <p>Total trades</p>
                <h3>{selectedProfile.totalTrades}</h3>
              </div>

              <div className="profile-stat-box">
                <p>Buy trades</p>
                <h3>{selectedProfile.buyTrades}</h3>
              </div>

              <div className="profile-stat-box">
                <p>Sell trades</p>
                <h3>{selectedProfile.sellTrades}</h3>
              </div>

              <div className="profile-stat-box">
                <p>Avg price change</p>
                <h3
                  className={
                    selectedProfile.avgChange >= 0 ? "green-text" : "red-text"
                  }
                >
                  {selectedProfile.avgChange !== null
                    ? `${selectedProfile.avgChange >= 0 ? "+" : ""}${selectedProfile.avgChange.toFixed(2)}%`
                    : "N/A"}
                </h3>
              </div>
            </div>

            <div className="plain-summary-box">
              <h3>Plain English Summary</h3>
              <p>{selectedProfile.summary}</p>
            </div>

            <div className="profile-trades">
              <h3>Recent Trades by {selectedPolitician.name}</h3>

              {selectedProfile.recentTrades.length > 0 ? (
                selectedProfile.recentTrades.map((trade, index) => (
                  <div className="profile-trade-row" key={index}>
                    <div>
                      <strong>{trade.ticker || "Unknown"}</strong>
                      <span>{formatTradeType(trade.trade_type)}</span>
                    </div>

                    <div>
                      <strong>{trade.trade_date || "Unknown date"}</strong>
                      <span>
                        {formatMoney(trade.amount_min)}-
                        {formatMoney(trade.amount_max)}
                      </span>
                    </div>

                    <p className={trade.price_change >= 0 ? "green" : "red"}>
                      {trade.price_change !== null &&
                      trade.price_change !== undefined
                        ? `${trade.price_change >= 0 ? "+" : ""}${Number(
                            trade.price_change
                          ).toFixed(2)}%`
                        : "N/A"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="muted">
                  No recent trades found for this politician in the loaded data.
                </p>
              )}
            </div>
          </section>
        )}

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
                {recentTrades.map((trade, index) => (
                  <div className="trade-item" key={index}>
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
                        <strong>{trade.ticker}</strong>
                        <span className={getTradeBadgeClass(trade.trade_type)}>
                          {formatTradeType(trade.trade_type)}
                        </span>
                      </div>

                      <small>
                        {formatMoney(trade.amount_min)}-
                        {formatMoney(trade.amount_max)}
                      </small>
                    </div>
                  </div>
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
                leaderboard.map((person, index) => (
                  <button
                    className="leaderboard-row"
                    key={person.name}
                    onClick={() => {
                      const match = politicians.find(
                        (pol) =>
                          normalizeName(pol.name) === normalizeName(person.name)
                      );

                      if (match) {
                        setSelectedPolitician(match);
                      }
                    }}
                  >
                    <span className="rank">#{index + 1}</span>

                    <div>
                      <strong>{person.name}</strong>
                      <span>{person.tradeCount} tracked trades</span>
                    </div>

                    <p className={person.avgChange >= 0 ? "green" : "red"}>
                      {person.avgChange >= 0 ? "+" : ""}
                      {person.avgChange.toFixed(2)}%
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
              <h3>Top Tickers by Politician Buys</h3>
            </div>

            <div className="ticker-list">
              {topTickers.length > 0 ? (
                topTickers.map((item) => (
                  <div className="ticker-row" key={item.ticker}>
                    <div>
                      <strong>{item.ticker}</strong>
                      <span>{item.count} buys</span>
                    </div>

                    <p className={item.avgChange >= 0 ? "green" : "red"}>
                      {item.avgChange !== null
                        ? `${item.avgChange >= 0 ? "+" : ""}${item.avgChange.toFixed(2)}%`
                        : "N/A"}
                    </p>
                  </div>
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
              {recentTrades.length > 0 ? (
                recentTrades.map((trade, index) => (
                  <div className="summary-card" key={index}>
                    <strong>
                      {trade.politician_name} {formatSummaryAction(trade.trade_type)}{" "}
                      {trade.ticker}
                    </strong>

                    <p>{createTradeSummary(trade)}</p>
                  </div>
                ))
              ) : (
                <p className="muted">No summaries available yet.</p>
              )}
            </div>
          </section>
        </main>
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

function normalizeName(name) {
  return String(name || "")
    .replace(",", "")
    .toLowerCase()
    .trim();
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

function getTopTickers(trades) {
  const tickerMap = {};

  trades.forEach((trade) => {
    const type = trade.trade_type?.toLowerCase() || "";

    if (!trade.ticker) return;
    if (!type.includes("purchase") && !type.includes("buy")) return;

    if (!tickerMap[trade.ticker]) {
      tickerMap[trade.ticker] = {
        ticker: trade.ticker,
        count: 0,
        priceChanges: [],
      };
    }

    tickerMap[trade.ticker].count += 1;

    if (trade.price_change !== null && trade.price_change !== undefined) {
      tickerMap[trade.ticker].priceChanges.push(Number(trade.price_change));
    }
  });

  return Object.values(tickerMap)
    .map((item) => {
      const validChanges = item.priceChanges.filter(
        (value) => !Number.isNaN(value)
      );

      const avgChange =
        validChanges.length > 0
          ? validChanges.reduce((sum, value) => sum + value, 0) /
            validChanges.length
          : null;

      return {
        ticker: item.ticker,
        count: item.count,
        avgChange,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getBuyVolumeByParty(trades) {
  const monthlyData = {};

  trades.forEach((trade) => {
    const type = trade.trade_type?.toLowerCase() || "";

    if (!type.includes("purchase") && !type.includes("buy")) return;
    if (!trade.trade_date) return;

    const date = new Date(trade.trade_date);

    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(
      2,
      "0"
    )}`;
    const month = date.toLocaleString("en-US", { month: "short" });
    const party = formatParty(trade.party);

    if (!monthlyData[key]) {
      monthlyData[key] = {
        key,
        month,
        Democrat: 0,
        Republican: 0,
      };
    }

    if (party === "Democrat") {
      monthlyData[key].Democrat += 1;
    }

    if (party === "Republican") {
      monthlyData[key].Republican += 1;
    }
  });

  return Object.values(monthlyData)
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-6);
}

function getTradeVolumeOverTime(trades) {
  const volumeMap = {};

  trades.forEach((trade) => {
    if (!trade.trade_date) return;

    const date = new Date(trade.trade_date);

    if (Number.isNaN(date.getTime())) return;

    const key = date.toISOString().split("T")[0];

    if (!volumeMap[key]) {
      volumeMap[key] = {
        key,
        date: date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
        }),
        volume: 0,
      };
    }

    volumeMap[key].volume += 1;
  });

  return Object.values(volumeMap)
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-8);
}

function getPerformanceLeaderboard(trades) {
  const politicianMap = {};

  trades.forEach((trade) => {
    if (!trade.politician_name) return;

    const change = Number(trade.price_change);

    if (Number.isNaN(change)) return;

    if (!politicianMap[trade.politician_name]) {
      politicianMap[trade.politician_name] = {
        name: trade.politician_name,
        tradeCount: 0,
        changes: [],
      };
    }

    politicianMap[trade.politician_name].tradeCount += 1;
    politicianMap[trade.politician_name].changes.push(change);
  });

  return Object.values(politicianMap)
    .filter((person) => person.changes.length > 0)
    .map((person) => {
      const avgChange =
        person.changes.reduce((sum, value) => sum + value, 0) /
        person.changes.length;

      return {
        name: person.name,
        tradeCount: person.tradeCount,
        avgChange,
      };
    })
    .sort((a, b) => b.avgChange - a.avgChange)
    .slice(0, 6);
}

function buildPoliticianProfile(politician, trades) {
  const politicianTrades = trades.filter(
    (trade) =>
      normalizeName(trade.politician_name) === normalizeName(politician.name)
  );

  const buyTrades = politicianTrades.filter((trade) => {
    const type = trade.trade_type?.toLowerCase() || "";
    return type.includes("purchase") || type.includes("buy");
  });

  const sellTrades = politicianTrades.filter((trade) => {
    const type = trade.trade_type?.toLowerCase() || "";
    return type.includes("sale") || type.includes("sell");
  });

  const validChanges = politicianTrades
    .map((trade) => Number(trade.price_change))
    .filter((value) => !Number.isNaN(value));

  const avgChange =
    validChanges.length > 0
      ? validChanges.reduce((sum, value) => sum + value, 0) /
        validChanges.length
      : null;

  return {
    totalTrades: politicianTrades.length,
    buyTrades: buyTrades.length,
    sellTrades: sellTrades.length,
    avgChange,
    recentTrades: politicianTrades.slice(0, 5),
    summary: createPoliticianSummary(
      politician,
      politicianTrades.length,
      buyTrades.length,
      sellTrades.length,
      avgChange
    ),
  };
}

function createPoliticianSummary(
  politician,
  totalTrades,
  buyTrades,
  sellTrades,
  avgChange
) {
  if (totalTrades === 0) {
    return `${politician.name} does not have any trades in the currently loaded dataset. More activity may appear as additional trade records are loaded.`;
  }

  const party = formatParty(politician.party);
  const state = politician.state || "an unknown state";

  const direction =
    avgChange === null
      ? "does not have enough price change data to measure performance yet"
      : avgChange >= 0
      ? `has an average tracked price change of +${avgChange.toFixed(2)}%`
      : `has an average tracked price change of ${avgChange.toFixed(2)}%`;

  return `${politician.name}, a ${party} politician from ${state}, has ${totalTrades} tracked trades in this dataset. The activity includes ${buyTrades} buys and ${sellTrades} sells. Based on the available trade records, this politician ${direction}.`;
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

export default App;