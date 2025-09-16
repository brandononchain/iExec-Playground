declare module 'web3.storage' {
  export class Web3Storage {
    constructor(options: { token: string });
    put(
      files: File[] | Blob[] | Iterable<File | Blob>,
      options?: { name?: string; wrapWithDirectory?: boolean }
    ): Promise<string>;
  }
}

