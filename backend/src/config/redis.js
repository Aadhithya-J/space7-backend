const Redis = require("ioredis");

const redisUrl = process.env.REDIS_URL;
const useTls =
  process.env.REDIS_TLS === "true" ||
  (typeof redisUrl === "string" &&
    (redisUrl.startsWith("rediss://") || redisUrl.includes("upstash.io")));

function buildRedisConfig() {
  if (redisUrl) {
    const parsed = new URL(redisUrl);
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 6379),
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      tls: useTls ? {} : undefined,
    };
  }

  return {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
    username: process.env.REDIS_USER || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: useTls ? {} : undefined,
  };
}

const baseRedisConfig = buildRedisConfig();

const redis = new Redis(baseRedisConfig, {
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
  console.error("Redis error:", err.message || err);
});

const bullConnection = {
  ...baseRedisConfig,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  connectTimeout: 10000,
};

module.exports = redis;
module.exports.bullConnection = bullConnection;
