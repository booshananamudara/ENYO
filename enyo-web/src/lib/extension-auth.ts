import * as jose from 'jose';
import * as userService from '@/lib/services/user.service';

const JWT_SECRET = new TextEncoder().encode(process.env.EXTENSION_JWT_SECRET ?? 'dev-secret');
const JWT_ISSUER = 'shopEnyo';
const JWT_AUDIENCE = 'enyo-extension';
const JWT_EXPIRY = '7d';

/** Create a JWT token for the Chrome extension. */
export async function createExtensionToken(userId: string, email: string, role: string) {
  return new jose.SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

/** Verify and decode an extension JWT. Returns payload or throws. */
export async function verifyExtensionToken(token: string) {
  const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
  return payload as { userId: string; email: string; role: string };
}

/** Authenticate extension user with email + password, return JWT. */
export async function authenticateExtension(email: string, password: string) {
  const profile = await userService.authenticateWithCredentials(email, password);
  const token = await createExtensionToken(profile.id, profile.email, profile.role);
  return { token, user: profile };
}

/** Extract Bearer token from Authorization header. */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}
