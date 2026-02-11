"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState<string>("");
  const [maxViews, setMaxViews] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function onCreate() {
    setError("");
    setResultUrl("");

    const payload: any = { content };

    if (ttlSeconds.trim() !== "") payload.ttl_seconds = Number(ttlSeconds);
    if (maxViews.trim() !== "") payload.max_views = Number(maxViews);

    const res = await fetch("/api/pastes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data?.error ?? "Something went wrong");
      return;
    }

    setResultUrl(data.url);
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Pastebin-Lite</h1>

      <label style={{ display: "block", marginBottom: 8 }}>Content</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
        placeholder="Paste your text here..."
      />

      <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", marginBottom: 6 }}>TTL (seconds, optional)</label>
          <input
            value={ttlSeconds}
            onChange={(e) => setTtlSeconds(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: 220 }}
            placeholder="e.g. 60"
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Max views (optional)</label>
          <input
            value={maxViews}
            onChange={(e) => setMaxViews(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: 220 }}
            placeholder="e.g. 3"
          />
        </div>
      </div>

      <button
        onClick={onCreate}
        style={{
          marginTop: 14,
          padding: "10px 16px",
          borderRadius: 10,
          border: "none",
          background: "black",
          color: "white",
          cursor: "pointer",
        }}
      >
        Create Paste
      </button>

      {error && (
        <p style={{ marginTop: 12, color: "crimson" }}>
          {error}
        </p>
      )}

      {resultUrl && (
        <p style={{ marginTop: 12 }}>
          Share URL:{" "}
          <a href={resultUrl} target="_blank" rel="noreferrer">
            {resultUrl}
          </a>
        </p>
      )}
    </main>
  );
}
