
# Add "My Projects" Tab to Earn Page

## Overview
Add a new "My Projects" tab to the EarnPage that allows users to view and manage all projects they have posted. This includes options to view bids received, edit project details, and close/reopen projects.

---

## Implementation Details

### 1. Create New Hook: useMyProjects

Create a hook in `src/hooks/useEarning.ts` to fetch projects owned by the current user:

```typescript
export function useMyProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<EarningProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects where owner_id = user.id
  // Include bid_count for each project
  // Allow updating project status
}
```

**Hook Features:**
- Fetch all projects owned by current user (any status: open, closed, in_progress)
- Include bid count for each project
- Provide `updateProjectStatus(id, status)` function
- Provide `deleteProject(id)` function

### 2. Create EditProjectModal Component

Create `src/components/earn/EditProjectModal.tsx` for editing existing projects:

- Reuse the same form structure as PostProjectModal
- Pre-populate form with existing project data
- Add ability to change project status (open/closed)
- Use `useUpdateProject` hook for saving changes

### 3. Update EarnPage.tsx

**Add New Tab:**
- Add "My Projects" tab next to "My Bids" in the TabsList
- Show project cards with management controls

**Tab Content Features:**
- List all user's posted projects (not just open ones)
- Show project status badge (open/closed/in_progress)
- Show number of bids received on each project
- Action buttons: View Bids, Edit, Close/Reopen

**Empty State:**
- Show friendly message when user has no projects
- CTA button to post first project

**Authentication Gate:**
- Require login to view (same pattern as "My Bids" tab)

### 4. Add Project Management Functions to Hook

Extend `src/hooks/useEarning.ts` with:

```typescript
export function useUpdateProject() {
  // Update project details (title, description, budget, deadline, tags)
  // Returns { updateProject, updating }
}

export function useDeleteProject() {
  // Delete a project (or mark as deleted)
  // Returns { deleteProject, deleting }
}

export function useUpdateProjectStatus() {
  // Change project status (open, closed, in_progress)
  // Returns { updateStatus, updating }
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useEarning.ts` | Add `useMyProjects`, `useUpdateProject`, `useUpdateProjectStatus` hooks |
| `src/pages/EarnPage.tsx` | Add "My Projects" tab with management UI |
| `src/components/earn/EditProjectModal.tsx` | New component for editing projects |

---

## UI Design for My Projects Tab

### Project Card Layout
```
+----------------------------------------------------------+
| [Title]                                    [Status Badge] |
| Posted 2 days ago                                         |
|----------------------------------------------------------|
| Budget: PKR 15,000 - 25,000        Deadline: 14 days     |
| Bids: 5 received                                          |
|----------------------------------------------------------|
| [View Bids]  [Edit]  [Close Project]                      |
+----------------------------------------------------------+
```

### Status Colors
- **Open**: Green badge
- **In Progress**: Blue badge  
- **Closed**: Gray badge
- **Completed**: Purple badge

### Action Buttons
- **View Bids**: Navigate to project detail page (existing)
- **Edit**: Opens EditProjectModal
- **Close/Reopen**: Toggle project status

---

## Database Considerations

The `earning_projects` table already has:
- `owner_id` - to filter by current user
- `status` - supports 'open', 'closed', 'in_progress'
- RLS policy: "Owners can update their projects"
- RLS policy: "Owners can delete their projects"

No database migrations needed.

---

## Technical Implementation

### useMyProjects Hook
```typescript
export function useMyProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<EarningProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchMyProjects();
    else { setProjects([]); setLoading(false); }
  }, [user]);

  const fetchMyProjects = async () => {
    // Query: SELECT * FROM earning_projects WHERE owner_id = user.id
    // For each project, get bid count
    // Order by created_at DESC
  };

  return { projects, loading, refetch: fetchMyProjects };
}
```

### EditProjectModal Props
```typescript
interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: EarningProject | null;
  onSuccess?: () => void;
}
```

### Tab Integration in EarnPage
```tsx
<TabsTrigger value="my-projects" className="whitespace-nowrap">
  My Projects
</TabsTrigger>

<TabsContent value="my-projects">
  {!user ? <SignInPrompt /> : 
   projectsLoading ? <ProjectListSkeleton /> :
   myProjects.length === 0 ? <EmptyState /> :
   <ProjectManagementList projects={myProjects} />
  }
</TabsContent>
```

---

## Loading & Empty States

### Loading
- Reuse `ProjectListSkeleton` component (already exists)

### Empty State (No Projects Posted)
- Icon: FolderOpen or Briefcase
- Title: "No Projects Posted Yet"
- Subtitle: "Post your first project to find talented freelancers"
- CTA: "Post a Project" button (opens modal)

### Unauthenticated State
- Same pattern as "My Bids" tab
- Prompt to sign in/create account

---

## Benefits

1. **Self-Service Management**: Users can manage their projects without admin help
2. **Complete Visibility**: See all projects in one place with bid counts
3. **Quick Actions**: Edit, close, or reopen projects easily
4. **Consistent UX**: Follows existing tab pattern on EarnPage
5. **No New Pages**: All functionality contained in existing page structure

---

## Testing Checklist

After implementation:
- [ ] My Projects tab appears in EarnPage tabs
- [ ] Tab shows "Sign in to view" for unauthenticated users
- [ ] Empty state shows when user has no projects
- [ ] User's projects are fetched and displayed correctly
- [ ] Bid count is accurate for each project
- [ ] Status badges show correct color
- [ ] Edit button opens EditProjectModal with pre-filled data
- [ ] Close/Reopen button toggles project status
- [ ] View Bids navigates to project detail page
- [ ] Changes persist after page refresh
- [ ] All amounts display in PKR format
