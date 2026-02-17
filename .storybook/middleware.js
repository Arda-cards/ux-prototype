const SECRET = process.env.STORYBOOK_SECRET || 'ArdaSecretPrototypes';
const REALM = 'Arda Prototypes';

export default function expressMiddleware(app) {
  app.use((req, res, next) => {
    const header = req.headers.authorization;

    if (header) {
      const [scheme, encoded] = header.split(' ');
      if (scheme === 'Basic' && encoded) {
        const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
        const pass = decoded.includes(':') ? decoded.split(':').slice(1).join(':') : decoded;
        if (pass === SECRET) {
          return next();
        }
      }
    }

    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', `Basic realm="${REALM}"`);
    res.end('Access denied');
  });
}
