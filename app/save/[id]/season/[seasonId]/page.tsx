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

function getAvailableTrophies(country: string, competition: string): string[] {
  const trophies: string[] = ["League Title"];
  if (country === "England") { trophies.push("FA Cup", "Carabao Cup"); }
  else if (country === "Spain") { trophies.push("Copa del Rey"); }
  else if (country === "France") { trophies.push("Coupe de France"); }
  else if (country === "Italy") { trophies.push("Coppa Italia"); }
  else if (country === "Germany") { trophies.push("DFB-Pokal"); }
  if (competition === "Champions League") trophies.push("Champions League");
  if (competition === "Europa League") trophies.push("Europa League");
  if (competition === "Conference League") trophies.push("Conference League");
  return trophies;
}

type Props = { params: Promise<{ id: string; seasonId: string }> };

export default function EditSeason({ params }: Props) {
  const { id, seasonId } = use(params);
  const router = useRouter();

  const [seasonYear, setSeasonYear] = useState("");
  const [country, setCountry] = useState("");
  const [league, setLeague] = useState("");
  const [position, setPosition] = useState("");
  const [domesticCup, setDomesticCup] = useState("");
  const [domesticCupStage, setDomesticCupStage] = useState("");
  const [competition, setCompetition] = useState("");
  const [stage, setStage] = useState("");
  const [topScorerName, setTopScorerName] = useState("");
  const [topScorerGoals, setTopScorerGoals] = useState("");
  const [selectedTrophies, setSelectedTrophies] = useState<string[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState("");
  const [showLeaguePicker, setShowLeaguePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function loadSeason() {
      const { data } = await supabase
        .from("seasons").select("*").eq("id", seasonId).single();
      if (data) {
        setSeasonYear(data.season_year || "");
        setCountry(data.country || "");
        setLeague(data.league || "");
        setPosition(String(data.league_position || ""));
        setDomesticCup(data.domestic_cup || "");
        setDomesticCupStage(data.domestic_cup_stage || "");
        setCompetition(data.european_competition || "");
        setStage(data.european_stage || "");
        setTopScorerName(data.top_scorer_name || "");
        setTopScorerGoals(data.top_scorer_goals ? String(data.top_scorer_goals) : "");
        setSelectedTrophies(data.trophies ? JSON.parse(data.trophies) : []);
      }
    }
    loadSeason();
  }, [seasonId]);

  const countries = Object.keys(leagueData);
  const teamCount = country && league ? leagueData[country][league] : 0;
  const positions = teamCount ? Array.from({ length: teamCount }, (_, i) => i + 1) : [];
  const availableTrophies = getAvailableTrophies(country, competition);

  function handleLeagueSelect(selectedCountry: string, selectedLeague: string) {
    setCountry(selectedCountry);
    setLeague(selectedLeague);
    setPosition("");
    setShowLeaguePicker(false);
    setHoveredCountry("");
  }

  function toggleTrophy(trophy: string) {
    setSelectedTrophies((prev) =>
      prev.includes(trophy) ? prev.filter((t) => t !== trophy) : [...prev, trophy]
    );
  }

  async function saveSeason() {
    if (!seasonYear || !country || !league || !position || !domesticCup || !domesticCupStage) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("seasons").update({
      season_year: seasonYear,
      country,
      league,
      league_position: parseInt(position),
      domestic_cup: domesticCup,
      domestic_cup_stage: domesticCupStage,
      european_competition: competition === "None" ? null : competition || null,
      european_stage: competition === "None" ? null : stage || null,
      top_scorer_name: topScorerName || null,
      top_scorer_goals: topScorerGoals ? parseInt(topScorerGoals) : null,
      trophies: selectedTrophies.length > 0 ? JSON.stringify(selectedTrophies) : null,
    }).eq("id", seasonId);

    setLoading(false);

    if (error) {
      alert("Error updating season");
      return;
    }

    router.push(`/save/${id}`);
  }

  async function deleteSeason() {
    setDeleting(true);
    const { error } = await supabase.from("seasons").delete().eq("id", seasonId);
    if (error) {
      alert("Failed to delete season");
      setDeleting(false);
      return;
    }
    router.push(`/save/${id}`);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-md mx-auto">
        <Link href={`/save/${id}`} className="text-gray-500 hover:text-white text-sm mb-6 block transition-colors">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Edit Season</h1>
        {seasonYear && (
          <div className="inline-block bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold px-3 py-1 rounded-full mb-8">
            Season {seasonYear}
          </div>
        )}

        <div className="flex flex-col gap-4">

          {/* Season Year */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Season</label>
            <input
              value={seasonYear}
              onChange={(e) => setSeasonYear(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors"
            />
          </div>

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

          {/* Domestic Cup */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Domestic Cup <span className="text-red-400">*</span></label>
            <select
              value={domesticCup}
              onChange={(e) => setDomesticCup(e.target.value)}
              disabled={!country}
              className="w-full bg-[#141414] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors disabled:opacity-40"
            >
              <option value="">Select cup</option>
              {(domesticCups[country] || []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Cup Stage */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Cup Stage Reached <span className="text-red-400">*</span></label>
            <select
              value={domesticCupStage}
              onChange={(e) => setDomesticCupStage(e.target.value)}
              disabled={!domesticCup}
              className="w-full bg-[#141414] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors disabled:opacity-40"
            >
              <option value="">Select stage</option>
              {cupStages.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* European Competition */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">European Competition <span className="text-gray-600">(optional)</span></label>
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

          {/* Top Scorer */}
          <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
            <label className="text-sm text-gray-400 mb-3 block">Top Scorer <span className="text-gray-600">(optional)</span></label>
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

          {/* Trophies */}
          {country && (
            <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
              <label className="text-sm text-gray-400 mb-3 block">Trophies Won <span className="text-gray-600">(optional)</span></label>
              <div className="flex flex-wrap gap-2">
                {availableTrophies.map((trophy) => (
                  <button
                    key={trophy}
                    onClick={() => toggleTrophy(trophy)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      selectedTrophies.includes(trophy)
                        ? "bg-green-500/20 border-green-500/50 text-green-400"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {selectedTrophies.includes(trophy) ? "✓ " : ""}{trophy}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={saveSeason}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors mt-2"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          {/* Delete season */}
          <div className="border-t border-white/10 pt-4">
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold py-3 rounded-xl transition-colors"
              >
                Delete Season
              </button>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
                <p className="text-red-400 font-semibold mb-1">Delete this season?</p>
                <p className="text-gray-400 text-sm mb-4">This cannot be undone.</p>
                <div className="flex gap-3">
                  <button
                    onClick={deleteSeason}
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
      </div>
    </main>
  );
}