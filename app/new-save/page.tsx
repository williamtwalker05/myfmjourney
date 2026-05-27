"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewSave() {
  const [name, setName] = useState("");
  const [club, setClub] = useState("");

  async function createSave() {
    const { error } = await supabase.from("saves").insert({
      name,
      club,
    });

    if (error) {
      alert("Error saving data");
      console.log(error);
      return;
    }

    alert("Save created!");
    setName("");
    setClub("");
  }

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Create New Save</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
        <input
          placeholder="Save name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 10, width: 300 }}
        />

        <input
          placeholder="Club"
          value={club}
          onChange={(e) => setClub(e.target.value)}
          style={{ padding: 10, width: 300 }}
        />

        <button onClick={createSave} style={{ padding: 10, width: 150 }}>
          Create Save
        </button>
      </div>
    </main>
  );
}