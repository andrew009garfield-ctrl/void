import { useEffect, useState, useCallback } from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { authReady } from "../lib/firebase";
import { AUTH_URL, updateLastSignInTime } from "../lib/auth";
import {
  observeAuthTokenState,
  handleAuthRequestSuccess,
  commitValidatedAuthContext,
} from "../lib/authRequestContext";

export interface AppUser {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: boolean;
  image: string | null;
}

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [tokenUser, setTokenUser] = useState<AppUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper to parse JWT payload without external library
  const parseJwtPayload = (token: string): any => {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        return JSON.parse(json);
      }
    } catch (e) {
      console.warn("Failed to parse JWT payload:", e);
    }
    return null;
  };

  // Sync token from Electron's token store (populated via deep link or disk)
  const syncTokenUser = useCallback(async () => {
    if (!window.electronAPI?.authGetTokenState) return false;

    try {
      const tokenState = await window.electronAPI.authGetTokenState();
      const token = tokenState?.token;
      const generation = tokenState?.generation ?? 0;

      if (!token) {
        setTokenUser(null);
        return false;
      }

      // First try to parse the token payload locally for instant response
      const payload = parseJwtPayload(token);
      let userObj: AppUser | null = null;

      if (payload && (payload.userId || payload.id || payload.email)) {
        userObj = {
          id: String(payload.userId || payload.id || payload.sub || "user"),
          name: payload.name || payload.email?.split("@")[0] || null,
          email: payload.email || null,
          emailVerified: true,
          image: payload.avatar || payload.picture || null,
        };
      }

      // If online, also verify with /api/auth/get-session
      try {
        const getSessionUrl = `${AUTH_URL}/api/auth/get-session`;
        const authReq = {
          url: getSessionUrl,
          headers: { Authorization: `Bearer ${token}` },
          voidAuthGeneration: generation,
        };
        const res = await fetch(getSessionUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            userObj = {
              id: String(data.user.id),
              name: data.user.name || null,
              email: data.user.email || null,
              emailVerified: true,
              image: data.user.avatar || null,
            };
            try {
              observeAuthTokenState({ token, generation });
              await handleAuthRequestSuccess({
                data,
                response: res,
                request: authReq,
              });
              commitValidatedAuthContext(generation, userObj.id);
            } catch (authErr) {
              console.warn("Failed to commit auth context:", authErr);
            }
          }
        }
      } catch (err) {
        // Network offline or failed, fallback to local payload
        console.warn("getSession fetch failed, using token payload:", err);
      }

      if (userObj) {
        setTokenUser(userObj);
        updateLastSignInTime();
        try {
          localStorage.setItem("isSignedIn", "true");
        } catch {}
        if (window.electronAPI?.setActiveAccountScope) {
          await window.electronAPI.setActiveAccountScope(userObj.id, generation);
        }
        return true;
      }
    } catch (err) {
      console.error("syncTokenUser error:", err);
    }
    return false;
  }, []);

  useEffect(() => {
    let mounted = true;
    let unsubscribeFirebase: (() => void) | undefined;

    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setIsLoaded(true);
      }
    }, 3000);

    // 1. Check Electron token store first (handles Google SSO deep link redirect)
    syncTokenUser().then((hasUser) => {
      if (!mounted) return;
      if (hasUser) {
        setIsLoaded(true);
        clearTimeout(safetyTimer);
      }
    });

    // 2. Listen to token store changes (e.g. when deep link arrives)
    const unsubscribeTokenStore = window.electronAPI?.onAuthTokenStateChanged?.(() => {
      if (!mounted) return;
      syncTokenUser().then((hasUser) => {
        if (hasUser && mounted) {
          setIsLoaded(true);
          clearTimeout(safetyTimer);
        }
      });
    });

    // 3. Listen to Firebase auth state (for email/password or direct Firebase sign-in)
    authReady
      .then(() => {
        try {
          const authInstance = getAuth();
          unsubscribeFirebase = onAuthStateChanged(
            authInstance,
            async (user) => {
              if (!mounted) return;
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
                  updateLastSignInTime();
                  try {
                    localStorage.setItem("isSignedIn", "true");
                  } catch {}
                } catch (err) {
                  console.error("Auth token setup failed:", err);
                }
              }
            },
            (error) => {
              if (!mounted) return;
              clearTimeout(safetyTimer);
              console.error("Auth state change error:", error);
              setIsLoaded(true);
            }
          );
        } catch (error) {
          if (!mounted) return;
          clearTimeout(safetyTimer);
          console.error("Failed to initialize auth listener:", error);
          setIsLoaded(true);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Firebase authReady failed:", err);
        clearTimeout(safetyTimer);
        setIsLoaded(true);
      });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      unsubscribeTokenStore?.();
      unsubscribeFirebase?.();
    };
  }, [syncTokenUser]);

  const ambientUser: AppUser | null = firebaseUser
    ? {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || null,
        email: firebaseUser.email || null,
        emailVerified: firebaseUser.emailVerified,
        image: firebaseUser.photoURL || null,
      }
    : tokenUser;

  const isSignedIn = Boolean(firebaseUser || tokenUser);

  const refetch = useCallback(async () => {
    if (firebaseUser) {
      try {
        await firebaseUser.getIdToken(true);
      } catch {}
    } else {
      await syncTokenUser();
    }
    return null;
  }, [firebaseUser, syncTokenUser]);

  return {
    isSignedIn,
    isGracePeriodOnly: false,
    isLoaded,
    session: isSignedIn ? { user: ambientUser } : null,
    user: isSignedIn ? ambientUser : null,
    refetch,
  };
}
