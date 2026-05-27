"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Props = {
  params: { id: string };
};

export default function SavePage({ params }: Props) {
  const { id } = params;
  const router = useRouter();

  const [save, setSave] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: saveData } = await supabase
        .from("saves")
        .select("*")
        .eq("id", id)
        .single();

      const { data: seasonData } = await supabase
        .from("seasons")
        .select("*")
        .eq("save_id", id);

      setSave(saveData);
      setSeasons(seasonData || []);
    }

    loadData();
  }, [id]);

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <button
        onClick={() => router.push("/my-journeys")}
        style={{
          marginBottom: 20,
          padding: "8px 14px",
          cursor: "pointer",
          border: "1px solid #ccc",
          borderRadius: 6,
          backgroundColor: "transparent",
        }}
      >
        ← Back to My Journeys
      </button>

      <h1>{save?.name}</h1>
      <p>{save?.club}</p>

      <h2 style={{ marginTop: 20 }}>Seasons</h2>

      {seasons.length === 0 ? (
        <p>No seasons yet.</p>
      ) : (
        seasons.map((s) => (
          <div
            key={s.id}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              marginBottom: 10,
            }}
          >
            <p>{s.season_year}</p>
            <p>{s.league_position}</p>
          </div>
        ))
      )}
    </main>
  );
}