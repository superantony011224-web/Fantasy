# Data Analyst Portfolio Project

## NBA Fantasy Basketball Analytics Platform
**Blueprint Fantasy | Full-Stack Web Application**

---

## Project Overview

Built a comprehensive fantasy basketball analytics platform that integrates real-time NBA data to provide actionable insights for fantasy basketball players. The platform processes game statistics, calculates fantasy point projections, and enables data-driven draft decisions.

**Live Demo:** localhost:3001 (Development)
**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, Tailwind CSS

---

## Key Technical Highlights

### 1. Real-Time NBA Data Pipeline
- Integrated **Ball Don't Lie API** to fetch live NBA statistics
- Built automated data refresh system with intelligent caching (30-min intervals)
- Processed 500+ active NBA players with 15+ statistical categories per player
- Implemented rate limiting and error handling for API reliability

### 2. Fantasy Points Algorithm
Developed custom scoring algorithm based on standard fantasy basketball rules:

```
Fantasy Points = PTS(1x) + REB(1x) + AST(1x) + STL(2x) + BLK(2x) + 3PM(1x) - TOV(1x)
```

### 3. Statistical Analysis Features

| Feature | Description |
|---------|-------------|
| **Player Rankings** | Dynamic rankings based on fantasy points per game |
| **Player Comparison** | Radar chart visualization comparing up to 4 players |
| **Trend Analysis** | Track player performance over recent games |
| **Injury Tracking** | Real-time injury status integration |
| **Position Filtering** | Analyze players by PG/SG/SF/PF/C positions |

### 4. Data Visualization
- **Radar Charts**: Multi-dimensional player comparison (PTS, REB, AST, STL, BLK, FG%, FT%, TOV)
- **Tiered Rankings**: Visual grouping of players by draft value (Elite, First Round, etc.)
- **Performance Tables**: Sortable, filterable data grids with pagination

---

## Data Analysis Capabilities Demonstrated

### Statistical Aggregation
- Calculated season averages from game-by-game data
- Computed shooting percentages (FG%, 3P%, FT%) from raw attempts/makes
- Aggregated totals across multiple games for comprehensive analysis

### Data Transformation
- Normalized player statistics for cross-position comparison
- Converted raw API responses into actionable fantasy metrics
- Built type-safe data models with TypeScript interfaces

### Caching & Optimization
- Implemented in-memory caching to reduce API calls
- Background data refresh without blocking user requests
- Efficient pagination for large dataset handling

---

## Database Schema (Supabase)

```sql
-- Core tables designed for the platform
- leagues (id, name, commissioner_id, status, max_teams, draft_type)
- teams (id, league_id, user_id, team_name, wins, losses, total_points)
- draft_picks (id, league_id, player_id, round, pick_number)
- users (id, username, email, avatar_url)
- insights (id, title, body, author_id, tags, heat, created_at)
```

---

## Key Features Built

### Draft Tools
- **Mock Draft Simulator**: Practice drafts with AI-controlled opponents
- **Draft Cheat Sheet**: Real-time assistant to track available players
- **Tier-based Rankings**: Players grouped by draft value

### League Management
- Create/join public and private leagues
- Track team standings and matchups
- Manage waiver wire transactions

### Analytics Dashboard
- Player search with multi-filter support
- Sort by any statistical category
- Toggle between per-game averages and season totals

---

## Code Samples

### Fantasy Points Calculation
```typescript
function calculateFantasyPoints(stats: PlayerStats): number {
  return (
    stats.pts * 1 +    // Points
    stats.reb * 1 +    // Rebounds
    stats.ast * 1 +    // Assists
    stats.stl * 2 +    // Steals (premium)
    stats.blk * 2 +    // Blocks (premium)
    stats.fg3m * 1 +   // 3-pointers
    stats.tov * -1     // Turnovers (negative)
  );
}
```

### Data Aggregation Pipeline
```typescript
// Aggregate player statistics from multiple games
const averages = {
  ppg: totals.pts / gamesPlayed,
  rpg: totals.reb / gamesPlayed,
  apg: totals.ast / gamesPlayed,
  fg_pct: totals.fga > 0 ? (totals.fgm / totals.fga) * 100 : 0,
  // ... additional calculations
};
```

---

## Skills Demonstrated

| Category | Skills |
|----------|--------|
| **Data Analysis** | Statistical aggregation, trend analysis, data normalization |
| **Programming** | TypeScript, React, SQL, REST APIs |
| **Data Visualization** | Radar charts, data tables, filtering/sorting |
| **Database** | PostgreSQL (Supabase), schema design, queries |
| **Tools** | Git, npm, VS Code, API testing |

---

## Project Metrics

- **15+** statistical categories tracked per player
- **500+** active NBA players in database
- **5** days of rolling game data analyzed
- **2** language support (English/Chinese)
- **20+** React components built
- **10+** API endpoints created

---

## Future Enhancements (Roadmap)

1. Machine learning model for player performance prediction
2. Trade analyzer with statistical projections
3. Weekly matchup analysis and recommendations
4. Historical data visualization and trend charts
5. Export functionality (CSV, PDF reports)

---

## Contact

**GitHub:** github.com/shuyangliu0827/fantasy-web
**Project Status:** Active Development

---

*This project demonstrates my ability to work with real-world data sources, build analytical tools, and create user-friendly data visualizations - core skills for a data analyst role.*
