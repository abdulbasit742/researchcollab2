
# Database-Backed Blog System

## Overview
Replace the hardcoded static blog data with a fully dynamic system powered by the existing `blog_posts` database table. Posts will be managed through a new editor page, displayed via slug-based SEO-friendly URLs, and support categories, tags, search, and infinite scroll.

## What Already Exists
- **Database table** `blog_posts` with columns: id, title, slug, excerpt, content, cover_image_url, author_id, category, tags, status, published_at, views_count, created_at, updated_at
- **RLS policies**: Published posts are publicly readable; authors and admins can manage their own posts
- **React hooks** in `src/hooks/useBlog.ts`: `useBlogPosts`, `useBlogPost`, `useFeaturedBlogPosts`, `useBlogCategories`, `useMyBlogDrafts`, `useCreateBlogPost`, `useUpdateBlogPost`, `useDeleteBlogPost`

## Changes

### 1. Rewrite Blog Listing Page (`src/pages/BlogPage.tsx`)
- Remove all hardcoded `blogPosts` and `categories` arrays
- Add state for search input and selected category
- Use `useBlogPosts({ category, search })` with infinite scroll via "Load More" button
- Use `useBlogCategories()` for dynamic category badges
- Use `useFeaturedBlogPosts()` for the featured hero section
- Link to `/blog/{slug}` instead of `/blog/{id}`
- Show loading skeletons and empty states
- Update JSON-LD to use dynamic data

### 2. Rewrite Blog Article Page (`src/pages/BlogArticlePage.tsx`)
- Remove all hardcoded post data
- Use `useBlogPost(slug)` hook which looks up by slug first, then by id
- Render content using `react-markdown` (already installed) instead of `dangerouslySetInnerHTML`
- Add SEOHead with dynamic title, description, and BlogPosting JSON-LD
- Show loading skeleton and 404 state

### 3. Create Blog Editor Page (`src/pages/BlogEditorPage.tsx`)
- Form with fields: title, excerpt, content (textarea), category, tags (comma-separated input), cover image URL, status (draft/published)
- Uses `useCreateBlogPost` and `useUpdateBlogPost` hooks
- If a post ID is in the URL (`/blog/edit/:id`), load and edit that post
- Accessible to authenticated users only
- Add "Write Post" button on BlogPage for logged-in users

### 4. Add Route (`src/App.tsx`)
- Add lazy import for `BlogEditorPage`
- Add routes: `/blog/new` and `/blog/edit/:postId`

### 5. Seed Initial Blog Posts (Database)
- Insert the 6 existing static posts into the `blog_posts` table so the blog isn't empty
- These will use a system/admin author_id or the first available user

## Technical Details

### SEO-Friendly URLs
- Slugs auto-generated from title on creation (already in `useCreateBlogPost`)
- Routes: `/blog` (listing), `/blog/:slug` (article), `/blog/new` (editor), `/blog/edit/:postId` (edit)

### Content Rendering
- Switch from `dangerouslySetInnerHTML` to `react-markdown` for safe rendering
- Content stored as markdown in the database

### Files Modified
| File | Change |
|------|--------|
| `src/pages/BlogPage.tsx` | Replace static data with hooks, add search/category/infinite scroll |
| `src/pages/BlogArticlePage.tsx` | Replace static data with `useBlogPost` hook + markdown rendering |
| `src/pages/BlogEditorPage.tsx` | **New file** - Create/edit blog post form |
| `src/App.tsx` | Add lazy import + routes for blog editor |

### No Database Changes Needed
The `blog_posts` table already has the correct schema and RLS policies.
