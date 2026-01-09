"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useLang } from "@/lib/lang";
import { getSessionUser, listInsights, listLeagues, Insight, League } from "@/lib/store";

export default function HomePage() {
  const { t } = useLang();
  const [authed, setAuthed] = useState(false);
  const [showHero, setShowHero] = useState(true);
  const [topTab, setTopTab] = useState<"insights" | "leagues">("insights");
  const [feedTab, setFeedTab] = useState<"forYou" | "latest">("forYou");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);

  useEffect(() => {
    const u = getSessionUser();
    if (u) setAuthed(true);
    
    // 加载真实帖子
    const allInsights = listInsights();
    setInsights(allInsights.sort((a, b) => b.createdAt - a.createdAt));
    
    // 加载联赛
    const allLeagues = listLeagues();
    setLeagues(allLeagues.sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  // 解析帖子内容（处理带 metadata 的 body）
  const parseInsight = (insight: Insight) => {
    let content = insight.body;
    let coverImage: string | undefined;
    let tags: string[] | undefined;
    
    try {
      const parsed = JSON.parse(insight.body);
      if (parsed.content) {
        content = parsed.content;
        coverImage = parsed.metadata?.coverImage;
        tags = parsed.metadata?.tags;
      }
    } catch {
      // Body is plain text
    }
    
    return { ...insight, content, coverImage, tags };
  };

  // 示例帖子（当没有真实帖子时显示）
  const sampleInsights = [
    { id: "sample-1", title: "为什么我在 1.06 放弃了 Tatum", author: "@shuyang", heat: 238, createdAt: Date.now() - 86400000 },
    { id: "sample-2", title: "拍卖联赛：别追稀缺叙事", author: "@ivy", heat: 154, createdAt: Date.now() - 172800000 },
    { id: "sample-3", title: "Defense wins: lock stable minutes first", author: "@coachk", heat: 91, createdAt: Date.now() - 259200000 },
  ];

  // 示例联赛
  const sampleLeagues = [
    { id: "sample-l1", slug: "lebron-lab", name: "LeBron Lab", ownerId: "1", visibility: "public" as const, createdAt: Date.now() - 86400000 },
    { id: "sample-l2", slug: "auction-chaos", name: "Auction Chaos", ownerId: "2", visibility: "public" as const, createdAt: Date.now() - 172800000 },
  ];

  const displayInsights = insights.length > 0 ? insights : sampleInsights;
  const displayLeagues = leagues.length > 0 ? leagues : sampleLeagues;

  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) return t("刚刚", "Just now");
    if (hours < 24) return `${hours} ${t("小时前", "hours ago")}`;
    if (days < 7) return `${days} ${t("天前", "days ago")}`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleAction = (action: string) => {
    if (!authed && action !== "mock") {
      alert(t("请先登录", "Please login first"));
      return;
    }
    if (action === "create") window.location.href = "/league/new";
    if (action === "join") window.location.href = "/league/join";
    if (action === "mock") window.location.href = "/mock-draft";
  };

  return (
    <div className="app">
      <Header />

      {/* Hero Section */}
      {showHero && (
        <section className="hero">
          <button className="hero-close" onClick={() => setShowHero(false)}>×</button>
          <div className="hero-content">
            <div className="hero-badge">Beta</div>
            <h1 className="hero-title">
              {t("准备好开始你的", "Ready to Start Your")}<br/>
              <span className="gradient-text">{t("Fantasy 篮球之旅？", "Fantasy Basketball Journey?")}</span>
            </h1>
            <p className="hero-sub">{t("最专业的中文 Fantasy 篮球平台", "The #1 Fantasy Basketball Platform")}</p>
            
            <div className="hero-actions">
              <button className="hero-btn primary" onClick={() => handleAction("create")}>
                <svg viewBox="0 0 24 24" fill="none" className="btn-icon">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {t("创建联赛", "Create League")}
              </button>
              <button className="hero-btn secondary" onClick={() => handleAction("join")}>
                <svg viewBox="0 0 24 24" fill="none" className="btn-icon">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {t("加入公共联赛", "Join Public League")}
              </button>
              <button className="hero-btn outline" onClick={() => handleAction("mock")}>
                <svg viewBox="0 0 24 24" fill="none" className="btn-icon">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {t("模拟选秀", "Mock Draft")}
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-ball">
              <svg viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="3"/>
                <path d="M60 5 C60 5, 20 40, 60 60 C100 80, 60 115, 60 115" stroke="currentColor" strokeWidth="3" fill="none"/>
                <path d="M5 60 H115" stroke="currentColor" strokeWidth="3"/>
              </svg>
            </div>
          </div>
        </section>
      )}

      {/* Content Tabs */}
      <nav className="tabs-bar">
        <div className="tabs-inner">
          <div className="tabs-left">
            <button className={`tab ${topTab === "insights" ? "active" : ""}`} onClick={() => setTopTab("insights")}>{t("洞见", "Insights")}</button>
            <button className={`tab ${topTab === "leagues" ? "active" : ""}`} onClick={() => setTopTab("leagues")}>{t("联盟", "Leagues")}</button>
          </div>
          <div className="tabs-right">
            <button className={`tab-pill ${feedTab === "forYou" ? "active" : ""}`} onClick={() => setFeedTab("forYou")}>{t("推荐", "For You")}</button>
            <button className={`tab-pill ${feedTab === "latest" ? "active" : ""}`} onClick={() => setFeedTab("latest")}>{t("最新", "Latest")}</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main">
        <div className="container">
          <div className="grid">
            {/* Feed */}
            <section className="feed">
              {topTab === "insights" ? (
                displayInsights.length === 0 ? (
                  <div className="empty-feed">
                    <p>{t("还没有帖子，成为第一个发帖的人吧！", "No posts yet. Be the first to post!")}</p>
                    <Link href="/insights/new" className="btn btn-primary">{t("发布帖子", "Create Post")}</Link>
                  </div>
                ) : (
                  displayInsights.map((item) => {
                    const parsed = parseInsight(item as Insight);
                    return (
                      <article key={item.id} className="card">
                        <div 
                          className="card-thumb"
                          style={parsed.coverImage ? { 
                            backgroundImage: `url(${parsed.coverImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          } : undefined}
                        >
                          <span className="card-heat">🔥 {item.heat || 0}</span>
                        </div>
                        <div className="card-body">
                          <h3 className="card-title">{item.title}</h3>
                          <div className="card-meta">
                            {parsed.tags && parsed.tags.length > 0 && (
                              <span className="meta-tag">#{parsed.tags[0]}</span>
                            )}
                            <span>{item.author}</span>
                          </div>
                          <div className="card-footer">
                            <span className="watching">{formatDate(item.createdAt)}</span>
                            <Link className="card-link" href={`/insights/${item.id}`}>{t("查看", "View")} →</Link>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )
              ) : (
                displayLeagues.length === 0 ? (
                  <div className="empty-feed">
                    <p>{t("还没有联赛，创建第一个吧！", "No leagues yet. Create the first one!")}</p>
                    <Link href="/league/new" className="btn btn-primary">{t("创建联赛", "Create League")}</Link>
                  </div>
                ) : (
                  displayLeagues.map((item) => (
                    <article key={item.id} className="card">
                      <div className="card-thumb league-thumb">
                        <span className="league-teams">12 {t("队", "teams")}</span>
                      </div>
                      <div className="card-body">
                        <h3 className="card-title">{item.name}</h3>
                        <div className="card-meta">
                          <span className="phase-tag">{item.visibility === "public" ? t("公开", "Public") : t("私人", "Private")}</span>
                        </div>
                        <div className="card-footer">
                          <span className="watching">{formatDate(item.createdAt)}</span>
                          <Link className="card-link" href={`/league/${item.slug}`}>{t("查看", "View")} →</Link>
                        </div>
                      </div>
                    </article>
                  ))
                )
              )}
            </section>

            {/* Sidebar */}
            <aside className="sidebar">
              <div className="widget">
                <h4 className="widget-title">{t("快速开始", "Get Started")}</h4>
                <p className="widget-text">{t("创建或加入一个联赛，开始你的 Fantasy 篮球之旅。", "Create or join a league to start your Fantasy basketball journey.")}</p>
                <div className="widget-actions">
                  <button className="widget-btn primary" onClick={() => handleAction("create")}>{t("创建联赛", "Create League")}</button>
                  <button className="widget-btn" onClick={() => handleAction("join")}>{t("加入公共联赛", "Join Public League")}</button>
                  <button className="widget-btn outline" onClick={() => handleAction("mock")}>{t("模拟选秀", "Mock Draft")}</button>
                </div>
              </div>

              <div className="widget">
                <h4 className="widget-title">{t("热门作者", "Top Authors")}</h4>
                <div className="leaderboard">
                  <div className="leader-item">
                    <span className="leader-rank gold">1</span>
                    <div className="leader-avatar">S</div>
                    <div className="leader-info">
                      <span className="leader-name">@shuyang</span>
                      <span className="leader-stat">12 {t("篇帖子", "posts")}</span>
                    </div>
                  </div>
                  <div className="leader-item">
                    <span className="leader-rank silver">2</span>
                    <div className="leader-avatar">I</div>
                    <div className="leader-info">
                      <span className="leader-name">@ivy</span>
                      <span className="leader-stat">8 {t("篇帖子", "posts")}</span>
                    </div>
                  </div>
                  <div className="leader-item">
                    <span className="leader-rank bronze">3</span>
                    <div className="leader-avatar">C</div>
                    <div className="leader-info">
                      <span className="leader-name">@coachk</span>
                      <span className="leader-stat">5 {t("篇帖子", "posts")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 热门标签 */}
              <div className="widget">
                <h4 className="widget-title">{t("热门标签", "Trending Tags")}</h4>
                <div className="trending-tags">
                  <Link href="#" className="trending-tag">#选秀策略</Link>
                  <Link href="#" className="trending-tag">#球员分析</Link>
                  <Link href="#" className="trending-tag">#交易建议</Link>
                  <Link href="#" className="trending-tag">#Punt策略</Link>
                  <Link href="#" className="trending-tag">#新手指南</Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
