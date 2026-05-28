"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { use } from "react";

type Props = { params: Promise<{ id: string }> };

export default function SavePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [save, setSave] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);

  async function deleteSave() {
    const confirmed = window.confirm(
      "Are you sure? This will permanently delete this journey and cannot be undone."
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("saves")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Failed to delete journey");
      return;
    }

    router.push("/my-journeys");
  }

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
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => router.push("/my-journeys")}
          className="text-gray-500 hover:text-white text-sm mb-6 block transition-colors"
        >
          ← My Journeys
        </button>

        {/* Save header */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl px-6 py-5 mb-8">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-1">
            {save?.club}
          </p>
          <h1 className="text-3xl font-bold text-white">{save?.name}</h1>
        </div>

        {/* Seasons */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Seasons</h2>
        </div>

        {seasons.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-medium">No seasons logged yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {seasons.map((s) => (
              <div
                key={s.id}
                className="bg-[#141414] border border-white/10 rounded-xl px-5 py-4"
              >
                <p className="text-white font-semibold">{s.season_year}</p>
                <p className="text-gray-400 text-sm mt-0.5">
                  Position: {s.league_position}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Danger zone */}
        <div className="mt-10 border-t border-white/10 pt-6">
          <button
            onClick={deleteSave}
            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold py-3 rounded-xl transition-colors"
          >
            Delete Journey
          </button>
        </div>

      </div>
    </main>
  );
}