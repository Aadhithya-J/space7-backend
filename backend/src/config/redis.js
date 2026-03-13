const Redis = require("ioredis");

const redisUrl = process.env.REDIS_URL;
const useTls =
  process.env.REDIS_TLS === "true" ||
  (typeof redisUrl === "string" &&
    (redisUrl.startsWith("rediss://") || redisUrl.includes("upstash.io")));

const redisConfig = redisUrl
  ? {
      url: redisUrl,
      tls: useTls ? {} : undefined,
    }
  : {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      tls: useTls ? {} : undefined,
    };

const redis = new Redis(redisConfig, {
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
  connectTimeout: 10000,
  retryStrategy(times) {
    return Math.min(times * 200, 3000);
  },
  reconnectOnError(err) {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
  }
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

module.exports = redis;
