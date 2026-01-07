"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useLang } from "@/lib/lang";
import { getPlayers, getSessionUser, addToWatchlist, getWatchlist, removeFromWatchlist, Player } from "@/lib/store";

export default function RankingsPage() {
  const { t } = useLang();
  const [players, setPlayers] = useState<Player[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"rank" | "adp" | "ppg" | "rpg" | "apg">("rank");
  const [user, setUser] = useState<ReturnType<typeof getSessionUser>>(null);

  useEffect(() => {
    setPlayers(getPlayers());
    setUser(getSessionUser());
    const wl = getWatchlist();
    setWatchlist(wl.map(w => w.playerId));
  }, []);

  const toggleWatchlist = (playerId: string) => {
    if (!user) { alert(t("请先登录", "Please login first")); return; }
    if (watchlist.includes(playerId)) {
      removeFromWatchlist(playerId);
      setWatchlist(watchlist.filter(id => id !== playerId));
    } else {
      addToWatchlist(playerId);
      setWatchlist([...watchlist, playerId]);
    }
  };

  const filteredPlayers = players
    .filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (posFilter !== "ALL" && !p.position.includes(posFilter)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rank") return a.rank - b.rank;
      if (sortBy === "adp") return a.adp - b.adp;
      if (sortBy === "ppg") return b.ppg - a.ppg;
      if (sortBy === "rpg") return b.rpg - a.rpg;
      if (sortBy === "apg") return b.apg - a.apg;
      return 0;
    });

  return (
    <div className="app">
      <Header />

      <main className="page-content">
        <div className="page-header">
          <h1 className="page-title">{t("球员排名", "Player Rankings")}</h1>
          <p className="page-desc">{t("2024-25 赛季 Fantasy 篮球球员排名，点击 ⭐ 加入关注列表", "2024-25 Fantasy Basketball Rankings. Click ⭐ to add to watchlist")}</p>
        </div>

        <div className="filters-bar">
          <input
            className="filter-search"
            placeholder={t("搜索球员...", "Search players...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="filter-select" value={posFilter} onChange={(e) => setPosFilter(e.target.value)}>
            <option value="ALL">{t("全部位置", "All Positions")}</option>
            <option value="PG">PG</option>
            <option value="SG">SG</option>
            <option value="SF">SF</option>
            <option value="PF">PF</option>
            <option value="C">C</option>
          </select>
          <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="rank">{t("按排名", "By Rank")}</option>
            <option value="adp">{t("按 ADP", "By ADP")}</option>
            <option value="ppg">{t("按得分", "By PPG")}</option>
            <option value="rpg">{t("按篮板", "By RPG")}</option>
            <option value="apg">{t("按助攻", "By APG")}</option>
          </select>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("排名", "Rank")}</th>
                <th>{t("球员", "Player")}</th>
                <th>{t("球队", "Team")}</th>
                <th>{t("位置", "Pos")}</th>
                <th>ADP</th>
                <th>PPG</th>
                <th>RPG</th>
                <th>APG</th>
                <th>SPG</th>
                <th>BPG</th>
                <th>FG%</th>
                <th>FT%</th>
                <th>{t("关注", "Watch")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => (
                <tr key={player.id} className={player.injury ? "injured" : ""}>
                  <td className="rank-cell">
                    <span className={`rank-badge ${player.rank <= 10 ? "top10" : player.rank <= 30 ? "top30" : ""}`}>
                      {player.rank}
                    </span>
                    {player.trend === "up" && <span className="trend up">↑</span>}
                    {player.trend === "down" && <span className="trend down">↓</span>}
                  </td>
                  <td className="player-cell">
                    <div className="player-name">{player.name}</div>
                    {player.injury && <span className="injury-tag">{player.injury}</span>}
                  </td>
                  <td>{player.team}</td>
                  <td>{player.position}</td>
                  <td>{player.adp.toFixed(1)}</td>
                  <td className="stat-highlight">{player.ppg.toFixed(1)}</td>
                  <td>{player.rpg.toFixed(1)}</td>
                  <td>{player.apg.toFixed(1)}</td>
                  <td>{player.spg.toFixed(1)}</td>
                  <td>{player.bpg.toFixed(1)}</td>
                  <td>{player.fg.toFixed(1)}%</td>
                  <td>{player.ft.toFixed(1)}%</td>
                  <td>
                    <button 
                      className={`watchlist-btn ${watchlist.includes(player.id) ? "active" : ""}`}
                      onClick={() => toggleWatchlist(player.id)}
                    >
                      {watchlist.includes(player.id) ? "★" : "☆"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
