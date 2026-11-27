import { yondrUser } from './yondr-session.js';

// Who is signed in. Only the Yondr Google sign-in counts: its session cookie (set by auth.overyondrdev.com for
// .overyondrdev.com) is verified by ./yondr-session.js against the public key in YONDR_AUTH_PUBLIC_JWK, with its issuer,
// audience, expiry and email domain (ALLOWED_EMAIL_DOMAINS). Cloudflare Access is set to Bypass for this host, so its
// tokens are not accepted here.

interface AuthEnv { DEV_EMAIL?: string; YONDR_AUTH_PUBLIC_JWK?: string; ALLOWED_EMAIL_DOMAINS?: string }

export async function signedInEmail(request: Request, env: AuthEnv): Promise<string | null> {
  // Local development only (.dev.vars): sign in as DEV_EMAIL, or as X-Dev-Email to try other roles. Never set in production.
  if (env.DEV_EMAIL) return (request.headers.get('X-Dev-Email') || env.DEV_EMAIL).toLowerCase();
  const user = await yondrUser(request, env);
  return user ? user.email : null;
}
