"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import { useLang } from "@/lib/lang";
import { 
  getActivePlayers, 
  getPlayerStats, 
  getAllInjuries,
  BDLPlayer, 
  BDLGameStats,
  BDLInjury 
} from "@/lib/balldontlie";

type PlayerWithStats = {
  id: string;
  bdl_id: number;
  name: string;
  team: string;
  position: string;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fg_pct: number;
  ft_pct: number;
  fg3_pct: number;
  gp: number;
  injury?: string;
};

type SortKey = "name" | "ppg" | "rpg" | "apg" | "spg" | "bpg" | "fg_pct" | "gp";

export default function PlayerRankingsPage() {
  const { t } = useLang();
  const [players, setPlayers] = useState<PlayerWithStats[]>([]);
  const [injuries, setInjuries] = useState<Map<number, BDLInjury>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("ppg");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      // 1. 获取现役球员列表
      const playersResponse = await getActivePlayers({ per_page: 100 });
      const bdlPlayers = playersResponse.data;

      // 2. 获取伤病信息
      const injuriesResponse = await getAllInjuries();
      const injuryMap = new Map<number, BDLInjury>();
      injuriesResponse.forEach(injury => {
        injuryMap.set(injury.player.id, injury);
      });
      setInjuries(injuryMap);

      // 3. 获取球员统计数据 (2024赛季)
      const playerIds = bdlPlayers.map(p => p.id);
      const statsResponse = await getPlayerStats({
        player_ids: playerIds.slice(0, 25), // API 限制，先获取前25个
        seasons: [2024],
        per_page: 100,
      });

      // 4. 计算每个球员的平均数据
      const statsMap = new Map<number, BDLGameStats[]>();
      statsResponse.data.forEach(stat => {
        const playerId = stat.player.id;
        if (!statsMap.has(playerId)) {
          statsMap.set(playerId, []);
        }
        statsMap.get(playerId)!.push(stat);
      });

      // 5. 转换为 PlayerWithStats 格式
      const playersWithStats: PlayerWithStats[] = bdlPlayers.map(player => {
        const playerStats = statsMap.get(player.id) || [];
        const gp = playerStats.length;

        if (gp === 0) {
          return {
            id: player.id.toString(),
            bdl_id: player.id,
            name: `${player.first_name} ${player.last_name}`,
            team: player.team?.abbreviation || "FA",
            position: player.position || "N/A",
            ppg: 0,
            rpg: 0,
            apg: 0,
            spg: 0,
            bpg: 0,
            fg_pct: 0,
            ft_pct: 0,
            fg3_pct: 0,
            gp: 0,
            injury: injuryMap.get(player.id)?.status,
          };
        }

        const totals = playerStats.reduce(
          (acc, game) => ({
            pts: acc.pts + game.pts,
            reb: acc.reb + game.reb,
            ast: acc.ast + game.ast,
            stl: acc.stl + game.stl,
            blk: acc.blk + game.blk,
            fgm: acc.fgm + game.fgm,
            fga: acc.fga + game.fga,
            ftm: acc.ftm + game.ftm,
            fta: acc.fta + game.fta,
            fg3m: acc.fg3m + game.fg3m,
            fg3a: acc.fg3a + game.fg3a,
          }),
          { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, fgm: 0, fga: 0, ftm: 0, fta: 0, fg3m: 0, fg3a: 0 }
        );

        return {
          id: player.id.toString(),
          bdl_id: player.id,
          name: `${player.first_name} ${player.last_name}`,
          team: player.team?.abbreviation || "FA",
          position: player.position || "N/A",
          ppg: Number((totals.pts / gp).toFixed(1)),
          rpg: Number((totals.reb / gp).toFixed(1)),
          apg: Number((totals.ast / gp).toFixed(1)),
          spg: Number((totals.stl / gp).toFixed(1)),
          bpg: Number((totals.blk / gp).toFixed(1)),
          fg_pct: totals.fga > 0 ? Number(((totals.fgm / totals.fga) * 100).toFixed(1)) : 0,
          ft_pct: totals.fta > 0 ? Number(((totals.ftm / totals.fta) * 100).toFixed(1)) : 0,
          fg3_pct: totals.fg3a > 0 ? Number(((totals.fg3m / totals.fg3a) * 100).toFixed(1)) : 0,
          gp,
          injury: injuryMap.get(player.id)?.status,
        };
      });

      setPlayers(playersWithStats);
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  // 获取所有球队列表
  const teams = useMemo(() => {
    const teamSet = new Set(players.map(p => p.team));
    return Array.from(teamSet).sort();
  }, [players]);

  // 过滤和排序
  const filteredPlayers = useMemo(() => {
    let result = players;

    // 搜索
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.team.toLowerCase().includes(term)
      );
    }

    // 位置过滤
    if (positionFilter !== "all") {
      result = result.filter(p => p.position.includes(positionFilter));
    }

    // 球队过滤
    if (teamFilter !== "all") {
      result = result.filter(p => p.team === teamFilter);
    }

    // 排序
    result = [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc" 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return result;
  }, [players, searchTerm, positionFilter, teamFilter, sortKey, sortOrder]);

  // 分页
  const paginatedPlayers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPlayers.slice(start, start + pageSize);
  }, [filteredPlayers, page]);

  const totalPages = Math.ceil(filteredPlayers.length / pageSize);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <span className="sort-icon">↕</span>;
    return <span className="sort-icon active">{sortOrder === "asc" ? "↑" : "↓"}</span>;
  }

  if (loading) {
    return (
      <div className="app">
        <Header />
        <main className="page-content">
          <div className="loading-container">
            <div className="loading-spinner">🏀</div>
            <p>{t("正在从 Ball Don't Lie API 加载数据...", "Loading data from Ball Don't Lie API...")}</p>
          </div>
        </main>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Header />
        <main className="page-content">
          <div className="error-container">
            <h2>❌ {t("加载失败", "Failed to Load")}</h2>
            <p>{error}</p>
            <button onClick={loadData} className="retry-btn">
              {t("重试", "Retry")}
            </button>
          </div>
        </main>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <main className="page-content">
        <div className="container">
          <div className="page-header">
            <div className="header-info">
              <h1>🏀 {t("球员排名", "Player Rankings")}</h1>
              <p className="api-badge">
                ⚡ Powered by Ball Don't Lie API • 2024-25 Season
              </p>
            </div>
            <button onClick={loadData} className="refresh-btn">
              🔄 {t("刷新数据", "Refresh")}
            </button>
          </div>

          {/* 过滤器 */}
          <div className="filters">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder={t("搜索球员或球队...", "Search player or team...")}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              />
            </div>
            <select 
              value={positionFilter} 
              onChange={(e) => { setPositionFilter(e.target.value); setPage(1); }}
              className="filter-select"
            >
              <option value="all">{t("全部位置", "All Positions")}</option>
              <option value="G">{t("后卫 (G)", "Guard (G)")}</option>
              <option value="F">{t("前锋 (F)", "Forward (F)")}</option>
              <option value="C">{t("中锋 (C)", "Center (C)")}</option>
            </select>
            <select 
              value={teamFilter} 
              onChange={(e) => { setTeamFilter(e.target.value); setPage(1); }}
              className="filter-select"
            >
              <option value="all">{t("全部球队", "All Teams")}</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          {/* 统计信息 */}
          <div className="stats-bar">
            <span>{t(`共 ${filteredPlayers.length} 名球员`, `${filteredPlayers.length} players`)}</span>
            <span>{t(`${injuries.size} 名伤病球员`, `${injuries.size} injured`)}</span>
          </div>

          {/* 球员表格 */}
          <div className="table-container">
            <table className="players-table">
              <thead>
                <tr>
                  <th className="rank-col">#</th>
                  <th className="name-col" onClick={() => handleSort("name")}>
                    {t("球员", "Player")} <SortIcon column="name" />
                  </th>
                  <th onClick={() => handleSort("ppg")}>PPG <SortIcon column="ppg" /></th>
                  <th onClick={() => handleSort("rpg")}>RPG <SortIcon column="rpg" /></th>
                  <th onClick={() => handleSort("apg")}>APG <SortIcon column="apg" /></th>
                  <th onClick={() => handleSort("spg")}>SPG <SortIcon column="spg" /></th>
                  <th onClick={() => handleSort("bpg")}>BPG <SortIcon column="bpg" /></th>
                  <th onClick={() => handleSort("fg_pct")}>FG% <SortIcon column="fg_pct" /></th>
                  <th onClick={() => handleSort("gp")}>GP <SortIcon column="gp" /></th>
                </tr>
              </thead>
              <tbody>
                {paginatedPlayers.map((player, index) => (
                  <tr key={player.id} className={player.injury ? "injured" : ""}>
                    <td className="rank-col">{(page - 1) * pageSize + index + 1}</td>
                    <td className="name-col">
                      <div className="player-info">
                        <span className="player-name">{player.name}</span>
                        <span className="player-meta">
                          {player.team} • {player.position}
                          {player.injury && (
                            <span className="injury-badge" title={player.injury}>
                              🏥 {player.injury}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="stat-highlight">{player.ppg}</td>
                    <td>{player.rpg}</td>
                    <td>{player.apg}</td>
                    <td>{player.spg}</td>
                    <td>{player.bpg}</td>
                    <td>{player.fg_pct}%</td>
                    <td>{player.gp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← {t("上一页", "Prev")}
              </button>
              <span className="page-info">
                {page} / {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t("下一页", "Next")} →
              </button>
            </div>
          )}
        </div>
      </main>
      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .page-content {
    min-height: calc(100vh - 60px);
    background: #0a0a0a;
    padding: 24px 16px;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .header-info h1 {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 8px 0;
  }

  .api-badge {
    font-size: 13px;
    color: #22c55e;
    margin: 0;
  }

  .refresh-btn {
    padding: 10px 20px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
  }

  .refresh-btn:hover {
    border-color: #f59e0b;
  }

  .filters {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .search-box {
    flex: 1;
    min-width: 200px;
    max-width: 300px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    background: #111;
    border: 1px solid #222;
    border-radius: 8px;
  }

  .search-icon {
    color: #666;
  }

  .search-box input {
    flex: 1;
    background: none;
    border: none;
    color: #fff;
    font-size: 14px;
    outline: none;
  }

  .filter-select {
    padding: 10px 16px;
    background: #111;
    border: 1px solid #222;
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
  }

  .stats-bar {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #888;
  }

  .table-container {
    background: #111;
    border: 1px solid #222;
    border-radius: 12px;
    overflow: hidden;
  }

  .players-table {
    width: 100%;
    border-collapse: collapse;
  }

  .players-table th {
    padding: 14px 12px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    background: #1a1a1a;
    border-bottom: 1px solid #222;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }

  .players-table th:hover {
    color: #f59e0b;
  }

  .sort-icon {
    margin-left: 4px;
    opacity: 0.3;
  }

  .sort-icon.active {
    opacity: 1;
    color: #f59e0b;
  }

  .players-table td {
    padding: 12px;
    border-bottom: 1px solid #1a1a1a;
    font-size: 14px;
    color: #ccc;
  }

  .players-table tr:hover {
    background: rgba(245, 158, 11, 0.05);
  }

  .players-table tr.injured {
    background: rgba(239, 68, 68, 0.05);
  }

  .rank-col {
    width: 50px;
    text-align: center;
    color: #666;
  }

  .name-col {
    min-width: 200px;
  }

  .player-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .player-name {
    font-weight: 600;
    color: #fff;
  }

  .player-meta {
    font-size: 12px;
    color: #888;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .injury-badge {
    padding: 2px 6px;
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border-radius: 4px;
    font-size: 11px;
  }

  .stat-highlight {
    font-weight: 600;
    color: #f59e0b;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
  }

  .pagination button {
    padding: 10px 20px;
    background: #111;
    border: 1px solid #222;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
  }

  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination button:hover:not(:disabled) {
    border-color: #f59e0b;
  }

  .page-info {
    font-size: 14px;
    color: #888;
  }

  .loading-container, .error-container {
    text-align: center;
    padding: 80px 20px;
  }

  .loading-spinner {
    font-size: 48px;
    animation: bounce 1s infinite;
    margin-bottom: 16px;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .error-container h2 {
    font-size: 20px;
    color: #fff;
    margin: 0 0 8px 0;
  }

  .error-container p {
    color: #888;
    margin: 0 0 16px 0;
  }

  .retry-btn {
    padding: 12px 24px;
    background: #f59e0b;
    border: none;
    border-radius: 8px;
    color: #000;
    font-weight: 600;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .table-container {
      overflow-x: auto;
    }

    .players-table {
      min-width: 700px;
    }

    .filters {
      flex-direction: column;
    }

    .search-box {
      max-width: none;
    }
  }
`;