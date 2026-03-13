const Redis = require("ioredis");

const redisConfig = process.env.REDIS_URL
  ? process.env.REDIS_URL
  : {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || undefined,
    };

const redis = new Redis(redisConfig, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
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
