import { createClient } from "redis";
import config from "../config/config.js";

class CacheService {
  constructor() {
    this.client = createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
        tls: process.env.NODE_ENV === "production" ? false : undefined,
      },
      legacyMode: false,
    });

    this.client.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    this.client.on("connect", () => {
      console.log("Redis Client Connected");
    });

    this.client.on("reconnecting", () => {
      console.log("Redis Client Reconnecting");
    });

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error("Redis Connection Error:", error);
    }
  }

  async get(key) {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key, value, expireTime = 3600) {
    await this.client.set(key, JSON.stringify(value), {
      EX: expireTime, // Expires in 1 hour by default
    });
  }

  async del(key) {
    await this.client.del(key);
  }

  async delByPattern(pattern) {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }
}

export default new CacheService();
