

# Phase 5: Feature Completion & Polish Implementation Plan

## Current State Assessment

Based on exploration, Phase 4 features were partially implemented. This plan completes all remaining integration work and adds the final missing features.

---

## What Needs to Be Done

| Feature | Status | Action Required |
|---------|--------|-----------------|
| Voice Search in Navbar | Component exists, not integrated | Add to Navbar.tsx |
| Profile Settings Page | Missing (link exists, no page) | Create page with AudioBioSettings |
| Deal Room Voice Notes | Not implemented | Add to DealRoomPanel |
| Career Co-pilot Voice Input | Not implemented | Add voice button to ProgressDashboard |
| Voice Notes in Search Results | Not showing | Display voice notes in search |

---

## Implementation Tasks

### 1. Integrate Voice Search into Navbar

Add the VoiceSearchButton component to the navigation bar for hands-free search.

**File:** `src/components/layout/Navbar.tsx`

**Changes:**
- Import `VoiceSearchButton` from `@/components/search`
- Add collapsible search input with voice button
- Connect transcript to search query state
- Navigate to `/search?q=<transcript>` on voice input

### 2. Create Profile Settings Page

A dedicated settings page that links from the Profile page.

**New File:** `src/pages/ProfileSettingsPage.tsx`

**Contents:**
- Audio Introduction section (using existing `AudioBioSettings` component)
- Account settings (email, password change)
- Privacy settings (profile visibility toggles)
- Notification preferences link
- Data export option

**Route:** Add `/profile/settings` to App.tsx

### 3. Add Voice Notes to Deal Room Panel

Enable voice messaging in active deals for richer communication.

**File:** `src/components/deals/DealRoomPanel.tsx`

**Changes:**
- Add message composer section at bottom
- Include `VoiceRecorderTrigger` component
- Display voice notes inline with waveform visualization
- Store with `context_type: "deal_message"` and `context_id: deal_id`

### 4. Add Voice Input to Career Co-pilot

Allow users to ask career questions via voice.

**File:** `src/components/progress/ProgressDashboard.tsx`

**Changes:**
- Add `VoiceSearchButton` next to the text input
- Transcribe voice to text and populate question field
- Auto-submit on speech completion (optional)

### 5. Create Dedicated Career Co-pilot Page

Standalone page for the AI co-pilot experience.

**New File:** `src/pages/CareerPage.tsx`

**Features:**
- Full-screen conversational interface
- Voice input with transcription display
- Chat history with AI responses
- Quick action buttons (analyze trust, get opportunities, failure recovery)
- Integration with existing `useCareerCopilot` hook

**Route:** Add `/career` to App.tsx

### 6. Add Navigation Links

Update sidebar to include new pages.

**File:** `src/components/admin/AdminSidebar.tsx`

**New Links:**
- Career Co-pilot (`/career`) in Platform Features group

---

## Technical Details

### Navbar Voice Search Integration

```text
Structure:
- Collapsible search container (hidden on mobile by default)
- Text input field
- VoiceSearchButton (microphone icon)
- On transcript: set search query + navigate to /search
```

### Profile Settings Page Structure

```text
Tabs or sections:
1. Audio Introduction - AudioBioSettings component
2. Account - Email display, password change button
3. Privacy - Profile visibility, contact preferences
4. Notifications - Link to /settings/notifications
5. Data - Export/download my data option
```

### Deal Room Voice Integration

```text
Bottom composer area:
- Text input for typed messages
- Mic button (VoiceRecorderTrigger)
- Send button
- Display voice notes in message thread with VoicePlayer
```

### Career Co-pilot Voice Input

```text
Copilot tab changes:
- Flex row: Input + VoiceSearchButton + Send button
- onTranscript: setQuestion(transcript)
- Visual indicator when listening
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/ProfileSettingsPage.tsx` | User profile settings with audio bio |
| `src/pages/CareerPage.tsx` | Standalone Career Co-pilot interface |
| `src/components/career/CareerCopilotChat.tsx` | Chat interface for co-pilot |
| `src/components/deals/DealRoomComposer.tsx` | Message composer with voice |

## Files to Update

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/profile/settings` and `/career` routes |
| `src/components/layout/Navbar.tsx` | Add voice search button |
| `src/components/deals/DealRoomPanel.tsx` | Add voice message composer |
| `src/components/progress/ProgressDashboard.tsx` | Add voice input to co-pilot |
| `src/components/admin/AdminSidebar.tsx` | Add Career Co-pilot nav link |

---

## User Experience Flow

### Voice Search
1. User clicks microphone in navbar
2. "Listening..." indicator appears with waveform
3. User speaks: "machine learning researcher"
4. Speech-to-text populates search
5. User is navigated to search results

### Profile Audio Bio
1. User navigates to Profile -> Settings
2. Sees "Audio Introduction" section
3. Can record, preview, and save 30-second intro
4. Toggle visibility on/off

### Deal Voice Messages
1. User is in an active deal room
2. Clicks microphone button in message area
3. Records voice message (up to 5 min)
4. Message appears in thread with waveform
5. Other party can play voice note

### Career Co-pilot Voice
1. User opens Career Dashboard
2. Goes to "AI Co-pilot" tab
3. Clicks microphone next to question input
4. Speaks question: "What should I work on next?"
5. AI responds with personalized advice

---

## Success Criteria

- Voice search accessible from every page via navbar
- Profile settings page fully functional with audio bio management
- Voice notes can be sent and received in deal rooms
- Career co-pilot accepts both voice and text queries
- All new pages accessible via navigation

