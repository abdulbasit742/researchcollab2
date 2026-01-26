
# Parallax Scrolling Effects Plan

## Overview
Add parallax scrolling effects to the homepage hero section, feature cards, and decorative elements to create enhanced depth perception and a more immersive, premium experience. The parallax effects will make elements move at different speeds relative to scroll position, creating a layered 3D-like visual effect.

---

## What is Parallax Scrolling?
Parallax creates depth by moving background elements slower than foreground elements as the user scrolls. This gives a subtle 3D effect that makes the page feel more dynamic and engaging without being distracting.

---

## Implementation Approach

### Phase 1: Create Parallax Utility Hook

**New File:** `src/hooks/useParallax.ts`

A custom hook that tracks scroll position and calculates parallax offsets:
- Uses `useScroll` and `useTransform` from Framer Motion
- Provides configurable speed multipliers
- Optimized with `requestAnimationFrame` for smooth performance
- Respects `prefers-reduced-motion` for accessibility

---

### Phase 2: Hero Section Enhancements

**File:** `src/components/home/HeroSection.tsx`

| Element | Parallax Effect |
|---------|-----------------|
| Background orbs | Move slower than content (0.3x speed) |
| Floating academic icons | Move at different speeds (0.2x - 0.5x) |
| Hero text content | Subtle upward drift on scroll (0.1x) |
| Search bar | Slightly faster parallax (0.15x) |
| Gradient mesh overlay | Ultra-slow movement (0.1x) for depth |

Visual result: As user scrolls down, background elements appear to "stay behind" while foreground content moves faster, creating layered depth.

---

### Phase 3: Stats Section Parallax

**File:** `src/components/home/StatsSection.tsx`

| Element | Effect |
|---------|--------|
| Background dot pattern | Slow parallax (0.2x) |
| Stat icons | Subtle vertical offset on scroll |
| Numbers/labels | Standard scroll (1x) for readability |

---

### Phase 4: Features Section Enhancements

**File:** `src/components/home/FeaturesSection.tsx`

| Element | Effect |
|---------|--------|
| Feature cards | Staggered parallax - each row at slightly different speed |
| Card icons | Subtle 3D tilt on scroll |
| Background gradient | Very slow parallax for depth |
| Badges | Micro-float effect tied to scroll |

---

### Phase 5: CTA Section

**File:** `src/components/home/CTASection.tsx`

| Element | Effect |
|---------|--------|
| Background blur decorations | Slow parallax movement |
| CTA container | Subtle scale-on-scroll effect |
| Text content | Clean entrance with scroll trigger |

---

### Phase 6: FloatingOrbs Enhancement

**File:** `src/components/decorations/FloatingOrbs.tsx`

Add scroll-based parallax layer on top of existing animations:
- Each orb responds to scroll at different rates based on its size
- Larger orbs move slower (appear farther away)
- Smaller orbs move faster (appear closer)
- Creates true depth layering effect

---

## Technical Implementation Details

### useParallax Hook Structure
```
Features:
- useScrollY: Current scroll position
- useParallaxValue(range, speed): Transform scroll to offset
- useParallaxRotate(range): Subtle rotation on scroll
- Automatic cleanup of event listeners
- SSR-safe (checks for window)
```

### Performance Optimizations
1. Use CSS `transform` and `will-change` for GPU acceleration
2. Debounce scroll calculations where appropriate
3. Use `viewport` intersection observer to only animate visible elements
4. Respect `prefers-reduced-motion` media query
5. Disable parallax on mobile for battery/performance (optional toggle)

### Accessibility Considerations
- Add `@media (prefers-reduced-motion: reduce)` fallbacks
- Keep text content readable (minimal parallax on text)
- Ensure no motion sickness triggers (subtle movements only)

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useParallax.ts` | Parallax scroll utilities hook |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/HeroSection.tsx` | Add parallax to orbs, icons, content layers |
| `src/components/home/StatsSection.tsx` | Background pattern parallax |
| `src/components/home/FeaturesSection.tsx` | Card parallax with stagger |
| `src/components/home/CTASection.tsx` | Background decoration parallax |
| `src/components/decorations/FloatingOrbs.tsx` | Scroll-responsive movement layer |

---

## Visual Depth Layers (Front to Back)

```
Layer 1 (Fastest): UI elements, buttons, text
Layer 2 (Medium): Cards, icons, badges  
Layer 3 (Slow): Floating academic icons
Layer 4 (Slower): Gradient overlays
Layer 5 (Slowest): Background orbs, patterns
```

---

## Expected Result

After implementation:
1. Hero section has distinct depth layers as you scroll
2. Floating icons appear to exist in 3D space
3. Feature cards have subtle movement that adds polish
4. Background decorations create atmospheric depth
5. Overall experience feels more premium and immersive
6. Performance remains smooth (60fps target)
7. Graceful fallback for reduced-motion preference

---

## Mobile Considerations

- Lighter parallax effects on mobile (reduced multipliers)
- Option to disable completely on low-power devices
- Touch scroll works smoothly without jank
- No impact on tap/touch interactions
