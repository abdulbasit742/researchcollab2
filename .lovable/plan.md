

# LinkedIn-Style Pricing Plans + Plan Badge on Profile

## Overview
Rename the pricing tiers to match LinkedIn's familiar naming convention (Career, Business, etc.) and show the user's current subscription plan on their Profile page.

## Changes

### 1. Rename Pricing Plans (LinkedIn-style)

Current names will be updated across both pricing locations:

| Current Name | New Name | Price |
|---|---|---|
| Free | **Basic** (Free) | PKR 0 |
| Student | **Career** | PKR 499/mo |
| Researcher | **Business** | PKR 1,999/mo |

Research tiers stay as-is (Free Researcher, Pro Researcher, Elite Researcher) since they're a separate product category.

### 2. Show Current Plan on Profile Page

Add a "My Plan" card in the profile sidebar (alongside Trust Engine, Work Graph, etc.) showing:
- Current plan name and badge (e.g., "Career" with a gold icon)
- Key limits: bids remaining, AI words used, peer reviews left
- "Upgrade" button linking to `/pricing`

### 3. Store User's Plan in Database

Create a `user_subscriptions` table to track which plan each user is on:
- `user_id`, `plan_name` (basic/career/business), `started_at`, `expires_at`, `is_active`
- Default all existing users to "basic" (free) plan
- RLS: users can read their own subscription

## Files to Change

| File | Action |
|---|---|
| Database | Create `user_subscriptions` table with RLS |
| `src/components/earn/EarnPricingSection.tsx` | Rename plans: Free to Basic, Student to Career, Researcher to Business |
| `src/pages/PricingPage.tsx` | Rename plans + update comparison table headers |
| `src/pages/ProfilePage.tsx` | Add "My Plan" card in sidebar showing current plan + usage + upgrade CTA |
| `src/hooks/useUserSubscription.ts` | New hook to fetch user's current plan from `user_subscriptions` |
| `src/components/profile/MyPlanCard.tsx` | New component: plan badge, usage stats, upgrade button |

## Technical Details

### user_subscriptions table
```text
id           UUID PRIMARY KEY
user_id      UUID REFERENCES profiles(id)
plan_name    TEXT DEFAULT 'basic'  -- basic | career | business
started_at   TIMESTAMPTZ DEFAULT now()
expires_at   TIMESTAMPTZ NULL
is_active    BOOLEAN DEFAULT true
created_at   TIMESTAMPTZ DEFAULT now()
```

RLS: Users can SELECT their own rows. Only backend/admin can INSERT/UPDATE.

### MyPlanCard component
Displays in the profile sidebar:
- Plan icon (crown for Business, briefcase for Career, user for Basic)
- Plan name with colored badge
- Usage meters: bids used, AI words used, peer reviews used (placeholder values for now)
- "Upgrade Plan" or "Manage Plan" button linking to `/pricing`

