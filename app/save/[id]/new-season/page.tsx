"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { use } from "react";
import Link from "next/link";

const leagueData: Record<string, Record<string, number>> = {
  England: { "Premier League": 20, "Championship": 24, "League One": 24, "League Two": 24 },
  Spain: { "La Liga": 20, "Segunda División": 22, "Primera Federación": 20, "Segunda Federación": 18 },
  France: { "Ligue 1": 18, "Ligue 2": 20, "National": 18, "National 2": 18 },
  Italy: { "Serie A": 20, "Serie B": 20, "Serie C": 20, "Serie D": 18 },
  Germany: { "Bundesliga": 18, "2. Bundesliga": 18, "3. Liga": 20, "Regionalliga": 18 },
};

const domesticCups: Record<string, string[]> = {
  England: ["FA Cup", "Carabao Cup"],
  Spain: ["Copa del Rey"],
  France: ["Coupe de France"],
  Italy: ["Coppa Italia"],
  Germany: ["DFB-Pokal"],
};

const cupStages = [
  "First Round", "Second Round", "Third Round", "Fourth Round",
  "Quarter Final", "Semi Final", "Runner Up", "Winner",
];

const europeanCompetitions = ["None", "Champions League", "Europa League", "Conference League"];

const europeanStages = [
  "Qualifying", "League Phase", "Knockout Phase Play-offs",
  "Round of 16", "Quarter Final", "Semi Final", "Final", "Winner",
];

// Add more formations here as needed
const formations = [
  "4-2-3-1", "4-3-3", "4-4-2", "4-1-4-1", "4-5-1", "4-3-2-1",
  "3-4-3", "3-5-2", "3-4-2-1", "5-3-2", "5-4-1", "5-2-3",
  "4-4-1-1", "4-2-2-2", "4-1-2-1-2", "4-3-1-2",
];

function calculateTrophies(
  league: string,
  leaguePosition: number,
  cupResults: Record<string, string>,
  europeanCompetition: string,
  europeanStage: string
): string[] {
  const trophies: string[] = [];
  if (leaguePosition === 1) trophies.push(`${league} Title`);
  Object.entries(cupResults).forEach(([cup, stage]) => {
    if (stage === "Winner") trophies.push(cup);
  });
  if (europeanStage === "Winner" && europeanCompetition && europeanCompetition !== "None") {
    trophies.push(europeanCompetition);
  }
  return trophies;
}

function getNextSeason(current: string) {
  const parts = current.split("/");
  if (parts.length !== 2) return current;
  const start = parseInt(parts[0]);
  const next = start + 1;
  return `${String(next).padStart(2, "0")}/${String(next + 1).padStart(2, "0")}`;
}

type Props = { params: Promise<{ id: string }> };

export default function NewSeason({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const [seasonYear, setSeasonYear] = useState("");
  const [country, setCountry] = useState("");
  const [league, setLeague] = useState("");
  const [position, setPosition] = useState("");
  const [cupResults, setCupResults] = useState<Record<string, string>>({});
  const [competition, setCompetition] = useState("");
  const [stage, setStage] = useState("");
  const [topScorerName, setTopScorerName] = useState("");
  const [topScorerGoals, setTopScorerGoals] = useState("");
  const [topAssisterName, setTopAssisterName] = useState("");
  const [topAssisterAssists, setTopAssisterAssists] = useState("");
  const [tactic, setTactic] = useState("");
  const [hoveredCountry, setHoveredCountry] = useState("");
  const [showLeaguePicker, setShowLeaguePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSeason() {
      const { data: saveData } = await supabase
        .from("saves").select("current_season").eq("id", id).single();
      if (saveData?.current_season) setSeasonYear(saveData.current_season);

      const { data: lastSeason } = await supabase
        .from("seasons")
        .select("country, league, tactic")
        .eq("save_id", id)
        .order("season_year", { ascending: false })
        .limit(1)
        .single();

      if (lastSeason) {
        setCountry(lastSeason.country);
        setLeague(lastSeason.league);
        if (lastSeason.tactic) setTactic(lastSeason.tactic);
      }
    }
    loadSeason();
  }, [id]);

  const countries = Object.keys(leagueData);
  const teamCount = country && league ? leagueData[country][league] : 0;
  const positions = teamCount ? Array.from({ length: teamCount }, (_, i) => i + 1) : [];
  const cups = country ? domesticCups[country] || [] : [];

  function handleLeagueSelect(selectedCountry: string, selectedLeague: string) {
    setCountry(selectedCountry);
    setLeague(selectedLeague);
    setPosition("");
    setCupResults({});
    setShowLeaguePicker(false);
    setHoveredCountry("");
  }

  function setCupStage(cup: string, cupStage: string) {
    setCupResults((prev) => ({ ...prev, [cup]: cupStage }));
  }

  const autoTrophies = position
    ? calculateTrophies(league, parseInt(position), cupResults, competition, stage)
    : [];

  async function createSeason() {
    if (!seasonYear || !country || !league || !position) {
      alert("Please fill in league and position");
      return;
    }
    const missingCup = cups.find((c) => !cupResults[c]);
    if (missingCup) {
      alert(`Please select a stage for ${missingCup}`);
      return;
    }
    if (competition && competition !== "None" && !stage) {
      alert("Please select the European stage reached");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("seasons").insert({
      save_id: id,
      season_year: seasonYear,
      country,
      league,
      league_position: parseInt(position),
      cup_results: JSON.stringify(cupResults),
      european_competition: competition === "None" ? null : competition || null,
      european_stage: competition === "None" ? null : stage || null,
      top_scorer_name: topScorerName || null,
      top_scorer_goals: topScorerGoals ? parseInt(topScorerGoals) : null,
      top_assister_name: topAssisterName || null,
      top_assister_assists: topAssisterAssists ? parseInt(topAssisterAssists) : null,
      tactic: tactic || null,
      trophies: autoTrophies.length > 0 ? JSON.stringify(autoTrophies) : null,
    });

    if (error) {
      alert("Error saving season");
      setLoading(false);
      return;
    }

    await supabase
      .from("saves")
      .update({ current_season: getNextSeason(seasonYear) })
      .eq("id", id);

    setLoading(false);
    router.push(`/save/${id}`);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-md mx-auto">
        <Link href={`/save/${id}`} className="text-gray-500 hover:text-white text-sm mb-6 block transition-colors">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Log Season</h1>
        <p className="text-gray-400 mb-2">Recording your season details.</p>

        {seasonYear && (
          <div className="inline-block bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold px-3 py-1 rounded-full mb-8">
            Season {seasonYear}
          </div>
        )}

        <div className="flex flex-col gap-4">

          {/* League Flyout */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">League</label>
            <button
              onClick={() => setShowLeaguePicker(!showLeaguePicker)}
              className="w-full bg-[#141414] border border-white/10 text-left text-white rounded-xl px-4 py-3 transition-colors hover:border-green-500"
            >
              {league ? (
                <span>{league} <span className="text-green-400 text-sm">({country})</span></span>
              ) : (
                <span className="text-gray-600">Select league</span>
              )}
            </button>
            {showLeaguePicker && (
              <div className="mt-2 flex rounded-xl border border-white/10 overflow-hidden">
                <div className="w-1/2 bg-[#141414] border-r border-white/10">
                  {countries.map((c) => (
                    <button
                      key={c}
                      onMouseEnter={() => setHoveredCountry(c)}
                      onClick={() => setHoveredCountry(c)}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                        hoveredCountry === c ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {c} <span className="text-xs">→</span>
                    </button>
                  ))}
                </div>
                <div className="w-1/2 bg-[#1a1a1a]">
                  {hoveredCountry ? (
                    Object.keys(leagueData[hoveredCountry]).map((l) => (
                      <button
                        key={l}
                        onClick={() => handleLeagueSelect(hoveredCountry, l)}
                        className="w-full text-left px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {l}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm px-4 py-3">Hover a country</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Position */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">League Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              disabled={!league}
              className="w-full bg-[#141414] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors disabled:opacity-40"
            >
              <option value="">Select position</option>
              {positions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Tactic */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Tactic <span className="text-gray-600">(optional)</span>
            </label>
            <select
              value={tactic}
              onChange={(e) => setTactic(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors"
            >
              <option value="">Select formation</option>
              {formations.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Domestic Cups */}
          {cups.length > 0 && (
            <div className="bg-[#141414] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
              <label className="text-sm text-gray-400 block">
                Domestic Cups <span className="text-red-400">*</span>
              </label>
              {cups.map((cup) => (
                <div key={cup}>
                  <label className="text-xs text-gray-500 mb-1 block">{cup}</label>
                  <select
                    value={cupResults[cup] || ""}
                    onChange={(e) => setCupStage(cup, e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:border-green-500 transition-colors"
                  >
                    <option value="">Select stage</option>
                    {cupStages.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* European Competition */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              European Competition <span className="text-gray-600">(optional)</span>
            </label>
            <select
              value={competition}
              onChange={(e) => { setCompetition(e.target.value); setStage(""); }}
              className="w-full bg-[#141414] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors"
            >
              <option value="">Select competition</option>
              {europeanCompetitions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {competition && competition !== "None" && (
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Stage Reached</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors"
              >
                <option value="">Select stage</option>
                {europeanStages.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Top Scorer & Assister */}
          <div className="bg-[#141414] border border-white/10 rounded-xl p-4 flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Top Scorer <span className="text-gray-600">(optional)</span>
              </label>
              <div className="flex gap-3">
                <input
                  placeholder="Player name"
                  value={topScorerName}
                  onChange={(e) => setTopScorerName(e.target.value)}
                  className="flex-1 bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-2 outline-none focus:border-green-500 transition-colors"
                />
                <input
                  placeholder="Goals"
                  type="number"
                  value={topScorerGoals}
                  onChange={(e) => setTopScorerGoals(e.target.value)}
                  className="w-24 bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-2 outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Top Assister <span className="text-gray-600">(optional)</span>
              </label>
              <div className="flex gap-3">
                <input
                  placeholder="Player name"
                  value={topAssisterName}
                  onChange={(e) => setTopAssisterName(e.target.value)}
                  className="flex-1 bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-2 outline-none focus:border-green-500 transition-colors"
                />
                <input
                  placeholder="Assists"
                  type="number"
                  value={topAssisterAssists}
                  onChange={(e) => setTopAssisterAssists(e.target.value)}
                  className="w-24 bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-2 outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Auto trophies preview */}
          {autoTrophies.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
              <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-2">🏆 Trophies this season</p>
              <div className="flex flex-wrap gap-2">
                {autoTrophies.map((t) => (
                  <span key={t} className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded-lg">{t}</span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={createSeason}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors mt-2"
          >
            {loading ? "Saving..." : "Save Season"}
          </button>
        </div>
      </div>
    </main>
  );
}