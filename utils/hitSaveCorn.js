import cron from "node-cron";
import {redisClient} from "../db/redisClient.js";
import pgClient from '../db/pgClient.js';

cron.schedule("*/5 * * * *", async () => {
  console.log("⏱ Syncing Redis hits to DB...");

  try {
    const keys = await redisClient.keys("tts:hit:*");

    if (keys.length === 0) return;

    const pipeline = redisClient.multi();

    keys.forEach(key => pipeline.get(key));
    const counts = await pipeline.exec();

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const count = parseInt(counts[i]);

      if (!count || count === 0) continue;

      const id = key.split(":")[2];
      const rowId = `TTS${id}`;

      await pgClient.query(
        `UPDATE tbl_tts_record
         SET hit_count = hit_count + $1
         WHERE tts_id = $2`,
        [count, rowId]
      );
    }

    // reset counters AFTER successful DB update
    await redisClient.del(keys);

    console.log("✅ Hit sync completed");
  } catch (err) {
    console.error("❌ Hit sync failed:", err);
  }
});
