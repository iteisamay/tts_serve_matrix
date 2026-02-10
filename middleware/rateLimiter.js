import {redisClient} from "../db/redisClient.js";

const RATE_LIMIT = 5;      // requests
const WINDOW = 60;        // seconds

const rateLimiter = async (req, res, next) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;
    const key = `rl:${ip}`;

    const count = await redisClient.incr(key);

    // first request → set TTL
    if (count === 1) {
      await redisClient.expire(key, WINDOW);
    }

    if (count > RATE_LIMIT) {
      return res.status(429).json({
        msg: "Too many requests. Try again in a minute."
      });
    }

    next();
  } catch (err) {
    console.error("Rate limiter error:", err);
    next(); // fail-open (important)
  }
};

export default rateLimiter;
