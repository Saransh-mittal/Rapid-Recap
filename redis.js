const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDISHOST,
  port: process.env.REDISPORT,
  username: process.env.REDISUSER,
  password: process.env.REDISPASSWORD,
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

redis.on("connect", () => {
  console.log("Successfully connected to Redis");
});

module.exports = { redis };
