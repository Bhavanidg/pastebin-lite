// import { NextResponse } from "next/server";
// import { redis } from "@/lib/redis";

// export async function GET() {
//   try {
//     await redis.ping();
//     return NextResponse.json({ ok: true }, { status: 200 });
//   } catch {
//     return NextResponse.json({ ok: false }, { status: 500 });
//   }
// }
export async function POST(req: Request) {
  const url = new URL("/pipeline", req.url); // ✅ absolute now

  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ /* your payload */ }),
  });

  // ...rest of your logic
}