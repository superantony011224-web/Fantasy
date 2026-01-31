// app/api/leagues/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, userId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "League name is required" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Generate slug from name
    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);

    // Create league using admin client (bypasses RLS)
    const { data: league, error: createError } = await supabaseAdmin
      .from("leagues")
      .insert({
        name: trimmedName,
        slug,
        owner_id: userId,
        visibility: "public",
      })
      .select()
      .single();

    if (createError) {
      console.error("Create league error:", createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // Creator automatically becomes owner member
    await supabaseAdmin.from("league_members").insert({
      league_id: league.id,
      user_id: userId,
      role: "owner",
    });

    return NextResponse.json({ status: "success", league });
  } catch (error: any) {
    console.error("Leagues POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
