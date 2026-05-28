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
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function deleteSave() {
    setDeleting(true);
    const { error } = await supabase.from("saves").delete().eq("id", id);
    if (error) {
      alert("Failed to delete journey");
      setDeleting(false);
      return;
    }
    router.push("/my-journeys");
  }

  useEffect(() => {
    async function loadData() {
      const { data: saveData } = await supabase
        .from("saves").select("*").eq("id", id).single();
      const { data: seasonData } = await supabase
        .from("seasons").select("*").eq("save_id", id).order("season_year", { ascending: true });
      setSave(saveData);
      setSeasons(seasonData || []);
    }
    loadData();
  }, [id]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push("/my-journeys")}
          className="text-gray-500 hover:text-white text-sm mb-6 block transition-colors"
        >
          ← My Journeys
        </button>

        {/* Save header */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl px-6 py-5 mb-8 flex items-center justify-between">
          <div>
            <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-1">
              {save?.club}
            </p>
            <h1 className="text-3xl font-bold text-white">{save?.name}</h1>
            {save?.current_season && (
              <p className="text-gray-500 text-sm mt-1">Current season: {save.current_season}</p>
            )}
          </div>
          <button
            onClick={() => router.push(`/save/${id}/summary`)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors"
          >
            📊 Summary
          </button>
        </div>

        {/* Seasons */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Seasons</h2>
          <button
            onClick={() => router.push(`/save/${id}/new-season`)}
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-4 rounded-xl text-sm transition-colors"
          >
            + Add Season
          </button>
        </div>

        {seasons.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-medium">No seasons logged yet</p>
          </div>
        ) : (
          <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Season</th>
                  <th className="text-left px-4 py-3">League</th>
                  <th className="text-left px-4 py-3">Pos</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Cup</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Europe</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Top Scorer</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}
                  >
                    <td className="px-4 py-3 text-white font-semibold">{s.season_year}</td>
                    <td className="px-4 py-3 text-gray-300">
                      <span>{s.league}</span>
                      <span className="text-gray-600 text-xs ml-1">({s.country})</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${s.league_position === 1 ? "text-yellow-400" : "text-gray-300"}`}>
                        {s.league_position}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {s.domestic_cup_stage === "Winner" ? (
                        <span className="text-yellow-400">🏆 {s.domestic_cup}</span>
                      ) : (
                        <span>{s.domestic_cup_stage}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {s.european_competition ? (
                        <span>{s.european_competition} — {s.european_stage}</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {s.top_scorer_name ? (
                        <span>{s.top_scorer_name} ({s.top_scorer_goals})</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/save/${id}/season/${s.id}`)}
                        className="text-gray-500 hover:text-white text-xs border border-white/10 hover:border-white/30 px-2 py-1 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Danger zone */}
        <div className="mt-10 border-t border-white/10 pt-6">
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold py-3 rounded-xl transition-colors"
            >
              Delete Journey
            </button>
          ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
              <p className="text-red-400 font-semibold mb-1">Are you sure?</p>
              <p className="text-gray-400 text-sm mb-4">
                This will permanently delete this journey and cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={deleteSave}
                  disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-bold py-2 rounded-xl transition-colors"
                >
                  {deleting ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}