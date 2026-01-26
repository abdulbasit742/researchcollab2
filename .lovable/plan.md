

# Loading Screen with Animated Logo and Progress Bar

## Overview
Create a premium initial loading screen that displays during the first app load, featuring an animated logo, floating orbs background, and a smooth progress bar. This enhances the perceived performance and reinforces the premium academic branding while the app bundles are loading.

---

## Visual Design

The loading screen will feature:
- **Centered animated logo** - "RC" monogram with pulse/glow effect
- **Brand name** - "ResearcherCollab Pro" with gradient text animation
- **Tagline** - Subtle animated text below the logo
- **Progress bar** - Slim, animated gradient progress indicator
- **Floating orbs** - Reusing the existing `FloatingOrbs` component for visual consistency
- **Fade-out transition** - Smooth exit animation when app is ready

---

## Technical Implementation

### 1. Create Loading Screen Component

**File:** `src/components/loading/LoadingScreen.tsx`

Features:
- Full-screen overlay with gradient background matching hero section
- Animated "RC" logo using Framer Motion
- Pulsing glow effect around the logo
- Progress bar component showing loading status
- Floating academic icons (graduation cap, book, flask) for brand consistency
- Smooth fade-out transition when loading completes

```
Logo Animation Sequence:
1. Scale in from 0.5 to 1 with bounce
2. Continuous subtle pulse effect
3. Gradient glow animating around logo
4. Text fades in with stagger after logo appears
```

### 2. Create Loading Progress Hook

**File:** `src/hooks/useAppLoading.ts`

Responsibilities:
- Track app initialization state
- Simulate progress based on time (for visual feedback)
- Detect when React has fully mounted
- Provide loading state and progress value to components

### 3. Update App Entry Point

**File:** `src/App.tsx`

Changes:
- Wrap app with loading screen
- Show loading screen during initial render
- Fade out loading screen once app is ready
- Use Suspense boundaries for lazy-loaded routes (optional enhancement)

### 4. Update index.html (Optional Enhancement)

Add a minimal inline CSS loading state that shows before React loads, ensuring no white flash.

---

## Component Structure

```
LoadingScreen
├── FloatingOrbs (reused)
├── LogoContainer
│   ├── AnimatedLogo ("RC" monogram)
│   ├── GlowEffect (animated gradient glow)
│   └── FloatingIcons (academic icons)
├── BrandText
│   ├── GradientText ("ResearcherCollab Pro")
│   └── Tagline (fade-in)
└── ProgressSection
    ├── ProgressBar (gradient animated)
    └── LoadingText ("Loading..." with dots animation)
```

---

## Animation Timeline

| Time | Animation |
|------|-----------|
| 0ms | Orbs appear, background gradient visible |
| 100ms | Logo scales in with bounce effect |
| 300ms | Glow pulse starts around logo |
| 400ms | Brand name fades in with gradient |
| 600ms | Tagline fades in |
| 800ms | Progress bar starts animating |
| ~1500ms | Progress reaches 100% |
| ~1700ms | Entire screen fades out |
| ~2000ms | App content visible |

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/loading/LoadingScreen.tsx` | Main loading screen component |
| `src/components/loading/AnimatedLogo.tsx` | Animated "RC" logo with glow |
| `src/components/loading/index.ts` | Barrel export |
| `src/hooks/useAppLoading.ts` | Loading state management hook |

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Wrap app with LoadingScreen, manage loading state |
| `src/index.css` | Add keyframes for logo pulse and glow animations |
| `tailwind.config.ts` | Add any new animation utilities |

---

## Technical Details

### AnimatedLogo Component
- Uses SVG or styled div for "RC" monogram
- Primary purple gradient fill
- Framer Motion for entrance animation
- CSS animation for continuous glow pulse
- Matches existing brand colors from CSS variables

### Progress Bar
- Slim design (h-1 or h-1.5)
- Gradient background matching brand
- Smooth width transition
- Shimmer effect overlay for premium feel

### Loading State Management
- Start with `isLoading: true`
- Track progress from 0-100
- Set to complete when:
  - React has mounted all components
  - Minimum display time has elapsed (~1.5s for branding visibility)
- Use `requestAnimationFrame` for smooth progress updates

### Performance Considerations
- Loading screen CSS is inline for instant display
- Minimal JavaScript for initial render
- Lazy load heavy components after initial mount
- Use CSS animations (not JS) where possible

---

## Dark Mode Support

The loading screen will automatically adapt:
- Light mode: Light gradient background with purple accents
- Dark mode: Dark gradient background with brighter purple accents
- Uses existing CSS variables for colors

---

## Expected Result

Users will see:
1. **Instant feedback** - No white flash, loading screen appears immediately
2. **Premium branding** - Animated logo reinforces brand identity
3. **Progress indication** - Users know the app is loading
4. **Smooth transition** - Elegant fade to actual content
5. **Academic aesthetic** - Floating icons and orbs match the platform's studely look

---

## Credit Estimate

| Task | Credits |
|------|---------|
| Create LoadingScreen + AnimatedLogo | 3-4 |
| Create useAppLoading hook | 1-2 |
| Update App.tsx integration | 1-2 |
| Add CSS animations | 1 |
| **Total** | **~6-9 credits** |

