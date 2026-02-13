const SECRET = process.env.SHARED_SECRET || 'ArdaSecretPrototypes';
const REALM = 'Arda Prototypes';

export default function middleware(request: Request): Response {
  const header = request.headers.get('authorization');

  if (header) {
    const [scheme, encoded] = header.split(' ');
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded);
      const pass = decoded.includes(':') ? decoded.split(':').slice(1).join(':') : decoded;
      if (pass === SECRET) {
        return new Response(null, { status: 200, headers: { 'x-middleware-next': '1' } });
      }
    }
  }

  return new Response('Access denied', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}"`,
    },
  });
}
