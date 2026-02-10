

# Add Testimonials and "Why Choose Us" Sections to Landing Page

## Overview
Add two new sections to the landing page: a **Testimonials** section with researcher/student quotes and a **"Why Choose ResearchCollabPro"** section highlighting key differentiators. Both sections will follow the existing design patterns (framer-motion animations, parallax effects, card variants, responsive layout).

## What Gets Built

### 1. "Why Choose ResearchCollabPro" Section
A visually distinct section with 4-6 compelling reasons to choose the platform, presented as icon-driven cards with concise copy. Positioned between the FeaturesSection and TestimonialsSection.

Reasons include:
- **Verified Trust System** -- Every collaborator is scored on real outcomes, not self-reported claims
- **Escrow-Protected Payments** -- Funds are locked until deliverables are verified
- **AI-Powered Research Tools** -- Built-in AI for summarization, analysis, and literature review
- **Global Researcher Network** -- Connect with academics across disciplines and borders
- **No Vanity Metrics** -- Every statistic reflects actual platform activity
- **Institutional-Grade Security** -- Enterprise-level encryption and access controls

### 2. Testimonials Section
A carousel or grid of 6 testimonials from different user personas (PhD student, postdoc, professor, independent researcher, industry collaborator, undergraduate). Each testimonial card shows:
- Quote text
- Name, role, and institution
- Avatar placeholder (initials-based)
- Star rating or a highlight badge (e.g., "Verified User")

Uses sample data (clearly representative, not deceptive -- personas reflect real use cases).

## Technical Details

### New Files
- **`src/components/home/WhyChooseSection.tsx`** -- "Why Choose" section with icon cards, motion animations, and parallax consistent with existing sections
- **`src/components/home/TestimonialsSection.tsx`** -- Testimonials grid/carousel with avatar, quote, and role display

### Modified Files
- **`src/pages/Index.tsx`** -- Import and place both sections between `FeaturesSection` and `CTASection`
- **`src/components/home/index.ts`** -- Export new components

### Design Patterns
- Uses existing `Card` component variants (`premium`, `glass`)
- Framer Motion `whileInView` animations with stagger
- `useParallax` hook for subtle scroll effects
- Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop
- Consistent with existing `StatsSection` and `FeaturesSection` styling

### Page Order After Changes
1. HeroSection
2. StatsSection
3. FeaturesSection
4. **WhyChooseSection (new)**
5. **TestimonialsSection (new)**
6. CTASection

### No Database Changes
Both sections use static/sample data. No backend modifications needed.

### Build Order
1. Create `WhyChooseSection.tsx`
2. Create `TestimonialsSection.tsx`
3. Update `Index.tsx` to include both sections
4. Update `src/components/home/index.ts` exports

