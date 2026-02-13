

# Fix Mobile Issues: Bottom Nav, Tour Button, and Lovable Branding

## Issues Identified

### Issue 1: Bottom Navigation Gets Cut Off on Mobile
The `MainLayout` applies `pb-16` (64px) to the main content area, which matches the nav's `h-16`. However, on devices with system navigation bars (Android 3-button nav), the `safe-area-bottom` padding on the nav pushes it up, but the content padding doesn't account for this extra space. Content gets clipped behind the nav bar.

**Fix:** Increase content bottom padding from `pb-16` to `pb-20` (80px) on mobile to provide breathing room for the nav bar plus safe area insets.

### Issue 2: Tour Button Still Appears on /home
The last code change (`location.pathname !== "/"`) should prevent this. The screenshots were taken before that fix was deployed. No additional code change needed -- the fix is already in place.

### Issue 3: Google OAuth Shows "Lovable" Branding
The "to continue to Lovable" text and the Lovable icon on the Google sign-in screen is controlled by the **Google OAuth application name** configured in Google Cloud Console. Since the project uses Lovable Cloud's managed Google OAuth, the app name is set to "Lovable" by default.

**To fix this:** You need to set up your own Google OAuth credentials with your app name ("ResearchCollabPro") in the Google Cloud Console, then configure them in Cloud settings (Users -> Authentication Settings -> Google). This cannot be changed through code.

---

## Code Changes

### File 1: `src/components/layout/MainLayout.tsx`
- Change mobile content padding from `pb-16` to `pb-20` to prevent content from being clipped behind the bottom nav + system navigation bar
- This gives 80px of bottom clearance (16px more than the nav height) to account for safe area insets

### File 2: `src/pages/HomeDashboard.tsx`
- Add `pb-4` bottom padding to the container to ensure the last card on the dashboard isn't partially hidden behind the bottom nav on mobile

---

## About the Google Sign-In Branding
The Lovable icon and name on the Google "Choose an account" screen cannot be removed through code changes. To replace it with your own branding:
1. Create a Google Cloud project at console.cloud.google.com
2. Configure the OAuth consent screen with your app name "ResearchCollabPro" and your logo
3. Create OAuth client credentials (Web Application type)
4. Add the redirect URL from your Cloud authentication settings
5. Enter the Client ID and Secret in Cloud Dashboard -> Users -> Authentication Settings -> Google

