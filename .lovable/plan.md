

# Accessibility Audit and Fixes

## Summary of Findings

After auditing the codebase, here are the key accessibility issues and the fixes planned across 5 areas.

---

## 1. Skip Navigation Link (Missing)

There is no "Skip to main content" link anywhere in the app. Keyboard and screen reader users must tab through the entire navbar on every page.

**Fix:** Add a visually-hidden skip link at the top of `MainLayout` that becomes visible on focus, jumping to `<main>`.

---

## 2. Reduced Motion Support (Incomplete)

The app has many framer-motion animations, marquees, floating orbs, typewriter effects, and CSS animations. The `useAccessibility` hook adds a `reduce-motion` class but there is no corresponding CSS rule. The native `prefers-reduced-motion` media query is only used in `App.css` for an unused logo spin.

**Fix:**
- Add a global `@media (prefers-reduced-motion: reduce)` rule in `index.css` that disables all CSS animations and transitions.
- Add a `.reduce-motion` class rule that does the same (for the user-preference toggle).

---

## 3. Color Contrast Issues

- `muted-foreground` in light mode is `hsl(240, 5%, 45%)` on `hsl(0, 0%, 100%)` background -- contrast ratio is approximately 4.2:1, which passes AA for normal text but fails for the `text-[10px]` and `text-xs` sizes used in badges, bottom nav labels, and stat labels (small text needs 4.5:1).
- The `text-gradient` utility uses `background-clip: text` which can cause issues for high-contrast mode users as the gradient becomes invisible.

**Fix:**
- Bump `--muted-foreground` slightly darker to `hsl(240, 5%, 40%)` in light mode to safely clear 4.5:1.
- Add a `forced-colors` media query fallback for `text-gradient` so it renders as solid color in Windows High Contrast Mode.

---

## 4. Missing ARIA Labels and Semantic Landmarks

- **Search form in HeroSection**: No `aria-label` on the form or inputs.
- **Mobile menu toggle**: Has `aria-label` but missing `aria-expanded`.
- **MobileBottomNav**: `<nav>` has no `aria-label` to distinguish it from the main nav.
- **Footer**: `<footer>` exists but the nav sections inside lack `role="navigation"` or `aria-label`.
- **Icon-only buttons**: The sign-out button in the navbar has no text or `aria-label`.
- **Live Activity Feed area**: No `aria-live` region for dynamic content.

**Fix:** Add appropriate ARIA attributes across these components.

---

## 5. Focus Management

- Interactive cards using `card-hover` or `interactive` variant have no keyboard focus styles.
- The `<main>` element has no `id` for skip-link targeting.
- Nav links in the mobile bottom nav lack visible focus indicators.

**Fix:**
- Add `focus-visible:ring-2 focus-visible:ring-ring` to interactive card variants.
- Add `id="main-content"` and `tabIndex={-1}` to `<main>`.
- Add focus-visible styles to MobileBottomNav links.

---

## Technical Details

### Files to modify:

| File | Changes |
|------|---------|
| `src/index.css` | Add `prefers-reduced-motion` media query, `.reduce-motion` rules, `forced-colors` fallback for text-gradient, adjust `--muted-foreground` |
| `src/components/layout/MainLayout.tsx` | Add skip-nav link, add `id` and `tabIndex` to `<main>` |
| `src/components/layout/Navbar.tsx` | Add `aria-expanded` to mobile menu toggle, add `aria-label` to sign-out button |
| `src/components/layout/MobileBottomNav.tsx` | Add `aria-label` to `<nav>`, add focus-visible styles to links |
| `src/components/layout/Footer.tsx` | Add `aria-label` to newsletter form |
| `src/components/home/HeroSection.tsx` | Add `aria-label` to search form, add `sr-only` label to search input |
| `src/components/ui/card.tsx` | Add focus-visible ring to `interactive` variant |

### Estimated scope: ~7 files, small targeted changes each.

