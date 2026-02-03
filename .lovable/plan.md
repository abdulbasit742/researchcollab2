
# Make Blog Cards Clickable & Create Article Detail Pages

## Overview
Currently the Blog page displays static content with non-functional buttons. This plan will make all blog-related elements clickable and create a proper article detail page, enabling users to navigate to and read full blog articles.

## Current Issues Identified
1. Blog cards in the grid are not clickable
2. "Read Article" button on featured post doesn't navigate
3. No article detail page exists (`/blog/:slug` route missing)
4. Using static mock data instead of database

## Changes Required

### 1. Create Blog Article Detail Page
**New File:** `src/pages/BlogArticlePage.tsx`

This page will:
- Use the `useBlogPost` hook to fetch article by slug/id
- Display full article content with:
  - Cover image (hero banner)
  - Title, author, date, read time, category
  - Full article content (HTML/Markdown rendered)
  - Related articles section (optional)
- Handle loading and error states
- Include back navigation to `/blog`

### 2. Update BlogPage.tsx
**File:** `src/pages/BlogPage.tsx`

Modifications:
- Wrap featured post card with `<Link to={`/blog/${post.id}`}>` 
- Make "Read Article" button navigate using `<Link>` or `asChild` pattern
- Wrap each blog card in the grid with clickable link
- Make entire card clickable (image, title, content area)
- Add hover cursor and visual feedback

**Featured Post Section Changes:**
```jsx
<Link to={`/blog/${blogPosts[0].id}`}>
  <Button className="w-fit">
    Read Article
    <ArrowRight className="h-4 w-4" />
  </Button>
</Link>
```

**Grid Card Changes:**
```jsx
<Link to={`/blog/${post.id}`} className="block">
  <Card variant="interactive" className="h-full ...">
    ...
  </Card>
</Link>
```

### 3. Add Route in App.tsx
**File:** `src/App.tsx`

Add new route:
```jsx
import BlogArticlePage from "./pages/BlogArticlePage";

// In Routes:
<Route path="/blog/:slug" element={<BlogArticlePage />} />
```

## Technical Implementation Details

### BlogArticlePage Layout
```text
[Back to Blog button]

[Full-width Cover Image]

[Category Badge]  [Read Time]

# Article Title

By [Author] | [Date] | [Views] views

---

[Full Article Content - rendered HTML/Markdown]

---

[Share buttons (optional)]

[Related Articles Grid (optional)]
```

### Navigation Flow
1. User visits `/blog` - sees all articles
2. User clicks on any article card or "Read Article" button
3. Navigates to `/blog/article-slug-or-id`
4. Article page loads full content
5. User can click "Back to Blog" to return

### Data Handling
For now, the page will work with the static mock data (using post `id`). The `useBlogPost` hook from `useBlog.ts` already supports fetching by slug or ID, so when real database content is added, it will work automatically.

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/BlogArticlePage.tsx` | **Create** - New article detail page |
| `src/pages/BlogPage.tsx` | **Modify** - Add Link wrappers to cards |
| `src/App.tsx` | **Modify** - Add `/blog/:slug` route |

## Success Criteria
- Clicking any blog card navigates to `/blog/:id`
- "Read Article" button navigates correctly
- Article page displays full content
- Back button returns to blog list
- Smooth transitions between pages
