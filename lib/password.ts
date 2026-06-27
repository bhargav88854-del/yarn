import bcrypt from "bcryptjs";

/** Hash a plaintext password for storage. */
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/** Verify a plaintext password against a stored hash. */
export function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
