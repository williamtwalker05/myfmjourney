"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSave() {
  const [name, setName] = useState("");
  const [club, setClub] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function createSave() {
    if (!name || !club) {
      alert("Please fill in both fields");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("saves").insert({
      name,
      club,
      created_at: new Date(),
      updated_at: new Date(),
    });

    setLoading(false);

    if (error) {
      alert("Error saving data");
      return;
    }

    router.push("/my-journeys");
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-gray-500 hover:text-white text-sm mb-6 block transition-colors">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold text-white mb-1">New Journey</h1>
        <p className="text-gray-400 mb-8">Fill in the details to get started.</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Save Name</label>
            <input
              placeholder="e.g. My Arsenal Save"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Club</label>
            <input
              placeholder="e.g. Arsenal"
              value={club}
              onChange={(e) => setClub(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <button
            onClick={createSave}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors mt-2"
          >
            {loading ? "Creating..." : "Create Journey"}
          </button>
        </div>
      </div>
    </main>
  );
}