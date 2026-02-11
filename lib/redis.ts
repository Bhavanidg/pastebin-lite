// import { Redis } from "@upstash/redis";

// export const redis = Redis.fromEnv();
import { Redis } from "@upstash/redis";

console.log("UPSTASH URL:", process.env.UPSTASH_REDIS_REST_URL);

export const redis = Redis.fromEnv();
