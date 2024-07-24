const Redis = require("ioredis");

// NOTE: Storing passwords directly in code is not recommended for production environments.
// Use environment variables or a secure secret management system instead.
const redis = new Redis({
  host: "redis-17448.c114.us-east-1-4.ec2.redns.redis-cloud.com",
  port: 17448,
  password: "jknSsgDZUiOpIgZZSE5qMrhD4HHCHvtG", // Replace with your actual password or use process.env.REDIS_PASSWORD
});

module.exports = { redis };
