import {redisClient} from "../db/redisClient.js";
/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/

const checkInCache = async (req, res, next) => {
  const { id } = req.params;
  const cacheKey = `TTS${id}`;

  try {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        data: JSON.parse(cachedData)
      });
    }

    next();
  } catch (error) {
    console.error("Redis read error:", error);
    next(); 
  }
};

export default checkInCache;


export { checkInCache }