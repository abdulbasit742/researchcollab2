
# Fix Build Errors in OrganizationMembersPage.tsx

The build errors are pre-existing bugs where the page template uses wrong property names and missing imports. This is a quick fix -- not a new feature.

---

## Root Cause

The `OrgMember` interface (from `src/data/organizations.ts`) uses camelCase property names, but the table rendering code uses snake_case. Additionally, Avatar components are used but never imported.

## Changes (1 file)

**`src/pages/OrganizationMembersPage.tsx`**

1. Add missing import for `Avatar`, `AvatarImage`, `AvatarFallback` from `@/components/ui/avatar`.
2. Fix property references in the table rows:
   - `member.avatar_url` to `member.userName` (no avatar_url exists; use fallback only)
   - `member.email` to `member.userEmail`
   - `member.tool_access` (3 occurrences) to `member.toolAccess`
   - `member.created_at` to `member.joinedAt`
