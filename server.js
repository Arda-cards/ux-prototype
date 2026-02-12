// server.js - serves built storybook with basic auth
const express = require('express');
const basicAuth = require('express-basic-auth');
const path = require('node:path');

const PORT = process.env.PORT || 8080;
const SECRET = process.env.STORYBOOK_SECRET || 'ArdaSecretPrototypes';

const app = express();

app.use(
  basicAuth({
    users: { arda: SECRET },
    challenge: true,
    realm: 'Arda Prototypes',
  }),
);

app.use(express.static(path.join(__dirname, 'storybook-static')));

// Fallback to index.html for SPA routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'storybook-static', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Storybook server running on http://localhost:${PORT}`);
});
