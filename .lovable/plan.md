
# Add JSON-LD Structured Data to Key Pages

## Overview
Add rich structured data to 4 pages so search engines can display enhanced results (pricing tables, product listings, blog carousels, organization info).

## Changes Per Page

### 1. Pricing Page (`src/pages/PricingPage.tsx`)
- Schema type: **Product** with multiple **Offer** entries
- Include plan names, prices, currency (PKR), and descriptions
- Pass via `jsonLd` prop on the existing `SEOHead` component

### 2. Tools Page (`src/pages/ToolsPage.tsx`)
- Schema type: **ItemList** containing **SoftwareApplication** entries
- Include tool names, descriptions, ratings, review counts, and prices
- Data sourced from the existing `tools` array import

### 3. About Page (`src/pages/AboutPage.tsx`)
- Schema type: **Organization** with expanded details
- Include name, description, URL, founding info, and team member references
- Data sourced from the existing `teamMembers` array

### 4. Blog Page (`src/pages/BlogPage.tsx`)
- Schema type: **Blog** with **BlogPosting** entries
- Include post titles, authors, dates, excerpts, and images
- Data sourced from the existing `blogPosts` array

## Technical Details

All 4 pages already use `SEOHead` which accepts a `jsonLd` prop. The implementation simply involves defining the JSON-LD object inline and passing it to the existing prop -- no new components or dependencies needed.

### Example structure (Pricing):
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "ResearchCollabPro Plans",
  "offers": [
    { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "PKR" },
    { "@type": "Offer", "name": "Pro", "price": "2499", "priceCurrency": "PKR" }
  ]
}
```

### Example structure (Tools - ItemList):
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "SoftwareApplication",
      "name": "ChatGPT 5.3",
      "aggregateRating": { "ratingValue": 4.9, "reviewCount": 2450 }
    }
  ]
}
```

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/PricingPage.tsx` | Add `jsonLd` prop to SEOHead |
| `src/pages/ToolsPage.tsx` | Add `jsonLd` prop to SEOHead |
| `src/pages/AboutPage.tsx` | Add `jsonLd` prop to SEOHead |
| `src/pages/BlogPage.tsx` | Add `jsonLd` prop to SEOHead |

No new files or dependencies required.
