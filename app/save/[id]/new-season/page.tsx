"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { use } from "react";
import Link from "next/link";

const leagueData: Record<string, Record<string, number>> = {
  England: {
    "Premier League": 20,
    "Championship": 24,
    "League One": 24,
    "League Two": 24,
  },
  Spain: {
    "La Liga": 20,
    "Segunda División": 22,
    "Primera Federación": 20,
    "Segunda Federación": 18,
  },
  France: {
    "Ligue 1": 18,
    "Ligue 2": 20,
    "National": 18,
    "National 2": 18,
  },
  Italy: {
    "Serie A": 20,
    "Serie B": 20,
    "Serie C": 20,
    "Serie D": 18,
  },
  Germany: {
    "Bundesliga": 18,
    "2. Bundesliga": 18,
    "3. Liga": 20,
    "Regionalliga": 18,
  },
};

const europeanCompetitions = [
  "None",
  "Champions League",
  "Europa League",
  "Conference League",
];

const stages = [
  "Qualifying",
  "League Phase",
  "Knockout Phase Play-offs",
  "Round of 16",
  "Quarter Final",
  "Semi Final",
  "Final",
  "Winner",
];

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
  const [competition, setCompetition] = useState("");
  const [stage, setStage] = useState("");
  const [hoveredCountry, setHoveredCountry] = useState("");
  const [showLeaguePicker, setShowLeaguePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSeason() {
      const { data } = await supabase
        .from("saves")
        .select("current_season")
        .eq("id", id)
        .single();

      if (data?.current_season) {
        setSeasonYear(data.current_season);
      }
    }
    loadSeason();
  }, [id]);

  const countries = Object.keys(leagueData);
  const teamCount = country && league ? leagueData[country][league] : 0;
  const positions = teamCount
    ? Array.from({ length: teamCount }, (_, i) => i + 1)
    : [];

  function handleLeagueSelect(selectedCountry: string, selectedLeague: string) {
    setCountry(selectedCountry);
    setLeague(selectedLeague);
    setPosition("");
    setShowLeaguePicker(false);
    setHoveredCountry("");
  }

  function handleCompetitionChange(val: string) {
    setCompetition(val);
    setStage("");
  }

  async function createSeason() {
    if (!seasonYear || !country || !league || !position) {
      alert("Please fill in all required fields");
      return;
    }

    if (competition && competition !== "None" && !stage) {
      alert("Please select the stage you reached");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("seasons").insert({
      save_id: id,
      season_year: seasonYear,
      country,
      league,
      league_position: parseInt(position),
      european_competition: competition === "None" ? null : competition || null,
      european_stage: competition === "None" ? null : stage || null,
    });

    if (error) {
      alert("Error saving season");
      setLoading(false);
      return;
    }

    // bump current_season forward on the save
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
        <Link
          href={`/save/${id}`}
          className="text-gray-500 hover:text-white text-sm mb-6 block transition-colors"
        >
          ← Back
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">Log Season</h1>
        <p className="text-gray-400 mb-2">Recording season for your journey.</p>

        {/* Season badge */}
        {seasonYear && (
          <div className="inline-block bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold px-3 py-1 rounded-full mb-8">
            Season {seasonYear}
          </div>
        )}

        <div className="flex flex-col gap-4">

          {/* League Flyout Picker */}
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
                        hoveredCountry === c
                          ? "bg-white/10 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {c}
                      <span className="text-xs">→</span>
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

          {/* European Competition */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              European Competition <span className="text-gray-600">(optional)</span>
            </label>
            <select
              value={competition}
              onChange={(e) => handleCompetitionChange(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors"
            >
              <option value="">Select competition</option>
              {europeanCompetitions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Stage Reached */}
          {competition && competition !== "None" && (
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Stage Reached</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors"
              >
                <option value="">Select stage</option>
                {stages.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
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