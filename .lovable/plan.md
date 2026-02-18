

# TrustedByMarquee -- Dark Glassmorphism with Institution Logos

## Overview
Replace the light-themed text-only marquee with a dark cinematic glassmorphism section featuring real institution logos, matching the Hero/Testimonials/ProofEngine dark aesthetic.

## What Changes

### 1. Dark Section Background
- Replace default light `py-10` section with dark gradient background: `bg-gradient-to-b from-[#030712] via-[#060e1f] to-[#030712]`
- Add a subtle horizontal divider glow line at top/bottom

### 2. Institution Logos via Clearbit/Logo.dev
Use freely available logo APIs to show real university logos. Each institution entry becomes an object with name, domain, and short abbreviation:

```typescript
const institutions = [
  { name: "MIT", domain: "mit.edu" },
  { name: "Stanford", domain: "stanford.edu" },
  { name: "Oxford", domain: "ox.ac.uk" },
  { name: "ETH Zurich", domain: "ethz.ch" },
  { name: "University of Tokyo", domain: "u-tokyo.ac.jp" },
  { name: "Tsinghua University", domain: "tsinghua.edu.cn" },
  { name: "Cambridge", domain: "cam.ac.uk" },
  { name: "Harvard", domain: "harvard.edu" },
  { name: "NUS", domain: "nus.edu.sg" },
  { name: "Imperial College", domain: "imperial.ac.uk" },
  { name: "University of Melbourne", domain: "unimelb.edu.au" },
  { name: "Sorbonne", domain: "sorbonne-universite.fr" },
];
```

Logos will be fetched from `https://logo.clearbit.com/{domain}` (free, no API key). A fallback to the existing `GraduationCap` icon + initials will be shown if the logo fails to load.

### 3. Glassmorphism Card Styling
Replace current light cards with dark glass pills:
- `bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] hover:border-white/15`
- Logo image: 20x20px rounded with a subtle white ring
- Text: `text-white/60` with `font-medium`
- Slightly larger padding for a more premium feel

### 4. Header Text Update
- Change color from `text-muted-foreground` to `text-white/40`
- Keep the uppercase tracking-widest style
- Add the subtle "Verified Data" dot indicator (green dot) before the text for consistency

### 5. Edge Fade Mask
- Keep the existing `[mask-image:linear-gradient(...)]` horizontal fade but adjust opacity for dark backgrounds

## Technical Details

### File Modified
- `src/components/home/TrustedByMarquee.tsx` -- full rewrite

### No Other Changes Needed
- Marquee CSS animations in `src/index.css` remain unchanged
- No new dependencies required

### Logo Fallback Strategy
Each logo `<img>` gets an `onError` handler that hides the image and shows the `GraduationCap` icon instead, ensuring graceful degradation if Clearbit is unavailable or a domain doesn't have a logo.

### Card Layout (per pill)
```text
+------------------------------------+
| [Logo 20px]  Institution Name      |
+------------------------------------+
```
Dark glass background, white/8 border, subtle hover glow.

