

# LinkedIn-Style Social Posting Integration

## Current State

RCollab already has a comprehensive posting backend:
- **Database tables**: `posts`, `post_likes`, `post_comments`, `post_bookmarks`, `post_shares`, `comment_likes`
- **Components**: `PostComposer`, `FeedPostCard`, `CommentThread`, `ShareModal`, `ReportPostModal`
- **Hooks**: Full CRUD (`useCreatePost`, `useLikePost`, `useBookmarkPost`, `useSharePost`, `useDeletePost`, `useUpdatePost`) with real-time subscriptions

However, the main `/feed` page uses `StructuredUpdateComposer` and `ProfessionalSignalCard` instead of the social posting system. The LinkedIn-like components exist but are not wired into the primary feed experience.

## What We Will Build

### 1. Add "Posts" Tab to Main Feed
Add a fourth tab to the FeedPage alongside Updates, Activity, and Work. This tab will display user-created social posts using the existing `FeedPostCard` component and allow creating posts via `PostComposer`.

### 2. LinkedIn-Style Reactions (Beyond Simple Likes)
Replace the single "Like" button with a reaction picker offering multiple reaction types:
- Like, Celebrate, Support, Insightful, Curious
- Hover/long-press to reveal reaction options (similar to LinkedIn)
- Display reaction summary below posts

### 3. Rich Post Composer Enhancements
Upgrade `PostComposer` with:
- Image/media preview placeholders (UI-ready for future storage)
- Hashtag auto-detection and clickable tags
- Mention users with @ syntax
- Character count indicator
- "Write Article" option for long-form content

### 4. Repost/Share with Commentary
Enhance the share flow:
- "Repost" button that shares to your feed with optional commentary
- Quoted post display inside the repost card
- Share count attribution

### 5. Post Detail Enhancements
- Threaded comment improvements with nested reply indicators
- "Most relevant" vs "Most recent" comment sorting
- Reaction breakdown on post detail page

## Technical Plan

### Files to Create
- `src/components/feed/ReactionPicker.tsx` -- Hover reaction bar (Like, Celebrate, Support, Insightful, Curious)
- `src/components/feed/RepostCard.tsx` -- Quoted repost display component
- `src/components/feed/ArticleComposer.tsx` -- Long-form article editor modal
- `src/components/feed/HashtagLink.tsx` -- Clickable hashtag component
- `src/components/feed/PostContent.tsx` -- Rich content renderer (hashtags, mentions, links)

### Files to Modify
- `src/pages/FeedPage.tsx` -- Add "Posts" tab with PostComposer + FeedPostCard integration using `useFeed` hook
- `src/components/feed/PostComposer.tsx` -- Add hashtag detection, mention UI, character count, article option
- `src/components/feed/FeedPostCard.tsx` -- Replace Like button with ReactionPicker, add Repost display, use PostContent renderer
- `src/hooks/useFeed.ts` -- Add reaction type support to like mutations, add repost detection logic
- `src/components/feed/index.ts` -- Export new components

### Database Migration
- Create `post_reactions` table (post_id, user_id, reaction_type) to replace binary likes with typed reactions
- Add `repost_of` column to `posts` table for quoted reposts
- RLS policies matching existing post security patterns

### No Breaking Changes
- Existing professional signals, reality feed, and outcome feed tabs remain untouched
- The new "Posts" tab is additive
- Current like system gracefully migrates to reactions (Like = default reaction)

