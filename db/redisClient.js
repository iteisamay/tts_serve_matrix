import { createClient } from "redis";
import { configDotenv } from "dotenv";

configDotenv();
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:6379`
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

await redisClient.connect();

export {redisClient};
