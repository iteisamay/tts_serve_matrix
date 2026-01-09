import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getAudioDataById } from '../controller/ttsController.js';
import { checkInCache } from '../middleware/redisMiddleWare.js';
import countHit from '../middleware/countHit.js';
import rateLimiter from '../middleware/rateLimiter.js';

const ttsRouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_BASE_PATH = path.join(__dirname, '..','..', 'uploads');


ttsRouter.get('/get/:id',rateLimiter,countHit,checkInCache,getAudioDataById);

export default ttsRouter;