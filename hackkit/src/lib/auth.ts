// lib/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export type UserRole = string; // flexible — "doctor" | "patient" | "teacher" | "user" | etc.

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  createdAt?: unknown;
}

/**
 * Register new user + write profile doc to Firestore
 */
export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  role: UserRole
): Promise<AppUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = credential;

  await updateProfile(user, { displayName });

  const appUser: AppUser = {
    uid: user.uid,
    email: user.email,
    displayName,
    role,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, "users", user.uid), appUser);
  return appUser;
}

/**
 * Login existing user
 */
export async function loginUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Get user profile from Firestore (includes role)
 */
export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as AppUser;
}

/**
 * Logout
 */
export async function logoutUser() {
  return signOut(auth);
}

/**
 * Subscribe to auth state — returns unsubscribe fn
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
