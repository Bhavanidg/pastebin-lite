import type { NextRequest } from "next/server";

export function getNowMs(req?: NextRequest): number {
  const testMode = process.env.TEST_MODE === "1";
  if (testMode && req) {
    const header = req.headers.get("x-test-now-ms");
    if (header) {
      const ms = Number(header);
      if (Number.isFinite(ms) && ms >= 0) return ms;
    }
  }
  return Date.now();
}
