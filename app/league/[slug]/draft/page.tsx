"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase, type Team } from "@/lib/supabase";
import { getSessionUser } from "@/lib/store";
import DraftRoom from "@/components/DraftRoom";

export default function DraftPage() {
  const params = useParams();
  const leagueId = params.slug as string;
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [leagueId]);

  async function load() {
    setLoading(true);
    const user = getSessionUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: teamsData } = await supabase
      .from("teams")
      .select("*")
      .eq("league_id", leagueId);

    const team = teamsData?.find((t) => t.user_id === user.id) || null;
    setMyTeam(team);
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <p>加载中...</p>
      </div>
    );
  }

  if (!myTeam) {
    return (
      <div style={{ padding: 24 }}>
        <Link href={`/league/${leagueId}`} style={{ display: "inline-block", marginBottom: 16 }}>
          ← 返回联赛主页
        </Link>
        <p>请先加入联赛后进入选秀室</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Link href={`/league/${leagueId}`} style={{ display: "inline-block" }}>
          ← 返回联赛主页
        </Link>
      </div>
      <DraftRoom leagueId={leagueId} myTeam={myTeam} />
    </div>
  );
}
