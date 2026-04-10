// server.js - serves built storybook (basic auth disabled)
import express from 'express';
import rateLimit from 'express-rate-limit';
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

const limiter = rateLimit({ windowMs: 60_000, max: 300 });

app.use(express.static(path.join(__dirname, '..', 'storybook-static')));

// Fallback to index.html for SPA routing
app.get('/{*splat}', limiter, (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'storybook-static', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Storybook server running on http://localhost:${PORT}`);
});
