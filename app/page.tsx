"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  async function getLatestSave() {
    const { data, error } = await supabase
      .from("saves")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.log(error);
      return null;
    }

    return data;
  }

  async function continueJourney() {
    const latest = await getLatestSave();

    if (!latest) {
      alert("No journeys found");
      return;
    }

    router.push(`/save/${latest.id}`);
  }

  return (
    <main
      style={{
        padding: 40,
        fontFamily: "sans-serif",
        backgroundColor: "black",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 10 }}>
        My FM Journey
      </h1>

      <p style={{ color: "#aaa" }}>
        Track your Football Manager careers
      </p>

      <div style={{ marginTop: 30, display: "flex", gap: 10 }}>
        {/* NEW JOURNEY */}
        <Link
          href="/new-save"
          style={{
            padding: "10px 14px",
            border: "1px solid white",
            borderRadius: 6,
            textDecoration: "none",
            color: "black",
            backgroundColor: "white",
            fontWeight: 600,
          }}
        >
          Start New Journey
        </Link>

        {/* CONTINUE */}
        <button
          onClick={continueJourney}
          style={{
            padding: "10px 14px",
            border: "1px solid white",
            borderRadius: 6,
            backgroundColor: "transparent",
            color: "white",
            cursor: "pointer",
          }}
        >
          Continue Journey
        </button>

        {/* MY JOURNEYS */}
        <Link
          href="/my-journeys"
          style={{
            padding: "10px 14px",
            border: "1px solid white",
            borderRadius: 6,
            textDecoration: "none",
            color: "white",
            backgroundColor: "transparent",
          }}
        >
          My Journeys
        </Link>
      </div>
    </main>
  );
}