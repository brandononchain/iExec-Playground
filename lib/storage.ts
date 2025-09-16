/**
 * Web3.Storage utilities for uploading encrypted blobs only.
 *
 * - Client is initialized from WEB3STORAGE_TOKEN (environment variable).
 * - putEncryptedBlob uploads ONLY the ciphertext Blob, never plaintext.
 * - getGatewayUrl builds a public gateway URL for a CID and optional name.
 */

import { Web3Storage } from 'web3.storage';

let cachedClient: Web3Storage | null = null;

function resolveWeb3StorageToken(): string {
  // Try multiple common env sources to be resilient across runtimes
  const fromProcess = (globalThis as any)?.process?.env?.WEB3STORAGE_TOKEN as string | undefined;
  const fromImportMeta = (typeof (globalThis as any).importMeta !== 'undefined'
    ? (globalThis as any).importMeta?.env?.WEB3STORAGE_TOKEN
    : (typeof (import.meta as any) !== 'undefined' ? (import.meta as any).env?.WEB3STORAGE_TOKEN : undefined)) as
    | string
    | undefined;
  const fromGlobal = (globalThis as any)?.WEB3STORAGE_TOKEN as string | undefined;

  const token = fromProcess || fromImportMeta || fromGlobal;
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    throw new Error('WEB3STORAGE_TOKEN is not set. Cannot initialize Web3.Storage client.');
  }
  return token;
}

export function getWeb3StorageClient(): Web3Storage {
  if (cachedClient) return cachedClient;
  const token = resolveWeb3StorageToken();
  cachedClient = new Web3Storage({ token });
  return cachedClient;
}

export type PutEncryptedBlobInput = {
  cipher: Blob; // ciphertext only
  name: string; // filename/path to store
};

/**
 * Uploads ONLY the encrypted blob to Web3.Storage and returns the root CID.
 * This function never accepts plaintext to avoid accidental leaks.
 */
export async function putEncryptedBlob({ cipher, name }: PutEncryptedBlobInput): Promise<string> {
  if (!(cipher instanceof Blob)) {
    throw new Error('putEncryptedBlob: "cipher" must be a Blob.');
  }
  if (!name || typeof name !== 'string') {
    throw new Error('putEncryptedBlob: "name" must be a non-empty string.');
  }

  // Wrap the ciphertext Blob in a File to preserve the provided name on upload
  const file = new File([cipher], name, { type: 'application/octet-stream' });
  const client = getWeb3StorageClient();
  const cid = await client.put([file], {
    name,
    wrapWithDirectory: false,
  });
  return cid;
}

/**
 * Builds the public gateway URL for a CID and optional filename.
 * Example: https://<cid>.ipfs.w3s.link or https://<cid>.ipfs.w3s.link/<name>
 */
export function getGatewayUrl(cid: string, name?: string): string {
  if (!cid || typeof cid !== 'string') {
    throw new Error('getGatewayUrl: "cid" must be a non-empty string.');
  }
  const base = `https://${cid}.ipfs.w3s.link`;
  if (!name) return base;
  const safeName = encodeURIComponent(name.replace(/^\/+/, ''));
  return `${base}/${safeName}`;
}

/*
Lightweight tests / usage examples (manual):

// Example 1: Upload encrypted blob only
// import { encryptFile } from './crypto';
// (async () => {
//   const f = new File([new TextEncoder().encode('secret')], 'secret.txt');
//   const { cipher } = await encryptFile(f);
//   const cid = await putEncryptedBlob({ cipher, name: 'secret.enc' });
//   console.log('Stored CID:', cid);
//   console.log('Gateway URL:', getGatewayUrl(cid, 'secret.enc'));
// })();

// Example 2: getGatewayUrl without a name
// console.log(getGatewayUrl('bafy...'));
*/

