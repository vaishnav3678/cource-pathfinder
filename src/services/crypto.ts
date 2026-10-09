/**
 * Secure password hashing utility using Web Crypto API SHA-256.
 * Passwords are never stored in plaintext in the database or storage.
 */

export async function hashPassword(password: string, salt: string = 'pathfinder_salt_2026'): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string, salt: string = 'pathfinder_salt_2026'): Promise<boolean> {
  const computed = await hashPassword(password, salt);
  return computed === hash;
}
