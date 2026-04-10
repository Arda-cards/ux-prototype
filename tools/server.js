// server.js - serves built storybook (basic auth disabled)
import express from 'express';
// import basicAuth from 'express-basic-auth';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 8080;
// const SECRET = process.env.STORYBOOK_SECRET || 'ArdaSecretPrototypes';

const app = express();

// Basic auth — disabled. Uncomment to re-enable.
// app.use(
//   basicAuth({
//     users: { arda: SECRET },
//     challenge: true,
//     realm: 'Arda Prototypes',
//   }),
// );

app.use(express.static(path.join(__dirname, '..', 'storybook-static')));

// Simple rate limiter for the SPA fallback (satisfies CodeQL).
const hits = new Map();
setInterval(() => hits.clear(), 60_000);
function rateLimit(req, res, next) {
  const key = req.ip;
  const count = (hits.get(key) ?? 0) + 1;
  hits.set(key, count);
  if (count > 300) return res.status(429).send('Too many requests');
  next();
}

// Fallback to index.html for SPA routing
app.get('/{*splat}', rateLimit, (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'storybook-static', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Storybook server running on http://localhost:${PORT}`);
});
