"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MyJourneys() {
  const [saves, setSaves] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSaves() {
      const { data, error } = await supabase.from("saves").select("*");

      if (error) {
        console.log(error);
        return;
      }

      setSaves(data || []);
    }

    fetchSaves();
  }, []);

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>My Journeys</h1>

      <div style={{ marginTop: 20 }}>
        {saves.length === 0 ? (
          <p>No saves yet.</p>
        ) : (
          saves.map((save) => (
            <a
              key={save.id}
              href={`/save/${save.id}`}
              style={{
                display: "block",
                border: "1px solid #ccc",
                padding: 10,
                marginBottom: 10,
                borderRadius: 6,
                textDecoration: "none",
                color: "black",
              }}
            >
              <h3>{save.name}</h3>
              <p>{save.club}</p>
            </a>
          ))
        )}
      </div>
    </main>
  );
}