

# Next Features Implementation Plan

## Completed Phases Summary

Based on the conversation history, the following has been built:

| Phase | Status | Features |
|-------|--------|----------|
| Phase 1 | Complete | Voice Infrastructure (useVoiceNotes, VoiceRecorder, VoicePlayer, VoiceWaveform) |
| Phase 2 | Complete | Voice Integration (VoiceMessageInput, AudioBioRecorder, AudioBriefingPlayer) |
| Phase 3 | Complete | Ambient & Collective Core (useAmbientIntelligence, useCollectiveIntelligence, ambient-analyzer) |
| Integration | Complete | Routes (/ambient, /collective), Navigation, FloatingNudgeIndicator, Real-time subscriptions |

---

## Phase 4: Advanced Features & Polish

### 4.1 Voice Search Integration

Add voice input capability to the global search system.

**Changes:**
- Create `VoiceSearchButton.tsx` component with microphone icon
- Integrate Web Speech API for speech-to-text
- Connect to existing search functionality
- Add to search bar in Navbar

### 4.2 Notification System Enhancement

Connect Ambient Intelligence to the unified notification engine.

**Changes:**
- Create notification types for ambient insights (opportunity_alert, relationship_decay, deal_risk)
- Add priority-based notification queuing in `useNotifications` hook
- Implement batch digest for low-priority nudges
- Add notification preferences for ambient categories

### 4.3 Deal Room Voice Notes Integration

Add voice messaging capability to active deal rooms.

**Changes:**
- Extend Deal Room message composer with voice recording button
- Store voice notes with deal context association
- Display voice messages in deal thread with waveform visualization
- Connect voice sentiment analysis to Deal Health monitoring

### 4.4 Profile Audio Bio Management

Complete the profile settings UI for managing audio bios.

**Changes:**
- Add "Audio Introduction" section to profile settings page
- Include AudioBioRecorder component with preview
- Show audio bio on public profile view with VoiceBioPlayer
- Add privacy toggle for audio bio visibility

### 4.5 Career Co-pilot Voice Input

Enable voice queries for the AI Career Co-pilot.

**Changes:**
- Add voice input button to Career Co-pilot interface
- Transcribe voice queries and process through co-pilot
- Optional audio response using Web Speech synthesis
- Store voice interaction history for context

### 4.6 Features Showcase Updates

Update the platform features page to highlight new innovation pillars.

**New Sections:**
- Professional Voice Layer (voice notes, audio bios, briefings)
- Ambient Intelligence (proactive insights, deal health, relationship monitoring)
- Collective Intelligence (swarm decisions, prediction markets, due diligence)

### 4.7 Ambient Briefings Center Page

Create a dedicated page for audio briefings.

**Route:** `/briefings`

**Features:**
- List available briefing types (Week Review, Deal Status, Network Pulse)
- Playback interface with AudioBriefingPlayer
- Briefing history and regeneration controls
- Notification preferences for briefing delivery

---

## Technical Implementation Details

### Voice Search (Navbar Integration)
```text
Location: src/components/layout/Navbar.tsx
- Add VoiceSearchButton next to search input
- Use webkitSpeechRecognition API
- Populate search input with transcribed text
- Auto-submit on speech end
```

### Notification Types for Ambient
```text
New notification categories:
- ambient_opportunity: High-match opportunity alerts
- ambient_relationship: Connection decay warnings
- ambient_deal: Deal health risk notifications
- ambient_insight: General proactive insights
```

### Profile Settings Update
```text
Location: src/pages/ProfileSettings.tsx (or similar)
- Add "Audio Introduction" card section
- Include recording, preview, and save workflow
- Display duration and transcript preview
- Toggle for public/private visibility
```

### Briefings Page Structure
```text
File: src/pages/BriefingsPage.tsx

Components:
- BriefingTypeSelector (week_review, deal_status, network_pulse)
- AudioBriefingPlayer (existing component)
- BriefingHistory (list of past briefings with dates)
- BriefingSettings (notification preferences)
```

---

## Implementation Priority Order

| Priority | Feature | Effort |
|----------|---------|--------|
| 1 | Profile Audio Bio Management | Medium |
| 2 | Deal Room Voice Notes | Medium |
| 3 | Briefings Center Page | Low |
| 4 | Notification System Enhancement | Medium |
| 5 | Voice Search Integration | Low |
| 6 | Career Co-pilot Voice Input | Medium |
| 7 | Features Showcase Updates | Low |

---

## New Files to Create

```text
src/components/search/VoiceSearchButton.tsx
src/pages/BriefingsPage.tsx
src/components/briefings/BriefingHistory.tsx
src/components/briefings/BriefingSettings.tsx
src/components/profile/AudioBioSettings.tsx (wrapper for settings page)
```

## Files to Update

```text
src/App.tsx - Add /briefings route
src/components/layout/Navbar.tsx - Voice search button
src/pages/ProfileSettings.tsx - Audio bio section
src/components/admin/AdminSidebar.tsx - Briefings navigation
src/hooks/useNotifications.ts - Ambient notification types
src/pages/FeaturesShowcase.tsx - New feature sections
```

---

## Success Criteria

- Users can record/manage audio bios from profile settings
- Voice notes work seamlessly in deal room conversations
- Briefings page provides easy access to AI-generated audio summaries
- Ambient insights trigger appropriate notifications based on user preferences
- Voice search allows hands-free opportunity and project discovery
- Features showcase accurately represents the platform's innovation pillars

