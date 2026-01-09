import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://localhost:6379" // docker exposed port
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

await redisClient.connect();

export {redisClient};
