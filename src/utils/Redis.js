const { createClient } = require("redis");

class Redis {
  constructor(url = "redis://:@localhost:6379") {
    this.connect(url);
  }

  connect(url = "redis://:@localhost:6379") {
    this.client = createClient({ url });
    this.client.on("ready", () => {
      console.log("Redis connected successfully");
    });
    this.client.on("error", (err) => {
      console.error("Error in Redis Connection", err);
    });
    this.client.connect();
  }

  async deleteKeysFromRedis(keys) {
    if (!keys || keys.length === 0) {
      console.warn("No keys provided for deletion");
      return;
    }

    try {
      await this.client.del(keys);
    } catch (err) {
      console.error("Error while removing keys from Redis:", err);
    }
  }
}

module.exports = new Redis();
