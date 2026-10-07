const fs = require('fs');
const path = 'src/lib/auth.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'import { auth as firebaseAuth, googleProvider, authReady } from "./firebase";',
  'import { auth as firebaseAuth, googleProvider, microsoftProvider, authReady } from "./firebase";'
);

// We need to find the `signInWithSocial` function and update it.
// Here is what it looks like:
/*
    if (!firebaseAuth || !googleProvider) {
      return { error: new Error("Firebase Auth is not configured") };
    }

    const isElectron = Boolean((window as any).electronAPI);

    if (isElectron) {
      if (provider === "google") {
...
      }
      return { error: new Error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in is not yet supported. Please use Google or email/password.`) };
    }

    // Web flow: use signInWithPopup
    const result = await signInWithPopup(firebaseAuth, googleProvider);
*/

const oldAuthChecks = `    if (!firebaseAuth || !googleProvider) {
      return { error: new Error("Firebase Auth is not configured") };
    }`;

const newAuthChecks = `    if (!firebaseAuth || !googleProvider || !microsoftProvider) {
      return { error: new Error("Firebase Auth is not configured") };
    }`;

code = code.replace(oldAuthChecks, newAuthChecks);

const oldElectronFlow = `      if (provider === "google") {
        // Open the system browser for Google OAuth.
        // Upon consent, the worker redirects to void://auth?token=... which main.js captures
        const callbackUrl = "void://auth";
        const signinUrl = \`\${AUTH_URL}/api/desktop-signin/google?callbackURL=\${encodeURIComponent(callbackUrl)}\`;
        openExternalLink(signinUrl);
        return {};
      }
      return { error: new Error(\`\${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in is not yet supported. Please use Google or email/password.\`) };`;

const newElectronFlow = `      if (provider === "google") {
        // Open the system browser for Google OAuth.
        // Upon consent, the worker redirects to void://auth?token=... which main.js captures
        const callbackUrl = "void://auth";
        const signinUrl = \`\${AUTH_URL}/api/desktop-signin/google?callbackURL=\${encodeURIComponent(callbackUrl)}\`;
        openExternalLink(signinUrl);
        return {};
      } else if (provider === "microsoft") {
        const callbackUrl = "void://auth";
        const signinUrl = \`\${AUTH_URL}/api/desktop-signin/microsoft?callbackURL=\${encodeURIComponent(callbackUrl)}\`;
        openExternalLink(signinUrl);
        return {};
      }
      return { error: new Error(\`\${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in is not yet supported. Please use Google, Microsoft, or email/password.\`) };`;

code = code.replace(oldElectronFlow, newElectronFlow);

const oldWebFlow = `    // Web flow: use signInWithPopup
    const result = await signInWithPopup(firebaseAuth, googleProvider);`;

const newWebFlow = `    // Web flow: use signInWithPopup
    const providerInstance = provider === "microsoft" ? microsoftProvider : googleProvider;
    const result = await signInWithPopup(firebaseAuth, providerInstance);`;

code = code.replace(oldWebFlow, newWebFlow);

fs.writeFileSync(path, code);
