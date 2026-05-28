"use client";

import { useRouter } from "next/navigation";
import { demoSave, demoSeasons } from "./demoData";
import Link from "next/link";

export default function DemoPage() {
  const router = useRouter();

  const totalSeasons = demoSeasons.length;
  const bestFinish = Math.min(...demoSeasons.map((s) => s.league_position));
  const avgPosition = (
    demoSeasons.reduce((sum, s) => sum + s.league_position, 0) / totalSeasons
  ).toFixed(1);

  const allTrophies = demoSeasons.flatMap((s) => s.trophies);
  const trophyCounts: Record<string, number> = allTrophies.reduce((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topScorers = [...demoSeasons]
    .filter((s) => s.top_scorer_name && s.top_scorer_goals)
    .sort((a, b) => b.top_scorer_goals - a.top_scorer_goals);

  const tacticCounts = demoSeasons
    .filter((s) => s.tactic)
    .reduce((acc: Record<string, number>, s) => {
      acc[s.tactic] = (acc[s.tactic] || 0) + 1;
      return acc;
    }, {});
  const sortedTactics = Object.entries(tacticCounts).sort((a, b) => b[1] - a[1]);

  // Graph
  const chartWidth = 500;
  const chartHeight = 160;
  const paddingLeft = 40;
  const paddingTop = 10;
  const paddingBottom = 30;
  const paddingRight = 20;
  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const maxPos = 20;

  function posToY(pos: number) {
    return paddingTop + ((pos - 1) / (maxPos - 1)) * innerHeight;
  }

  function indexToX(i: number) {
    if (demoSeasons.length === 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (i / (demoSeasons.length - 1)) * innerWidth;
  }

  const linePath = demoSeasons
    .map((s, i) => `${i === 0 ? "M" : "L"} ${indexToX(i)} ${posToY(s.league_position)}`)
    .join(" ");

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Back to home */}
        <Link
          href="/"
          className="text-gray-500 hover:text-white text-sm mb-6 block transition-colors"
        >
          ← Back to Home
        </Link>

        {/* Demo banner */}
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-xl mb-8 flex items-center justify-between flex-wrap gap-3">
          <p>This is a demo journey. <span className="text-gray-400">Sign up to start tracking your own.</span></p>
          <Link
            href="/"
            className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-1.5 rounded-lg text-sm transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Header */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl px-6 py-5 mb-8">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-1">
            {demoSave.club}
          </p>
          <h1 className="text-3xl font-bold text-white">{demoSave.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Career Summary</p>
        </div>

        <div className="flex flex-col gap-6">

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Seasons", value: totalSeasons },
              { label: "Best Finish", value: `${bestFinish}${bestFinish === 1 ? "st" : bestFinish === 2 ? "nd" : bestFinish === 3 ? "rd" : "th"}` },
              { label: "Avg Position", value: avgPosition },
              { label: "Trophies", value: allTrophies.length },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#141414] border border-white/10 rounded-xl px-4 py-4 text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Best scorer */}
          {topScorers[0] && (
            <div className="bg-[#141414] border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Best Season — Top Scorer</p>
                <p className="text-white font-bold text-lg">{topScorers[0].top_scorer_name}</p>
                <p className="text-gray-400 text-sm">{topScorers[0].season_year} · {topScorers[0].league}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-400">{topScorers[0].top_scorer_goals}</p>
                <p className="text-gray-500 text-xs">goals</p>
              </div>
            </div>
          )}

          {/* League position graph */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
            <h2 className="text-white font-bold mb-1">League Position History</h2>
            <p className="text-gray-600 text-xs mb-3">Lower number is better</p>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {[1, 5, 10, 15, 20].map((pos) => (
                <g key={pos}>
                  <text x={paddingLeft - 8} y={posToY(pos) + 4} textAnchor="end" fill="#6b7280" fontSize="10">{pos}</text>
                  <line x1={paddingLeft} y1={posToY(pos)} x2={paddingLeft + innerWidth} y2={posToY(pos)} stroke="#ffffff10" strokeWidth="1" />
                </g>
              ))}
              <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {demoSeasons.map((s, i) => (
                <g key={s.id}>
                  <circle cx={indexToX(i)} cy={posToY(s.league_position)} r="4" fill={s.league_position === 1 ? "#facc15" : "#22c55e"} />
                  <text x={indexToX(i)} y={chartHeight - 5} textAnchor="middle" fill="#6b7280" fontSize="9">{s.season_year}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* Season table */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="text-white font-bold">Season by Season</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Season</th>
                  <th className="text-left px-5 py-3">League</th>
                  <th className="text-left px-5 py-3">Pos</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Europe</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Top Scorer</th>
                </tr>
              </thead>
              <tbody>
                {demoSeasons.map((s, i) => (
                  <tr key={s.id} className={`border-b border-white/5 last:border-0 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                    <td className="px-5 py-3 text-white font-semibold">{s.season_year}</td>
                    <td className="px-5 py-3 text-gray-300">{s.league}</td>
                    <td className="px-5 py-3">
                      <span className={`font-bold ${s.league_position === 1 ? "text-yellow-400" : "text-gray-300"}`}>
                        {s.league_position}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 hidden md:table-cell">
                      {s.european_competition ? `${s.european_competition} — ${s.european_stage}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-400 hidden md:table-cell">
                      {s.top_scorer_name ? `${s.top_scorer_name} (${s.top_scorer_goals})` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Trophy cabinet */}
          {Object.keys(trophyCounts).length > 0 && (
            <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-bold mb-4">🏆 Trophy Cabinet</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(trophyCounts).map(([trophy, count]) => (
                  <div key={trophy} className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {trophy} {count > 1 && <span className="text-yellow-600">×{count}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top scorers */}
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
                    <th className="text-left px-5 py-3">Goals</th>
                  </tr>
                </thead>
                <tbody>
                  {topScorers.map((s) => (
                    <tr key={s.id} className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-3 text-gray-400">{s.season_year}</td>
                      <td className="px-5 py-3 text-white font-medium">{s.top_scorer_name}</td>
                      <td className="px-5 py-3 text-green-400 font-bold">{s.top_scorer_goals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tactics */}
          {sortedTactics.length > 0 && (
            <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-bold mb-4">🧠 Tactics Used</h2>
              <div className="flex flex-col gap-2">
                {sortedTactics.map(([formation, count]) => (
                  <div key={formation} className="flex items-center gap-3">
                    <div
                      className="h-2 bg-green-500 rounded-full"
                      style={{ width: `${(count / totalSeasons) * 100}%`, minWidth: 8 }}
                    />
                    <span className="text-white font-medium text-sm w-20 shrink-0">{formation}</span>
                    <span className="text-gray-500 text-sm">{count} season{count > 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-white font-bold text-xl mb-2">Start tracking your own journey</p>
            <p className="text-gray-400 text-sm mb-5">Log every season, track your trophies and see your career unfold.</p>
            <Link
              href="/"
              className="inline-block bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Get Started — It's Free
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}