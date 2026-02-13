

# Stack Support Avatar Above AI Bot Button

## Problem
Both the support avatar (your picture) and the AI assistant button overlap or are mispositioned. You want your support picture to sit **above** the AI bot so visitors see both and can easily contact you.

## Fix

### File: `src/components/support/FloatingSupportChat.tsx`
- Move the support button higher: change `bottom-4` to `bottom-36 md:bottom-22` so it sits above the AI bot button (which is at `bottom-20 md:bottom-6`).
- Keep `right-4 md:right-6` the same so they are vertically aligned.

### File: `src/components/ai/GlobalAIChatButton.tsx`
- No changes needed -- it stays at `bottom-20 md:bottom-6 right-4 md:right-6`.

### Result
On mobile: support pic at ~144px from bottom, AI bot at ~80px, both above the bottom nav bar.
On desktop: support pic at ~88px from bottom, AI bot at ~24px from bottom.
Both buttons stack neatly in the bottom-right corner.

