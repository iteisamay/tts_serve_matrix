import {redisClient} from "../db/redisClient.js";

const countHit = async (req, res, next) => {
  const { id } = req.params;
  const hitKey = `tts:hit:${id}`;

  try {
    const count = await redisClient.incr(hitKey);
    if (count === 1) {
      await redisClient.expire(hitKey, 600);
    }
    next();
  } catch (err) {
    console.error(err);
    next();
  }
};


export default countHit;
