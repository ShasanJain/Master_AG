// lib/storage.ts
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "./firebase";

export type UploadProgress = {
  progress: number; // 0–100
  downloadURL?: string;
  error?: Error;
};

/**
 * Upload file with progress callback
 * @param path - e.g. "uploads/userId/filename.pdf"
 */
export function uploadFile(
  path: string,
  file: File,
  onProgress?: (snapshot: UploadTaskSnapshot) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snap) => onProgress?.(snap),
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

/**
 * Delete file by path
 */
export async function deleteFile(path: string): Promise<void> {
  await deleteObject(ref(storage, path));
}

/**
 * Get allowed MIME types for uploads (security)
 */
export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
];

export function isAllowedType(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type);
}
