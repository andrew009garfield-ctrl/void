# Google OAuth redirect_uri_mismatch — Root Cause & Fix

**Date:** 2026-09-15
**Auth Server:** `https://void-auth.andrew009garfield.workers.dev`
**Google Cloud Project:** `void-auth-app`

---

## Summary of Issues Found

| # | Severity | Issue | File |
|---|----------|-------|------|
| 1 | **CRITICAL** | `redirect_uri` sent to Google includes `?protocol=void` query param that isn't registered in Google Cloud Console | `void/src/lib/auth.ts` + `void-auth/src/index.ts` |
| 2 | **CRITICAL** | Token exchange `redirect_uri` doesn't match the one used in the auth request (missing `?protocol=void`) | `void-auth/src/index.ts` line 104 |
| 3 | **HIGH** | Template literal syntax error — `*** ${tokens.access_token}` is not valid JS | `void-auth/src/index.ts` line 113 |
| 4 | **MEDIUM** | CORS configured with `origin: ["*"]` + `credentials: true` — invalid per CORS spec, browsers reject it | `void-auth/src/index.ts` line 20-23 |
| 5 | **LOW** | `?protocol=void` query param is appended to callback URL but never read by the server (dead code) | `void/src/lib/auth.ts` line 191 |

---

## Issue 1 (PRIMARY): redirect_uri_mismatch

### Root Cause

In `void/src/lib/auth.ts` (line 178-192), the Electron desktop sign-in flow constructs the callback URL as:

```
https://void-auth.andrew009garfield.workers.dev/api/auth/callback/google?protocol=void
```

This full URL (including `?protocol=void`) is passed as `callbackURL` to the auth server.

In `void-auth/src/index.ts` (line 71), the server reads this `callbackURL` and passes it directly to Google as the `redirect_uri` (line 76):

```typescript
authUrl.searchParams.set("redirect_uri", callbackURL);
// callbackURL = "https://void-auth.andrew009garfield.workers.dev/api/auth/callback/google?protocol=void"
```

Google Cloud Console only has the base URL registered **without** the query parameter:

```
https://void-auth.andrew009garfield.workers.dev/api/auth/callback/google
```

Google OAuth performs **exact-match** validation on `redirect_uri`. The mismatch causes the `redirect_uri_mismatch` error.

### Fix — Two changes needed

#### Change A: `void/src/lib/auth.ts` — Remove `?protocol=` from callbackURL

**Line 191**, change:
```typescript
url.searchParams.set("callbackURL", `${DESKTOP_OAUTH_CALLBACK_URL}?protocol=${protocol}`);
```
to:
```typescript
url.searchParams.set("callbackURL", DESKTOP_OAUTH_CALLBACK_URL);
```

The `protocol` parameter is dead code — the server's callback handler (line 143) always redirects to `void://auth?token=${jwt}` regardless of any `protocol` query param. Removing it eliminates the mismatch.

#### Change B: `void-auth/src/index.ts` — Ensure consistent redirect_uri in token exchange

**Line 104**, change:
```typescript
redirect_uri: `${new URL(c.req.url).origin}/api/auth/callback/google`,
```
to:
```typescript
redirect_uri: `${new URL(c.req.url).origin}${new URL(c.req.url).pathname}`,
```

This ensures the `redirect_uri` used in the token exchange exactly matches the `redirect_uri` sent in the initial auth request (Google requires these to be identical). Using `pathname` instead of hardcoding the path handles any future path changes automatically.

---

## Issue 2: Template Literal Syntax Error

### Root Cause

**Line 113** of `void-auth/src/index.ts`:
```typescript
headers: { Authorization: *** ${tokens.access_token}` },
```

The `***` is not valid JavaScript. This should be a backtick template literal with `Bearer` prefix.

### Fix

**Line 113**, change:
```typescript
headers: { Authorization: *** ${tokens.access_token}` },
```
to:
```typescript
headers: { Authorization: `Bearer ${tokens.access_token}` },
```

This is a compilation error — the Worker will fail to deploy until this is fixed.

---

## Issue 3: CORS Misconfiguration

### Root Cause

**Lines 20-23** of `void-auth/src/index.ts`:
```typescript
app.use("*", cors({
  origin: ["*"],
  credentials: true,
}));
```

Per the CORS specification, `Access-Control-Allow-Origin: *` is **incompatible** with `credentials: true`. Browsers will reject the response with:

> The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.

The Electron app sends `credentials: "omit"` (line 18 of `auth.ts`), so this won't block the desktop app. However, any browser-based flow (web dashboard, admin console) will fail.

### Fix

**Lines 20-23**, change:
```typescript
app.use("*", cors({
  origin: ["*"],
  credentials: true,
}));
```
to:
```typescript
app.use("*", cors({
  origin: [
    "https://void-auth.andrew009garfield.workers.dev",
    "https://admin.alexishq.in",
    "https://alexishq.in",
  ],
  credentials: true,
}));
```

Adjust the origin list to match all domains that need credentialed CORS access.

---

## Issue 4: Dead `protocol` Parameter

### Root Cause

In `void/src/lib/auth.ts` (line 189-191), the Electron flow reads a `protocol` value and appends it to the callback URL:

```typescript
const protocol = (await window.electronAPI?.getOAuthProtocol?.()) || "void";
// ...
url.searchParams.set("callbackURL", `${DESKTOP_OAUTH_CALLBACK_URL}?protocol=${protocol}`);
```

But in `void-auth/src/index.ts` (line 143), the callback handler **never reads** this parameter:

```typescript
return c.redirect(`void://auth?token=${jwt}`);
```

The protocol is hardcoded to `void://` regardless. The `?protocol=` query parameter is dead code.

### Fix

This is resolved by Change A in Issue 1 (removing `?protocol=${protocol}` from the callbackURL). No further changes needed.

---

## Google Cloud Console Configuration

### Exact steps to register the redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project **void-auth-app**
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your **OAuth 2.0 Client ID** (the one used by void-auth)
5. Under **Authorized redirect URIs**, add:
   ```
   https://void-auth.andrew009garfield.workers.dev/api/auth/callback/google
   ```
6. Click **Save**

### Verification

After applying the code fixes and registering the URI:

1. Open the Void desktop app
2. Click "Sign in with Google"
3. A browser window should open with the Google consent screen
4. After granting access, the browser should redirect to `void://auth?token=...`
5. The Electron app should pick up the token and complete sign-in

### If testing locally

If you need to test with a local auth server (e.g., `wrangler dev`), you'll also need to add the local redirect URI to Google Cloud Console:

```
http://localhost:8787/api/auth/callback/google
```

---

## All Required Redirect URIs in Google Cloud Console

| URI | Purpose |
|-----|---------|
| `https://void-auth.andrew009garfield.workers.dev/api/auth/callback/google` | Production auth callback |

---

## Deployment Checklist

After applying all code fixes:

1. [ ] Fix syntax error on line 113 (`***` → `` `Bearer ${...}` ``)
2. [ ] Fix `?protocol=` in `void/src/lib/auth.ts` line 191
3. [ ] Fix token exchange redirect_uri in `void-auth/src/index.ts` line 104
4. [ ] Fix CORS origins in `void-auth/src/index.ts` lines 20-23
5. [ ] Register redirect URI in Google Cloud Console
6. [ ] Deploy auth server: `cd void-auth && npx wrangler deploy`
7. [ ] Rebuild app: `cd void && npm run build`
8. [ ] Test Google OAuth end-to-end

---

## Files Modified

| File | Changes |
|------|---------|
| `void/src/lib/auth.ts` | Line 191: Remove `?protocol=${protocol}` from callbackURL |
| `void-auth/src/index.ts` | Line 104: Use `pathname` for consistent redirect_uri in token exchange |
| `void-auth/src/index.ts` | Line 113: Fix template literal syntax (`***` → `` `Bearer ${...}` ``) |
| `void-auth/src/index.ts` | Lines 20-23: Replace `["*"]` CORS origin with specific domains |
