import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>My FM Journey</h1>

      <p>Track your Football Manager careers</p>

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <Link
          href="/new-save"
          style={{
            padding: "8px 12px",
            border: "1px solid black",
            borderRadius: 6,
            textDecoration: "none",
            color: "black",
          }}
        >
          New Save
        </Link>

        <button style={{ padding: "8px 12px" }}>My Journeys</button>

        <button style={{ padding: "8px 12px" }}>New Online Save</button>
      </div>
    </main>
  );
}