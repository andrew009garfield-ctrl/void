import { useEffect, useState, useCallback } from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { authReady } from "../lib/firebase";

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setIsLoaded((prev) => {
        if (!prev) console.warn("Auth safety timeout fired");
        return true;
      });
    }, 3000);

    let unsubscribe: (() => void) | undefined;

    authReady.then(() => {
      try {
        const authInstance = getAuth();
        unsubscribe = onAuthStateChanged(
          authInstance,
          async (user) => {
            clearTimeout(safetyTimer);
            setFirebaseUser(user);
            setIsLoaded(true);

            if (user) {
              try {
                const token = await user.getIdToken();
                if (window.electronAPI?.authSetToken) {
                  await window.electronAPI.authSetToken(token, 0);
                }
                const tokenState = await window.electronAPI?.authGetTokenState?.();
                const generation = tokenState?.generation ?? 0;
                if (window.electronAPI?.setActiveAccountScope) {
                  await window.electronAPI.setActiveAccountScope(user.uid, generation);
                }
              } catch (err) {
                console.error("Auth token setup failed:", err);
              }
            } else {
              if (window.electronAPI?.setActiveAccountScope) {
                await window.electronAPI.setActiveAccountScope(null, 0);
              }
            }
          },
          (error) => {
            clearTimeout(safetyTimer);
            console.error("Auth state change error:", error);
            setIsLoaded(true);
          }
        );
      } catch (error) {
        clearTimeout(safetyTimer);
        console.error("Failed to initialize auth listener:", error);
        setIsLoaded(true);
      }
    }).catch((err) => {
      console.error("Firebase authReady failed:", err);
      clearTimeout(safetyTimer);
      setIsLoaded(true);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe?.();
    };
  }, []);

  const ambientUser = firebaseUser
    ? {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || null,
        email: firebaseUser.email || null,
        emailVerified: firebaseUser.emailVerified,
        image: firebaseUser.photoURL || null,
      }
    : null;

  const isSignedIn = Boolean(firebaseUser);

  const refetch = useCallback(async () => {
    if (firebaseUser) {
      try {
        await firebaseUser.getIdToken(true);
      } catch {}
    }
    return null;
  }, [firebaseUser]);

  return {
    isSignedIn,
    isGracePeriodOnly: false,
    isLoaded,
    session: isSignedIn ? { user: ambientUser } : null,
    user: isSignedIn ? ambientUser : null,
    refetch,
  };
}
