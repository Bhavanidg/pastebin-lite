import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { fetchAndCountView } from "@/lib/paste";

async function getNowMsFromHeaders(): Promise<number> {
  const h = await headers();
  const testMode = process.env.TEST_MODE === "1";

  if (testMode) {
    const v = h.get("x-test-now-ms");
    if (v) {
      const ms = Number(v);
      if (Number.isFinite(ms) && ms >= 0) return ms;
    }
  }

  return Date.now();
}

export default async function PastePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const nowMs = await getNowMsFromHeaders(); 

  const result = await fetchAndCountView(id, nowMs);
  if (!result.ok) notFound();

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 18, marginBottom: 12 }}>Paste: {id}</h1>

      {result.remainingViews !== null && (
        <p>Remaining views: <b>{result.remainingViews}</b></p>
      )}

      {result.expiresAtMs !== null && (
        <p>Expires at: <b>{new Date(result.expiresAtMs).toISOString()}</b></p>
      )}

      <pre style={{ whiteSpace: "pre-wrap" }}>
        {result.content}
      </pre>
    </main>
  );
}