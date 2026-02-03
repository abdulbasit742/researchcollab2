
# Add WhatsApp Support Number to Sign-Up Page

## Overview
Add a visible WhatsApp support contact link to the authentication page, specifically in the sign-up section, to help users who need assistance during registration. This aligns with the platform's localized support strategy for the Pakistan/South Asia market.

## Design Approach
The WhatsApp support link will be added:
1. Below the "Create Account" button in the sign-up tab
2. Styled subtly but clearly visible with a WhatsApp icon
3. Opens WhatsApp with a pre-filled message indicating the user needs help with sign-up

## Changes Required

### 1. Update AuthPage.tsx
**File:** `src/pages/AuthPage.tsx`

**Modifications:**
- Import the WhatsApp support configuration from `@/config/support`
- Import a phone/message icon from lucide-react (MessageCircle or Phone)
- Add a support link section after the "Create Account" button in the sign-up tab
- The link will use `buildWhatsAppUrl` function with context indicating sign-up help

**New UI Element (after Create Account button):**
```text
Need help signing up?
[WhatsApp Icon] Chat with Support
```

The link will:
- Open in a new tab
- Pre-fill message: "Assalam o Alaikum, I need help with sign-up."
- Include the formatted phone number for visibility: +92 318 178 1454

## Technical Details

### Implementation Steps:
1. Add imports for `supportConfig` and `buildWhatsAppUrl` from support config
2. Add `MessageCircle` or `Phone` icon import from lucide-react
3. Create a helper function or inline the WhatsApp URL with sign-up context
4. Add a styled link/button below the Create Account button
5. Format the phone number nicely for display (e.g., +92 318 178 1454)

### Security Consideration:
- The phone number is publicly visible (as intended for support)
- Uses `noopener,noreferrer` for external links
- No sensitive data is exposed

## Visual Placement
```text
[Create Account Button]

        ---- OR ----

Need help signing up?
📱 WhatsApp: +92 318 178 1454
```

The design will use muted colors to not distract from the main sign-up flow while remaining accessible for those who need help.
