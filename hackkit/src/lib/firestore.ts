// lib/firestore.ts
// Generic CRUD helpers — work for any collection/document structure
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  QueryConstraint,
  DocumentData,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Create a document (auto-ID)
 */
export async function createDoc(
  collectionName: string,
  data: DocumentData
): Promise<string> {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Create or overwrite a document (custom ID)
 */
export async function setDocById(
  collectionName: string,
  id: string,
  data: DocumentData
): Promise<void> {
  await setDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Read single document
 */
export async function getDocById<T>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const snap = await getDoc(doc(db, collectionName, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

/**
 * Query collection with optional filters
 */
export async function queryDocs<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

/**
 * Update document fields
 */
export async function updateDocById(
  collectionName: string,
  id: string,
  data: Partial<DocumentData>
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete document
 */
export async function deleteDocById(
  collectionName: string,
  id: string
): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

/**
 * Real-time listener on a query
 * Returns unsubscribe function
 */
export function subscribeToQuery<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (docs: T[]) => void
): Unsubscribe {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
    callback(docs);
  });
}

// Re-export Firestore query helpers so callers don't import directly from firebase/firestore
export { where, orderBy, limit, serverTimestamp };
