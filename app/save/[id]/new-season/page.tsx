"use client";

import { useState } from "react";
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

type Props = { params: Promise<{ id: string }> };

export default function NewSeason({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const [seasonYear, setSeasonYear] = useState("");
  const [country, setCountry] = useState("");
  const [league, setLeague] = useState("");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);

  const countries = Object.keys(leagueData);
  const leagues = country ? Object.keys(leagueData[country]) : [];
  const teamCount = country && league ? leagueData[country][league] : 0;
  const positions = teamCount
    ? Array.from({ length: teamCount }, (_, i) => i + 1)
    : [];

  function handleCountryChange(val: string) {
    setCountry(val);
    setLeague("");
    setPosition("");
  }

  function handleLeagueChange(val: string) {
    setLeague(val);
    setPosition("");
  }

  async function createSeason() {
    if (!seasonYear || !country || !league || !position) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("seasons").insert({
      save_id: id,
      season_year: seasonYear,
      country,
      league,
      league_position: parseInt(position),
    });

    setLoading(false);

    if (error) {
      alert("Error saving season");
      return;
    }

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
        <p className="text-gray-400 mb-8">Record your season finish.</p>

        <div className="flex flex-col gap-4">
          {/* Season Year */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Season</label>
            <input
              placeholder="e.g. 2024/25"
              value={seasonYear}
              onChange={(e) => setSeasonYear(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Country</label>
            <select
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors"
            >
              <option value="">Select country</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* League */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">League</label>
            <select
              value={league}
              onChange={(e) => handleLeagueChange(e.target.value)}
              disabled={!country}
              className="w-full bg-[#141414] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors disabled:opacity-40"
            >
              <option value="">Select league</option>
              {leagues.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
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