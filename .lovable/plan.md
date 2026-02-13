

# Add Pricing Section to Earn Page

Add an eye-catching pricing section directly on the Earn page so users can see available plans without navigating away.

## What You Get

- A new "Pricing Plans" section embedded at the bottom of the Earn page (below the main tabs content)
- Shows the 3 individual plans (Free, Student, Researcher) as styled cards with feature lists
- Highlights the "Student" plan as most popular
- "View All Plans" link to the full `/pricing` page for tool bundles and enterprise options
- Responsive grid: 1 column on mobile, 3 on desktop
- Smooth scroll-in animation using framer-motion

## Changes

### 1. Create `src/components/earn/EarnPricingSection.tsx` (New)

A self-contained component displaying the 3 individual pricing tiers:
- Free (PKR 0/mo) -- outline card
- Student (PKR 499/mo) -- highlighted as popular with gradient border
- Researcher (PKR 1,999/mo) -- standard card

Each card shows: plan name, price, description, feature checklist, and CTA button linking to `/pricing` or signup.

### 2. Edit `src/pages/EarnPage.tsx`

Import and render `EarnPricingSection` after the closing `</Tabs>` element, before the `PostProjectModal`.

## Files

| File | Action |
|------|--------|
| `src/components/earn/EarnPricingSection.tsx` | Create |
| `src/pages/EarnPage.tsx` | Edit (add import + render) |

