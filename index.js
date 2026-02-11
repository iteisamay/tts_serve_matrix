// server.js
import express from "express";
import { configDotenv } from "dotenv";
import bodyParser from "body-parser";
import cors from 'cors';
import pgClient from "./db/pgClient.js";
import { fileURLToPath } from 'url';
import path from 'path';
import ttsRouter from "./router/ttsRouter.js";
import {syncRedisHits} from "./utils/hitSaveCorn.js";
import fs from "fs/promises";
import e from "cors";


configDotenv();

const PORT = process.env.PORT || 3000;

pgClient.connect()
  .then(client => {
    console.log("✅ Connected to PostgreSQL");
  })
  .catch(err => {
    console.error("❌ PostgreSQL connection error:", err.stack);
  });

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_BASE_PATH = path.join(__dirname, 'uploads');

const ensureFolders = async () => {
  const folders = [
    UPLOAD_BASE_PATH,
    path.join(UPLOAD_BASE_PATH, 'qr'),
    path.join(UPLOAD_BASE_PATH, 'audios'),
    path.join(UPLOAD_BASE_PATH, 'images')
  ];

  for (const folder of folders) {
    await fs.mkdir(folder, { recursive: true });
  }

  console.log("✅ Upload directories ready");
};

await ensureFolders();



const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error("CORS blocked"));
  },
  credentials: true
}));

app.use(express.json());
app.set("trust proxy", true);



app.use('/s2/qr', express.static(path.join(UPLOAD_BASE_PATH, 'qr'),{
  etag: false,
  lastModified: false,
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

app.use('/s2/audio', express.static(path.join(UPLOAD_BASE_PATH, 'audios'), {
  etag: false,
  lastModified: false,
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

app.use('/s2/images', express.static(path.join(UPLOAD_BASE_PATH, 'images'),{
  etag: false,
  lastModified: false,
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));




app.use('/s2/api/v1/tts', ttsRouter);

app.listen(PORT, () => console.log("Server listening on", PORT));
syncRedisHits();
