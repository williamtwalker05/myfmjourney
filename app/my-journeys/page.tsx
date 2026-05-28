"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyJourneys() {
  const [saves, setSaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSaves() {
      const { data, error } = await supabase
        .from("saves")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setSaves(data || []);
      setLoading(false);
    }
    fetchSaves();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-gray-500 hover:text-white text-sm mb-1 block transition-colors">
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-white">My Journeys</h1>
          </div>
          <Link
            href="/new-save"
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-4 rounded-xl text-sm transition-colors"
          >
            + New
          </Link>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : saves.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">⚽</p>
            <p className="text-lg font-medium">No journeys yet</p>
            <p className="text-sm mt-1">Start a new one to get going</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {saves.map((save) => (
              <div
                key={save.id}
                onClick={() => router.push(`/save/${save.id}`)}
                className="bg-[#141414] hover:bg-[#1c1c1c] border border-white/10 rounded-xl px-5 py-4 cursor-pointer transition-colors"
              >
                <h3 className="text-white font-semibold text-lg">{save.name}</h3>
                <p className="text-green-400 text-sm mt-0.5">{save.club}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}