import { redis } from "./redis";

export type PasteFetchResult =
  | { ok: true; content: string; expiresAtMs: number | null; remainingViews: number | null }
  | { ok: false };

const LUA_FETCH_AND_INCREMENT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])

if redis.call("EXISTS", key) == 0 then
  return {0}
end

local content = redis.call("HGET", key, "content")
local expiresAt = redis.call("HGET", key, "expiresAtMs")
local maxViews = redis.call("HGET", key, "maxViews")
local views = redis.call("HGET", key, "views")

if not views then views = "0" end

-- Expiry check
if expiresAt and expiresAt ~= "" then
  if tonumber(expiresAt) <= now then
    return {0}
  end
end

-- View limit check (before increment)
if maxViews and maxViews ~= "" then
  if tonumber(views) >= tonumber(maxViews) then
    return {0}
  end
end

-- Increment views atomically
local newViews = redis.call("HINCRBY", key, "views", 1)

return {1, content or "", expiresAt or "", maxViews or "", tostring(newViews)}
`;

export async function fetchAndCountView(id: string, nowMs: number): Promise<PasteFetchResult> {
  const key = `paste:${id}`;

  // @upstash/redis supports eval
  const res = (await redis.eval(LUA_FETCH_AND_INCREMENT, [key], [String(nowMs)])) as unknown;

  // Expect array: [flag, content, expiresAt, maxViews, newViews]
  if (!Array.isArray(res) || res.length < 1) return { ok: false };
  const flag = Number(res[0]);
  if (flag !== 1) return { ok: false };

  const content = String(res[1] ?? "");
  const expiresAtRaw = String(res[2] ?? "");
  const maxViewsRaw = String(res[3] ?? "");
  const newViewsRaw = String(res[4] ?? "0");

  const expiresAtMs = expiresAtRaw !== "" ? Number(expiresAtRaw) : null;
  const maxViews = maxViewsRaw !== "" ? Number(maxViewsRaw) : null;
  const newViews = Number(newViewsRaw);

  const remainingViews =
    maxViews === null ? null : Math.max(0, maxViews - newViews);

  return { ok: true, content, expiresAtMs, remainingViews };
}

export async function createPaste(args: {
  id: string;
  content: string;
  nowMs: number;
  ttlSeconds?: number;
  maxViews?: number;
}): Promise<void> {
  const key = `paste:${args.id}`;

  const expiresAtMs =
    typeof args.ttlSeconds === "number" ? args.nowMs + args.ttlSeconds * 1000 : null;

  // Store as Redis Hash
  await redis.hset(key, {
    content: args.content,
    createdAtMs: String(args.nowMs),
    expiresAtMs: expiresAtMs === null ? "" : String(expiresAtMs),
    maxViews: typeof args.maxViews === "number" ? String(args.maxViews) : "",
    views: "0",
  });

  // Optional Redis TTL for cleanup
  if (typeof args.ttlSeconds === "number") {
    await redis.expire(key, args.ttlSeconds);
  }
}
