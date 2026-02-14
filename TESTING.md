# Testing Instructions

This guide explains how to run and manually verify the features of the modern Soundscape Creator application.

## 1. Starting the Application

The application requires both a backend server (for API/Sound handling) and a frontend development server.

### Prerequisites
- Node.js installed

### Start Backend
Open a terminal and run:
```bash
cd backend
npm install
npm start
```
*The backend runs on http://localhost:3001.*

### Start Frontend
Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev
```
*The frontend runs on http://localhost:5173 (or similar).*

## 2. Manual Verification Checklist

Open the application in your browser (usually `http://localhost:5173`).

### A. Visual & UI Inspection
- [ ] **Initial Load:** Verify the background is dark with a subtle "glass" effect on cards.
- [ ] **Animations:** Observe the background particles moving slowly.
- [ ] **Responsiveness:** Resize the window; verify sound cards and controls adjust nicely.

### B. Core Audio Playback
- [ ] **Play Sound:** Click on a sound card (e.g., "Rain").
    - *Expected:* The sound starts playing, the card glows, and the waveform animation appears.
- [ ] **Volume:** Drag the slider on the "Rain" card.
    - *Expected:* The volume of the rain sound changes.
- [ ] **Mute:** Click the speaker icon on the "Rain" card.
    - *Expected:* The sound mutes (icon changes/turns red), but playback continues.
- [ ] **Master Volume:** Drag the slider at the top.
    - *Expected:* All active sounds change volume proportionally.
- [ ] **Stop All:** Click the "Stop All" button.
    - *Expected:* All sounds stop playing immediately.

### C. Mix Saving Feature (New)
1. **Create a Mix:**
   - Play "Forest" (50%) and "River" (30%).
   - Scroll down to "My Mixes".
   - Type "Nature Relax" in the input box.
   - Click the "Save" (disk) icon.
   - *Expected:* "Nature Relax" appears in the list below.
2. **Reset:**
   - Click "Stop All".
   - Change volumes randomly.
3. **Load Mix:**
   - Click on the "Nature Relax" chip in the "My Mixes" section.
   - *Expected:* "Forest" and "River" start playing at the saved volumes (50% and 30%).
4. **Delete Mix:**
   - Click the "x" next to "Nature Relax".
   - *Expected:* The mix is removed from the list.

### D. Sleep Timer (New)
1. Play any sound.
2. Click the **Timer** button in the header.
3. Select **15 min** (or wait for 15 minutes, or check code logic).
    - *Verification:* The timer logic will fade out and stop audio after the duration. *For quick testing, you can modify `SLEEP_TIMER_ durations` in `frontend/src/context/SoundContext.jsx` to 10 seconds.*

### E. Theme Switching
- [ ] Click the **Water** (blue waves) icon at the top.
    - *Expected:* Background changes to blue/teal gradients.
- [ ] Click the **Horror** (ghost) icon.
    - *Expected:* Background becomes dark red/black.
- [ ] Click the **Default** (sun/gear) icon to return.

## 3. Troubleshooting
- If no sound plays, check if the browser tab is muted or if `howler.js` loaded correctly (check console for errors).
- If mixes don't save, check if "Local Storage" is enabled in your browser settings.
