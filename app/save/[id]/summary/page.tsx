"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { use } from "react";

type Props = { params: Promise<{ id: string }> };

export default function Summary({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [save, setSave] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);

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

  // Stats
  const totalSeasons = seasons.length;
  const bestFinish = totalSeasons > 0 ? Math.min(...seasons.map((s) => s.league_position)) : null;
  const worstFinish = totalSeasons > 0 ? Math.max(...seasons.map((s) => s.league_position)) : null;
  const avgPosition = totalSeasons > 0
    ? (seasons.reduce((sum, s) => sum + s.league_position, 0) / totalSeasons).toFixed(1)
    : null;

  // Trophies
  const allTrophies: string[] = seasons.flatMap((s) => {
    try { return s.trophies ? JSON.parse(s.trophies) : []; }
    catch { return []; }
  });
  const trophyCounts: Record<string, number> = allTrophies.reduce((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top scorer across all seasons
  const topScorers = seasons
    .filter((s) => s.top_scorer_name && s.top_scorer_goals)
    .sort((a, b) => b.top_scorer_goals - a.top_scorer_goals);

  const bestScorer = topScorers[0];

  // Graph data — last 10 seasons
  const graphSeasons = seasons.slice(-10);
  const chartWidth = 500;
  const chartHeight = 160;
  const paddingLeft = 40;
  const paddingTop = 10;
  const paddingBottom = 30;
  const paddingRight = 20;
  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const maxPos = 24;

  function posToY(pos: number) {
    return paddingTop + ((pos - 1) / (maxPos - 1)) * innerHeight;
  }

  function indexToX(i: number) {
    if (graphSeasons.length === 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (i / (graphSeasons.length - 1)) * innerWidth;
  }

  const linePath = graphSeasons
    .map((s, i) => `${i === 0 ? "M" : "L"} ${indexToX(i)} ${posToY(s.league_position)}`)
    .join(" ");

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push(`/save/${id}`)}
          className="text-gray-500 hover:text-white text-sm mb-6 block transition-colors"
        >
          ← Back to Journey
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-1">{save?.club}</p>
          <h1 className="text-3xl font-bold text-white">{save?.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Career Summary</p>
        </div>

        {totalSeasons === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">📊</p>
            <p className="font-medium">No seasons logged yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Seasons", value: totalSeasons },
                { label: "Best Finish", value: bestFinish ? `${bestFinish}${bestFinish === 1 ? "st" : bestFinish === 2 ? "nd" : bestFinish === 3 ? "rd" : "th"}` : "—" },
                { label: "Avg Position", value: avgPosition ?? "—" },
                { label: "Trophies", value: allTrophies.length },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#141414] border border-white/10 rounded-xl px-4 py-4 text-center">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Best scorer stat */}
            {bestScorer && (
              <div className="bg-[#141414] border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Best Season — Top Scorer</p>
                  <p className="text-white font-bold text-lg">{bestScorer.top_scorer_name}</p>
                  <p className="text-gray-400 text-sm">{bestScorer.season_year} · {bestScorer.league}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-400">{bestScorer.top_scorer_goals}</p>
                  <p className="text-gray-500 text-xs">goals</p>
                </div>
              </div>
            )}

            {/* League position graph */}
            {graphSeasons.length > 0 && (
              <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
                <h2 className="text-white font-bold mb-4">League Position History</h2>
                <p className="text-gray-600 text-xs mb-3">Last {graphSeasons.length} seasons</p>
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Y axis labels */}
                  {[1, 5, 10, 15, 20].map((pos) => (
                    <g key={pos}>
                      <text
                        x={paddingLeft - 8}
                        y={posToY(pos) + 4}
                        textAnchor="end"
                        fill="#6b7280"
                        fontSize="10"
                      >
                        {pos}
                      </text>
                      <line
                        x1={paddingLeft}
                        y1={posToY(pos)}
                        x2={paddingLeft + innerWidth}
                        y2={posToY(pos)}
                        stroke="#ffffff10"
                        strokeWidth="1"
                      />
                    </g>
                  ))}

                  {/* Line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {/* Dots + x labels */}
                  {graphSeasons.map((s, i) => (
                    <g key={s.id}>
                      <circle
                        cx={indexToX(i)}
                        cy={posToY(s.league_position)}
                        r="4"
                        fill={s.league_position === 1 ? "#facc15" : "#22c55e"}
                      />
                      <text
                        x={indexToX(i)}
                        y={chartHeight - 5}
                        textAnchor="middle"
                        fill="#6b7280"
                        fontSize="9"
                      >
                        {s.season_year}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            )}

            {/* Trophy cabinet */}
            {Object.keys(trophyCounts).length > 0 && (
              <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
                <h2 className="text-white font-bold mb-4">🏆 Trophy Cabinet</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(trophyCounts).map(([trophy, count]) => (
                    <div
                      key={trophy}
                      className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      {trophy} {count > 1 && <span className="text-yellow-600">×{count}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top scorers table */}
            {topScorers.length > 0 && (
              <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10">
                  <h2 className="text-white font-bold">⚽ Top Scorers by Season</h2>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="text-left px-5 py-3">Season</th>
                      <th className="text-left px-5 py-3">Player</th>
                      <th className="text-left px-5 py-3">League</th>
                      <th className="text-left px-5 py-3">Goals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topScorers.map((s) => (
                      <tr key={s.id} className="border-b border-white/5 last:border-0">
                        <td className="px-5 py-3 text-gray-400">{s.season_year}</td>
                        <td className="px-5 py-3 text-white font-medium">{s.top_scorer_name}</td>
                        <td className="px-5 py-3 text-gray-400">{s.league}</td>
                        <td className="px-5 py-3 text-green-400 font-bold">{s.top_scorer_goals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  );
}