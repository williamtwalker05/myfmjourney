"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function MyJourneys() {
  const [saves, setSaves] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchSaves();
  }, []);

  async function fetchSaves() {
    const { data, error } = await supabase
      .from("saves")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setSaves(data || []);
  }

  function openSave(id: string) {
    router.push(`/save/${id}`);
  }

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>My Journeys</h1>

      <div style={{ marginTop: 20 }}>
        {saves.length === 0 ? (
          <p>No saves yet.</p>
        ) : (
          saves.map((save) => (
            <div
              key={save.id}
              onClick={() => openSave(save.id)}
              style={{
                display: "block",
                border: "1px solid #ccc",
                padding: 10,
                marginBottom: 10,
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              <h3 style={{ margin: 0 }}>{save.name}</h3>
              <p style={{ margin: 0 }}>{save.club}</p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}