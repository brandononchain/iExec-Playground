/**
 * Crypto utilities for AES-GCM file encryption/decryption using WebCrypto.
 *
 * - Uses 256-bit AES-GCM and a 12-byte IV (nonce).
 * - Exposes helpers to base64 encode/decode ArrayBuffer values.
 * - Includes lightweight tests and an inline usage example in comments below.
 */

export type EncryptionMeta = {
  alg: 'AES-GCM';
  iv: string; // base64-encoded 12-byte IV
  keyJwk: JsonWebKey;
};

const AES_GCM_ALGORITHM_NAME = 'AES-GCM' as const;
const AES_KEY_LENGTH_BITS = 256 as const;
const IV_BYTE_LENGTH = 12 as const; // 96-bit nonce, recommended for GCM

/**
 * Base64-encodes an ArrayBuffer.
 */
export function encodeBase64(buffer: ArrayBuffer): string {
  // Prefer web APIs when available
  // Fallback to Node's Buffer if btoa is unavailable
  const bytes = new Uint8Array(buffer);

  if (typeof (globalThis as any).btoa === 'function') {
    // Build binary string in chunks to avoid stack/argument limits
    let binary = '';
    const chunkSize = 0x8000; // 32KB chunks
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return (globalThis as any).btoa(binary);
  }

  const NodeBuffer = (globalThis as any).Buffer;
  if (NodeBuffer && typeof NodeBuffer.from === 'function') {
    return NodeBuffer.from(bytes).toString('base64');
  }

  throw new Error('No base64 encoder available in this environment.');
}

/**
 * Decodes a base64 string into an ArrayBuffer.
 */
export function decodeBase64(base64: string): ArrayBuffer {
  if (typeof (globalThis as any).atob === 'function') {
    const binary = (globalThis as any).atob(base64);
    const length = binary.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  const NodeBuffer = (globalThis as any).Buffer;
  if (NodeBuffer && typeof NodeBuffer.from === 'function') {
    const buf = NodeBuffer.from(base64, 'base64');
    // Return a standalone ArrayBuffer slice that precisely spans the Buffer contents
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }

  throw new Error('No base64 decoder available in this environment.');
}

function getCryptoOrThrow(): Crypto {
  const c = (globalThis as any).crypto as Crypto | undefined;
  if (!c || typeof c.getRandomValues !== 'function' || !c.subtle) {
    throw new Error('WebCrypto is not available (crypto.subtle missing).');
  }
  return c;
}

/**
 * Encrypts a File using AES-GCM with a randomly generated 12-byte IV and a fresh 256-bit key.
 *
 * Returns the ciphertext as a Blob and the metadata necessary for decryption
 * (algorithm identifier, base64 IV, and the exported key as JWK).
 */
export async function encryptFile(file: File): Promise<{ cipher: Blob; meta: EncryptionMeta }> {
  const cryptoObj = getCryptoOrThrow();
  const subtle = cryptoObj.subtle;

  const ivBytes = new Uint8Array(IV_BYTE_LENGTH);
  cryptoObj.getRandomValues(ivBytes);

  const cryptoKey = await subtle.generateKey(
    { name: AES_GCM_ALGORITHM_NAME, length: AES_KEY_LENGTH_BITS },
    true,
    ['encrypt', 'decrypt']
  );

  const plaintextBuffer = await file.arrayBuffer();
  const ciphertextBuffer = await subtle.encrypt(
    { name: AES_GCM_ALGORITHM_NAME, iv: ivBytes },
    cryptoKey,
    plaintextBuffer
  );

  const keyJwk = (await subtle.exportKey('jwk', cryptoKey)) as JsonWebKey;

  const cipherBlob = new Blob([ciphertextBuffer], { type: 'application/octet-stream' });
  const meta: EncryptionMeta = {
    alg: AES_GCM_ALGORITHM_NAME,
    iv: encodeBase64(ivBytes.buffer),
    keyJwk,
  };

  return { cipher: cipherBlob, meta };
}

/**
 * Decrypts a ciphertext Blob produced by encryptFile using the provided meta.
 *
 * Returns a Blob with the decrypted plaintext bytes.
 */
export async function decryptFile(cipher: Blob, meta: EncryptionMeta): Promise<Blob> {
  if (meta.alg !== AES_GCM_ALGORITHM_NAME) {
    throw new Error(`Unsupported algorithm: ${meta.alg}`);
  }

  const cryptoObj = getCryptoOrThrow();
  const subtle = cryptoObj.subtle;

  const ivBuffer = decodeBase64(meta.iv);
  const ivBytes = new Uint8Array(ivBuffer);
  if (ivBytes.byteLength !== IV_BYTE_LENGTH) {
    throw new Error(`Invalid IV length: expected ${IV_BYTE_LENGTH}, got ${ivBytes.byteLength}`);
  }

  const cryptoKey = await subtle.importKey(
    'jwk',
    meta.keyJwk,
    { name: AES_GCM_ALGORITHM_NAME },
    false,
    ['decrypt']
  );

  const ciphertextBuffer = await cipher.arrayBuffer();
  const plaintextBuffer = await subtle.decrypt(
    { name: AES_GCM_ALGORITHM_NAME, iv: ivBytes },
    cryptoKey,
    ciphertextBuffer
  );

  return new Blob([plaintextBuffer], { type: 'application/octet-stream' });
}

/*
Lightweight tests (manual/inline):

// Example 1: Round-trip text
(async () => {
  const text = 'hello aes-gcm';
  const inputFile = new File([new TextEncoder().encode(text)], 'hello.txt', { type: 'text/plain' });
  const { cipher, meta } = await encryptFile(inputFile);
  const plainBlob = await decryptFile(cipher, meta);
  const roundTripText = await plainBlob.text();
  console.assert(roundTripText === text, 'Round-trip should match original text');
})();

// Example 2: Base64 helpers integrity
(async () => {
  const data = new Uint8Array([1, 2, 3, 4, 5]).buffer;
  const b64 = encodeBase64(data);
  const back = decodeBase64(b64);
  console.assert(new Uint8Array(back).every((v, i) => v === new Uint8Array(data)[i]), 'Base64 helpers should be identity');
})();

// Example 3: Small inline usage sample (copy into app code)
// const fileInput = document.querySelector('input[type="file"]');
// fileInput?.addEventListener('change', async (e) => {
//   const f = (e.target as HTMLInputElement).files?.[0];
//   if (!f) return;
//   const { cipher, meta } = await encryptFile(f);
//   // Persist cipher and meta as needed...
//   const decrypted = await decryptFile(cipher, meta);
//   console.log('Decrypted bytes:', new Uint8Array(await decrypted.arrayBuffer()));
// });
*/

