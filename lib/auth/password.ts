const PASSWORD_ITERATIONS = 310_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

export type PasswordDigest = Readonly<{
  hash: string;
  salt: string;
  iterations: number;
}>;

export async function hashPassword(password: string): Promise<PasswordDigest> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derivePassword(password, salt, PASSWORD_ITERATIONS);
  return { hash: toBase64Url(hash), salt: toBase64Url(salt), iterations: PASSWORD_ITERATIONS };
}

export async function verifyPassword(password: string, digest: PasswordDigest): Promise<boolean> {
  if (!Number.isInteger(digest.iterations) || digest.iterations < 100_000 || digest.iterations > 1_000_000) return false;
  let expected: Uint8Array;
  try {
    expected = fromBase64Url(digest.hash);
    const salt = fromBase64Url(digest.salt);
    const actual = await derivePassword(password, salt, digest.iterations);
    return constantTimeEqual(actual, expected);
  } catch {
    return false;
  }
}

export async function consumeDummyPasswordCheck(password: string): Promise<void> {
  const fixedSalt = new TextEncoder().encode("language-guide!");
  await derivePassword(password, fixedSalt, PASSWORD_ITERATIONS);
}

async function derivePassword(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const saltBuffer = new Uint8Array(salt).buffer;
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBuffer, iterations }, key, HASH_BYTES * 8);
  return new Uint8Array(bits);
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

function toBase64Url(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
