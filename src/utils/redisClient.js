const { createClient } = require("redis");

const redisClient = createClient({ url: "redis://:@localhost:6379" });

redisClient.on("ready", () => {
  console.log("Redis connected successfully");
});

redisClient.on("error", (err) => {
  console.error("Error in Redis Connection", err);
});

(() => {
  redisClient.connect();
})();

module.exports = redisClient;
