"use client";
// contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "firebase/auth";
import { AppUser, getUserProfile, onAuthChange } from "@/lib/auth";

interface AuthContextValue {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  appUser: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          let profile = await getUserProfile(user.uid);
          
          // Auto-heal missing profile
          if (!profile) {
            console.warn("Profile missing in Firestore! Auto-healing...");
            const newProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || "User",
              role: "user",
            };
            const { doc, setDoc } = await import("firebase/firestore");
            const { db } = await import("@/lib/firebase");
            await setDoc(doc(db, "users", user.uid), newProfile);
            profile = newProfile;
          }
          
          setAppUser(profile);
        } catch (error) {
          console.error("AuthContext Error (Firestore might still be locked):", error);
          // Fallback to minimal user so they don't get stuck in a redirect loop
          setAppUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "User",
            role: "user",
          });
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
