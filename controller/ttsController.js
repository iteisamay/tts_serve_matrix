import pgClient from '../db/pgClient.js';
import {redisClient} from "../db/redisClient.js";

/**
* Assigns line item type
* @param {import('express').Request} req - Express request
* @param {import('express').Response} res - Express response
*/
const getAudioDataById = async (req, res) => {
  const { id } = req.params;
  const enable_caching = req.query.cache === "true";

  const rowId = `TTS${id}`;
  const cacheKey = `TTS:${id}`;

  try {
    const selectQ = `select * from tbl_tts_record where tts_id=$1;`;
    const { rows, rowCount } = await pgClient.query(selectQ, [rowId]);

    if (rowCount !== 1) {
      return res.status(404).send({ msg: "Id does not exist." });
    }

    if (enable_caching) {
      await redisClient.setEx(
        cacheKey,
        300, // 5 minutes
        JSON.stringify(rows)
      );
    }

    return res.status(200).send({
      msg: "From DB",
      data: rows
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ msg: "Error: " + error.message });
  }
};

export{getAudioDataById}