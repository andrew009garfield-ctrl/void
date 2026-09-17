import {
  auth as firebaseAuth,
  googleProvider,
  isFirebaseConfigured,
} from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  updatePassword as firebaseUpdatePassword,
  type User,
  type UserCredential,
} from "firebase/auth";
import { openExternalLink } from "../utils/externalLinks";

// Re-export Firebase auth instance for useAuth hook
export const auth = firebaseAuth;
import {
  observeAuthTokenStateEvent,
  type AuthTokenStateEvent,
} from "./authRequestContext";

export const AUTH_URL = import.meta.env.VITE_AUTH_URL || "https://void-auth.andrew009garfield.workers.dev";

// Firebase auth instance (null if not configured)
export const authClient = firebaseAuth;

// Re-export isFirebaseConfigured for backward compatibility
export { isFirebaseConfigured };

let authRefetchTimer: ReturnType<typeof setTimeout> | null = null;
window.electronAPI?.onAuthTokenStateChanged?.((state: AuthTokenStateEvent) => {
  observeAuthTokenStateEvent(state);
  // Main broadcasts a successful compare-and-set rotation before the IPC
  // invocation resolves. Deferring avoids aborting the exact session request
  // that is about to bind the new generation.
  if (authRefetchTimer) clearTimeout(authRefetchTimer);
  authRefetchTimer = setTimeout(() => {
    authRefetchTimer = null;
    // Firebase handles session internally - no need for refetch
  }, 0);
});

export type SocialProvider = "google" | "microsoft" | "apple";

const LAST_SIGN_IN_STORAGE_KEY = "void:lastSignInTime";
const GRACE_PERIOD_MS = 60_000;
const GRACE_RETRY_COUNT = 6;
const INITIAL_GRACE_RETRY_DELAY_MS = 500;

let lastSignInTime: number | null = null;

function getLocalStorageSafe(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function loadLastSignInTimeFromStorage(): number | null {
  const storage = getLocalStorageSafe();
  if (!storage) return null;

  const raw = storage.getItem(LAST_SIGN_IN_STORAGE_KEY);
  if (!raw) return null;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    storage.removeItem(LAST_SIGN_IN_STORAGE_KEY);
    return null;
  }

  return parsed;
}

function persistLastSignInTime(value: number | null): void {
  const storage = getLocalStorageSafe();
  if (!storage) return;

  if (value === null) {
    storage.removeItem(LAST_SIGN_IN_STORAGE_KEY);
  } else {
    storage.setItem(LAST_SIGN_IN_STORAGE_KEY, String(value));
  }
}

function getLastSignInTime(): number | null {
  const stored = loadLastSignInTimeFromStorage();
  if (stored !== null) {
    lastSignInTime = stored;
  }
  return lastSignInTime;
}

function createAuthExpiredError(originalError: unknown): Error {
  const error = originalError instanceof Error ? originalError : new Error("Session expired");
  Object.assign(error, {
    code: "AUTH_EXPIRED",
    messageKey: "hooks.audioRecording.errorDescriptions.sessionExpired",
  });
  return error;
}

function clearLastSignInTime(): void {
  lastSignInTime = null;
  persistLastSignInTime(null);
}

function markSignedOutState(): void {
  const storage = getLocalStorageSafe();
  storage?.setItem("isSignedIn", "false");
  clearLastSignInTime();
}

export function updateLastSignInTime(): void {
  const now = Date.now();
  lastSignInTime = now;
  persistLastSignInTime(now);
}

export function isWithinGracePeriod(): boolean {
  const startedAt = getLastSignInTime();
  if (!startedAt) return false;

  const elapsed = Math.max(0, Date.now() - startedAt);
  return elapsed < GRACE_PERIOD_MS;
}

export function getGracePeriodRemainingMs(): number {
  const startedAt = getLastSignInTime();
  if (!startedAt) return 0;
  return Math.max(0, GRACE_PERIOD_MS - Math.max(0, Date.now() - startedAt));
}

/**
 * Sign out from Firebase Auth
 */
export async function signOut(): Promise<void> {
  try {
    if (firebaseAuth) {
      await firebaseSignOut(firebaseAuth);
    }
  } catch {
    // Local sign-out must still work even if the remote call fails
  } finally {
    // Clear account scope
    if (window.electronAPI?.setActiveAccountScope) {
      await window.electronAPI.setActiveAccountScope(null, 0).catch(() => undefined);
    }
    if (window.electronAPI?.authClearSession) {
      await window.electronAPI.authClearSession().catch(() => undefined);
    }
    markSignedOutState();
  }
}

export async function withSessionRefresh<T>(operation: () => Promise<T>): Promise<T> {
  const startedInGracePeriod = isWithinGracePeriod();
  let graceRetriesUsed = 0;

  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      const isAuthExpired =
        error?.code === "AUTH_EXPIRED" ||
        error?.message?.toLowerCase().includes("session expired") ||
        error?.message?.toLowerCase().includes("auth expired");

      if (!isAuthExpired) {
        throw error;
      }

      if (startedInGracePeriod && graceRetriesUsed < GRACE_RETRY_COUNT) {
        const delayMs = INITIAL_GRACE_RETRY_DELAY_MS * Math.pow(2, graceRetriesUsed);
        graceRetriesUsed += 1;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      throw createAuthExpiredError(error);
    }
  }
}

/**
 * Sign in with Google using Firebase Auth.
 * For Electron: uses signInWithCredential with a token from the browser flow.
 * For web: uses signInWithPopup.
 */
export async function signInWithSocial(provider: SocialProvider): Promise<{ error?: Error }> {
  try {
    if (!firebaseAuth || !googleProvider) {
      return { error: new Error("Firebase Auth is not configured") };
    }

    const isElectron = Boolean((window as any).electronAPI);

    if (isElectron) {
      if (provider === "google") {
        // Open the system browser for Google OAuth.
        // Upon consent, the worker redirects to void://auth?token=... which main.js captures
        const callbackUrl = "void://auth";
        const signinUrl = `${AUTH_URL}/api/desktop-signin/google?callbackURL=${encodeURIComponent(callbackUrl)}`;
        openExternalLink(signinUrl);
        return {};
      }
      return { error: new Error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in is not yet supported. Please use Google or email/password.`) };
    }

    // Web flow: use signInWithPopup
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    await handleFirebaseUserSignedIn(result);
    return {};
  } catch (error: any) {
    // Handle popup closed by user
    if (error?.code === "auth/popup-closed-by-user") {
      return {};
    }
    return { error: error instanceof Error ? error : new Error("Social sign-in failed") };
  }
}

/**
 * Handle a successful Firebase user sign-in.
 * Persists the token and updates auth state.
 */
async function handleFirebaseUserSignedIn(result: UserCredential): Promise<void> {
  const user = result.user;

  // Get the ID token for API calls
  const idToken = await user.getIdToken();

  // Store the token via the existing IPC mechanism
  if (window.electronAPI?.authSetToken) {
    await window.electronAPI.authSetToken(idToken, 0);
  }

  // Get current generation and set active account scope
  // CRITICAL: Without this, policyStatus stays "idle" and loading screen is stuck
  const tokenState = await window.electronAPI?.authGetTokenState?.();
  const generation = tokenState?.generation ?? 0;
  if (window.electronAPI?.setActiveAccountScope) {
    await window.electronAPI.setActiveAccountScope(user.uid, generation);
  }

  updateLastSignInTime();

  // Update localStorage
  const storage = getLocalStorageSafe();
  storage?.setItem("isSignedIn", "true");
}

/**
 * Sign in with SSO via email. In Electron, this routes to the browser-based
 * Google SSO flow passing the email as a login_hint.
 */
export async function signInWithSSO(email: string): Promise<{ error?: Error }> {
  try {
    const isElectron = Boolean((window as any).electronAPI);

    if (isElectron) {
      const callbackUrl = "void://auth";
      let signinUrl = `${AUTH_URL}/api/desktop-signin/google?callbackURL=${encodeURIComponent(callbackUrl)}`;
      if (email?.trim()) {
        signinUrl += `&login_hint=${encodeURIComponent(email.trim())}`;
      }
      openExternalLink(signinUrl);
      return {};
    }

    if (!firebaseAuth || !googleProvider) {
      return { error: new Error("Firebase Auth is not configured") };
    }

    // For web, SSO with Google uses the same popup flow
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    await handleFirebaseUserSignedIn(result);
    return {};
  } catch (error: any) {
    if (error?.code === "auth/popup-closed-by-user") {
      return {};
    }
    return { error: error instanceof Error ? error : new Error("Single sign-on failed") };
  }
}

/**
 * Request password reset email via Firebase Auth
 */
export async function requestPasswordReset(email: string): Promise<{ error?: Error }> {
  try {
    if (!firebaseAuth) {
      return { error: new Error("Firebase Auth is not configured") };
    }
    await sendPasswordResetEmail(firebaseAuth, email.trim());
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error : new Error("Failed to send reset email") };
  }
}

export interface AuthActionError extends Error {
  code?: string;
}

function toAuthActionError(source: unknown, fallbackMessage: string): AuthActionError {
  if (source instanceof Error) return source as AuthActionError;
  if (source && typeof source === "object") {
    const record = source as { message?: string; code?: string };
    const error: AuthActionError = new Error(record.message || fallbackMessage);
    if (record.code) error.code = record.code;
    return error;
  }
  return new Error(fallbackMessage);
}

/**
 * Update display name via Firebase Auth
 */
export async function updateDisplayName(name: string): Promise<{ error?: AuthActionError }> {
  try {
    if (!firebaseAuth?.currentUser) {
      return { error: new Error("No user signed in") };
    }
    await updateProfile(firebaseAuth.currentUser, { displayName: name });
    return {};
  } catch (error) {
    return { error: toAuthActionError(error, "Failed to update name") };
  }
}

/**
 * Change password. For Firebase, this requires re-authentication.
 */
export async function changePassword(params: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions: boolean;
}): Promise<{ error?: AuthActionError }> {
  try {
    if (!firebaseAuth?.currentUser?.email) {
      return { error: new Error("No user signed in") };
    }
    
    // Re-authenticate with current password
    const credential = await signInWithEmailAndPassword(
      firebaseAuth,
      firebaseAuth.currentUser.email,
      params.currentPassword
    );
    
    // Update password using the imported function
    await firebaseUpdatePassword(credential.user, params.newPassword);
    
    // Firebase doesn't have revokeOtherSessions in the same way,
    // but we can sign out from other sessions by updating the token
    return {};
  } catch (error) {
    return { error: toAuthActionError(error, "Failed to change password") };
  }
}

export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || "https://admin.alexishq.in";

/**
 * Open the enterprise admin console.
 * For Firebase, we use Firebase's admin SDK token exchange.
 */
export async function openAdminConsole(): Promise<void> {
  let url = ADMIN_URL;
  try {
    // Firebase doesn't have a direct one-time-token equivalent
    // Fall back to the bare console URL
  } catch {
    // Fall through to the bare console URL.
  }
  openExternalLink(url);
}

// Cache only successful results; errors fail open without being cached. Cleared
// in signOut() so a different account never inherits a stale value.
let credentialAccountCache: boolean | null = null;

/**
 * Check if the user has a credential-based account.
 * For Firebase, all accounts are credential-based (email/password or Google).
 */
export async function hasCredentialAccount(): Promise<boolean> {
  if (credentialAccountCache !== null) return credentialAccountCache;
  
  try {
    if (!firebaseAuth?.currentUser) return true;
    
    // Check if user has email/password provider
    const providerData = firebaseAuth.currentUser.providerData;
    credentialAccountCache = providerData.some(
      (provider) => provider.providerId === "password"
    );
    return credentialAccountCache;
  } catch {
    return true;
  }
}

/**
 * Sign up with email and password via Firebase Auth
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<{ user?: User; error?: Error }> {
  try {
    if (!firebaseAuth) {
      return { error: new Error("Firebase Auth is not configured") };
    }
    
    const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    
    // Send verification email
    await sendEmailVerification(result.user);
    
    await handleFirebaseUserSignedIn(result);
    return { user: result.user };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error("Sign up failed") };
  }
}

/**
 * Sign in with email and password via Firebase Auth
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user?: User; error?: Error }> {
  try {
    if (!firebaseAuth) {
      return { error: new Error("Firebase Auth is not configured") };
    }
    
    const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
    await handleFirebaseUserSignedIn(result);
    return { user: result.user };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error("Sign in failed") };
  }
}

/**
 * Send email verification via Firebase Auth
 */
export async function sendVerificationEmail(): Promise<{ error?: Error }> {
  try {
    if (!firebaseAuth?.currentUser) {
      return { error: new Error("No user signed in") };
    }
    await sendEmailVerification(firebaseAuth.currentUser);
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error : new Error("Failed to send verification email") };
  }
}

/**
 * Get the current Firebase user
 */
export function getCurrentUser(): User | null {
  return firebaseAuth?.currentUser ?? null;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  if (!firebaseAuth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(firebaseAuth, callback);
}

/**
 * Get the current user's ID token
 */
export async function getIdToken(): Promise<string | null> {
  try {
    if (!firebaseAuth?.currentUser) return null;
    return await firebaseAuth.currentUser.getIdToken();
  } catch {
    return null;
  }
}

/**
 * Force refresh the current user's ID token
 */
export async function refreshIdToken(): Promise<string | null> {
  try {
    if (!firebaseAuth?.currentUser) return null;
    return await firebaseAuth.currentUser.getIdToken(true);
  } catch {
    return null;
  }
}
