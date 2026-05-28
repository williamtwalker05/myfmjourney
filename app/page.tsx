"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  async function continueJourney() {
    const { data, error } = await supabase
      .from("saves")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      alert("No journeys found");
      return;
    }

    router.push(`/save/${data.id}`);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="inline-block bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6">
          Football Manager Tracker
        </div>

        <h1 className="text-5xl font-extrabold text-white leading-tight mb-3">
          My FM <span className="text-green-400">Journey</span>
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          Log your seasons, track your progress, relive your career.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/new-save"
            className="w-full text-center bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            + Start New Journey
          </Link>

          <button
            onClick={continueJourney}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            ▶ Continue Last Journey
          </button>

          <Link
            href="/my-journeys"
            className="w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            ☰ My Journeys
          </Link>

          <Link
            href="/demo"
            className="w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            👀 View Example Journey
          </Link>
        </div>
      </div>
    </main>
  );
}