// import { NextRequest, NextResponse } from "next/server";
// import { getNowMs } from "@/lib/time";
// import { createPaste } from "@/lib/paste";
// import crypto from "crypto";
// import pool from "@/lib/db";


// function badRequest(message: string) {
//   return NextResponse.json({ error: message }, { status: 400 });
// }

// export async function POST(req: NextRequest) {
//   let body: any;
//   try {
//     body = await req.json();
//   } catch {
//     return badRequest("Invalid JSON body");
//   }

//   const content = body?.content;
//   const ttlSeconds = body?.ttl_seconds;
//   const maxViews = body?.max_views;

//   if (typeof content !== "string" || content.trim().length === 0) {
//     return badRequest("content is required and must be a non-empty string");
//   }

//   let ttl: number | undefined;
//   if (ttlSeconds !== undefined) {
//     if (!Number.isInteger(ttlSeconds) || ttlSeconds < 1) {
//       return badRequest("ttl_seconds must be an integer >= 1");
//     }
//     ttl = ttlSeconds;
//   }

//   let maxV: number | undefined;
//   if (maxViews !== undefined) {
//     if (!Number.isInteger(maxViews) || maxViews < 1) {
//       return badRequest("max_views must be an integer >= 1");
//     }
//     maxV = maxViews;
//   }

//   const nowMs = getNowMs(req);

//   const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

//   await createPaste({
//     id,
//     content,
//     nowMs,
//     ttlSeconds: ttl,
//     maxViews: maxV,
//   });

//   const proto = req.headers.get("x-forwarded-proto") ?? "http";
//   const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
//   const base = host ? `${proto}://${host}` : "";

//   return NextResponse.json(
//     { id, url: `${base}/p/${id}` },
//     { status: 201 }
//   );
// }


import { NextRequest, NextResponse } from "next/server";
import { getNowMs } from "@/lib/time";
import { createPaste } from "@/lib/paste";
import crypto from "crypto";

function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const content = body?.content;
  const ttlSeconds = body?.ttl_seconds;
  const maxViews = body?.max_views;

  if (typeof content !== "string" || content.trim().length === 0) {
    return badRequest("content is required and must be a non-empty string");
  }

  let ttl;
  if (ttlSeconds !== undefined) {
    if (!Number.isInteger(ttlSeconds) || ttlSeconds < 1) {
      return badRequest("ttl_seconds must be an integer >= 1");
    }
    ttl = ttlSeconds;
  }

  let maxV;
  if (maxViews !== undefined) {
    if (!Number.isInteger(maxViews) || maxViews < 1) {
      return badRequest("max_views must be an integer >= 1");
    }
    maxV = maxViews;
  }

  const nowMs = getNowMs(req);
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

  await createPaste({
    id,
    content,
    nowMs,
    ttlSeconds: ttl,
    maxViews: maxV,
  });

  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const base = host ? `${proto}://${host}` : "";

  return NextResponse.json({ id, url: `${base}/p/${id}` }, { status: 201 });
}