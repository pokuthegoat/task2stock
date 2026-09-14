export type StoredObject = {
  key: string;
  bytes: Uint8Array;
  contentType: string;
};

export interface StorageProvider {
  put(input: {
    key: string;
    bytes: Uint8Array;
    contentType: string;
  }): Promise<string>;
  get(key: string): Promise<StoredObject | null>;
  delete(key: string): Promise<void>;
}
