const Redis = require("ioredis");

const redisUrl = process.env.REDIS_URL;
console.log(
  "Connecting to Redis Labs at:",
  redisUrl.replace(/\/\/.*@/, "//<credentials>@")
);

const redis = new Redis(redisUrl);

redis.on("error", (error) => {
  console.error("Redis Labs connection error:", error);
});

redis.on("connect", () => {
  console.log("Successfully connected to Redis Labs");
});

module.exports = { redis };
