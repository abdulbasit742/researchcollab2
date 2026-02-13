

# Improved Onboarding Flow

Upgrade the existing 2-step onboarding into a polished 4-step wizard with skill selection, a guided platform walkthrough, and a smoother overall experience.

## What You Get

- A redesigned 4-step onboarding wizard (up from 2 steps) with a polished stepper UI
- Step 1: Personal info (name, role, location, university) -- existing, refined
- Step 2: Academic profile (education level, department, research level) -- existing, refined
- Step 3: Skill selection -- NEW interactive skill picker with category grouping and search
- Step 4: Platform walkthrough -- NEW guided tour showing key features (Earn Hub, Tools, Collaborations, Trust System) with illustrations
- Animated transitions between steps with progress bar
- "Skip" option on optional steps (skills, walkthrough) so users aren't blocked
- Celebration animation on completion (already exists, will keep)
- Saves skills to the user profile

## Changes

### 1. Expand `OnboardingPage.tsx` to 4 steps

Refactor the existing page to support 4 steps with a proper stepper/progress bar:

- **Step 1 (Personal Info)**: Keep existing fields (name, role, location, university). Minor UI polish.
- **Step 2 (Academic Profile)**: Keep existing fields (education level, department, research level, interests). Minor UI polish.
- **Step 3 (Skills)**: New step with categorized skill chips. Categories: Programming, Data & Analytics, Research, Design, Writing, Domain Expertise. Users can pick multiple. Includes a search/filter input. Saves to `profiles.skills` column.
- **Step 4 (Platform Walkthrough)**: 3-4 feature highlight cards users can swipe/click through showing what the platform offers (Earn Hub, AI Tools, Collaboration, Trust System). Each card has an icon, title, and short description. "Get Started" button at the end.

### 2. Create `src/components/onboarding/SkillSelector.tsx`

A reusable component with:
- Categorized skill chips (6 categories, ~8 skills each)
- Search/filter input to find skills quickly
- Visual feedback for selected skills with count badge
- "Select All" per category option

### 3. Create `src/components/onboarding/PlatformWalkthrough.tsx`

A carousel/stepper showing 4 feature cards:
- Earn Hub: "Bid on projects and get paid for your skills"
- AI Research Tools: "Access AI-powered tools for literature review, writing, and analysis"
- Collaboration: "Find and connect with researchers worldwide"
- Trust System: "Build your reputation through verified outcomes"

Each card has an icon, gradient background, title, and description.

### 4. Update progress indicator

Replace the simple 2-dot progress bar with a 4-step stepper showing step labels and completion state.

## Files to Create/Modify

- `src/pages/OnboardingPage.tsx` -- Major refactor (4 steps, stepper UI)
- `src/components/onboarding/SkillSelector.tsx` -- New component
- `src/components/onboarding/PlatformWalkthrough.tsx` -- New component

## Technical Notes

- Skills are saved to the existing `profiles.skills` column (text array) -- no database changes needed
- The walkthrough step doesn't save anything; it's purely informational
- Steps 3 and 4 are skippable so users can complete onboarding quickly if desired
- Uses existing framer-motion animations and shadcn/ui components
- Keeps the existing celebration overlay on completion

