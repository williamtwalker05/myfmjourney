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
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>My FM Journey</h1>

      <p>Track your Football Manager careers</p>

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <Link
          href="/new-save"
          style={{
            padding: "8px 12px",
            border: "1px solid black",
            borderRadius: 6,
            textDecoration: "none",
            color: "white",
          }}
        >
          Start New Journey
        </Link>

        <button
          onClick={continueJourney}
          style={{ padding: "8px 12px" }}
        >
          Continue Journey
        </button>

        <button style={{ padding: "8px 12px" }}>
          My Journeys
        </button>
      </div>
    </main>
  );
}