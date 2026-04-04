# 🚀 Arabic App Rebuild - Session Handoff Document

**Date:** April 4, 2026  
**Session Progress:** Batches 1-3 Complete, Batch 4 Started (2/13 files done)  
**Tokens Used:** ~76% (started at 24%)  
**Status:** Ready to continue in new chat

---

## ✅ WHAT'S BEEN BUILT

### Batch 1: Core Infrastructure (5 files) ✅ COMPLETE
- `/js/config.js` (29 lines) - All configuration constants
- `/js/database.js` (297 lines) - All Supabase operations including Stage B & C functions
- `/js/api.js` (140 lines) - Claude API calls via Edge Function
- `/js/storage.js` (48 lines) - localStorage wrapper
- `/js/state.js` (216 lines) - Global state management

**Status:** Tested and working. Database save shows "pending" (expected - RLS enabled).

### Batch 2: Data Layer (5 files) ✅ COMPLETE
- `/js/data/units.js` (3 units, 37 phrases) - Standard course content
- `/js/data/aya-course.js` (5 units, 74 phrases, 9 phonics, 3 cultural cards, 4 Marwan notes) - Aya's bespoke course
- `/js/data/alphabet.js` (28 letters) - Complete Arabic alphabet
- `/js/data/placement.js` (5 levels, 160 questions) - Placement test
- `/js/data/focused-contexts.js` (6 contexts) - **Stage B** situational phrase banks

**Status:** Pure data files, no testing needed.

### Batch 3: Utilities (4 files) ✅ COMPLETE
- `/js/utils/audio.js` (45 lines) - Web Speech API wrapper (can swap for ElevenLabs later)
- `/js/utils/rtl.js` (50 lines) - RTL text handling
- `/js/utils/date.js` (45 lines) - June 5 countdown for Aya
- `/js/utils/ui.js` (105 lines) - Error, toast, loading utilities

**Status:** Simple utility functions, ready to use.

### Batch 4: Wire Features (2/13 files) ⏸️ IN PROGRESS
**Completed:**
- `/js/auth.js` (120 lines) - ✅ Wired to state, database, config
- `/js/onboarding.js` (320 lines) - ✅ Wired to state, saves profile

**Still Need to Build:**
1. `home.js` - Update to use UNITS/AYA_UNITS data
2. `lesson.js` - Update to use data + state
3. `quiz.js` - Update to use data + state
4. `flashcards.js` - Update to use state
5. `vocab.js` - Update to use state
6. `alphabet.js` → rename to `alphabet-screen.js` - Update to use ALPHABET_DATA
7. `placement.js` → rename to `placement-screen.js` - Update to use PLACEMENT_LEVELS
8. `aya.js` - Update to use AYA_UNITS, PHONICS_DATA, CULTURAL_CARDS, MARWAN_NOTES
9. `push.js` - CREATE NEW (push notification setup)
10. **`focused-study.js`** - CREATE NEW (**Stage B**)
11. **`my-vocab.js`** - CREATE NEW (**Stage C**)

---

## 📊 TOKEN BUDGET

**This Session:**
- Started: 24% used (~120K tokens)
- Ended: ~76% used (~380K tokens)
- **Used:** ~260K tokens

**Next Session (Fresh):**
- Will have: ~500K tokens
- Need: ~80K to finish Batch 4
- **Plenty of room** for debugging and testing

---

## 🎯 WHAT TO BUILD NEXT (Batch 4 Continued)

### Priority Order:
1. **home.js** - Main screen, needs UNITS/AYA_UNITS
2. **lesson.js** - Phrase learning, needs data
3. **quiz.js** - Practice mode
4. **flashcards.js** - Spaced repetition
5. **vocab.js** - Vocabulary browser
6. **alphabet-screen.js** (rename from alphabet.js)
7. **placement-screen.js** (rename from placement.js)
8. **aya.js** - Aya's special screens
9. **push.js** - NEW: Push notification setup
10. **focused-study.js** - NEW: Stage B contextual study
11. **my-vocab.js** - NEW: Stage C personal vocabulary

### Key Changes for Each File:

**home.js:**
```javascript
import { AppState } from './state.js';
import { UNITS } from './data/units.js';
import { AYA_UNITS } from './data/aya-course.js';
import { daysUntilJune5, getCountdownMessage } from './utils/date.js';

// Use AppState.isAya to determine which units to show
const units = AppState.isAya ? AYA_UNITS : UNITS;
```

**lesson.js / quiz.js:**
```javascript
import { AppState, save } from './state.js';
import { speakArabic } from './utils/audio.js';
import { handleInputDirection } from './utils/rtl.js';
```

**alphabet-screen.js:**
```javascript
import { ALPHABET_DATA } from './data/alphabet.js';
// Rename file to avoid collision with data/alphabet.js
```

**placement-screen.js:**
```javascript
import { PLACEMENT_LEVELS } from './data/placement.js';
import { evaluatePlacement } from './api.js';
// Rename file to avoid collision with data/placement.js
```

**aya.js:**
```javascript
import { AYA_UNITS, PHONICS_DATA, CULTURAL_CARDS, MARWAN_NOTES } from './data/aya-course.js';
import { daysUntilJune5, getCountdownMessage } from './utils/date.js';
```

**focused-study.js** (NEW - Stage B):
```javascript
import { AppState, save } from './state.js';
import { FOCUSED_CONTEXTS } from './data/focused-contexts.js';
import { saveFocusedSession, loadFocusedSessions } from './database.js';
import { speakArabic } from './utils/audio.js';

export function renderFocusedStudyScreen(container) {
  // Show context grid
}

export function renderFocusedSession(container, contextId) {
  // Flashcard-style study for selected context
}
```

**my-vocab.js** (NEW - Stage C):
```javascript
import { AppState, save } from './state.js';
import { savePersonalVocab, loadPersonalVocab, toggleVocabPoolOptIn } from './database.js';
import { speakArabic } from './utils/audio.js';
import { showError, showToast } from './utils/ui.js';

export function renderMyVocabScreen(container) {
  // List/study mode toggle
}

export function renderVocabAddScreen(container) {
  // Add new words form
}
```

**push.js** (NEW):
```javascript
import { AppState } from './state.js';
import { savePushSubscription } from './database.js';
import { VAPID_PUBLIC_KEY } from './config.js';

export function renderPushPromptScreen(container) {
  // Push notification setup
}
```

---

## 🔑 KEY ARCHITECTURE PRINCIPLES

1. **One-way dependency flow:** config → database → state → features
2. **No circular dependencies:** Use dynamic imports for router (`import('./router.js')`)
3. **All state changes go through state.js:** Never mutate AppState directly in features
4. **Always call `save()` after state changes:** Persists to both Supabase and localStorage
5. **Event listeners, not inline onclick:** Use `addEventListener()` instead of `onclick="..."` attributes

---

## 📁 FILE ORGANIZATION (Final Structure)

```
js/
├── config.js                 ✅ DONE
├── database.js               ✅ DONE
├── api.js                    ✅ DONE
├── storage.js                ✅ DONE
├── state.js                  ✅ DONE
├── data/
│   ├── units.js              ✅ DONE
│   ├── aya-course.js         ✅ DONE
│   ├── alphabet.js           ✅ DONE
│   ├── placement.js          ✅ DONE
│   └── focused-contexts.js   ✅ DONE (Stage B)
├── utils/
│   ├── audio.js              ✅ DONE
│   ├── rtl.js                ✅ DONE
│   ├── date.js               ✅ DONE
│   └── ui.js                 ✅ DONE
├── auth.js                   ✅ DONE
├── onboarding.js             ✅ DONE
├── home.js                   ⏳ TODO
├── lesson.js                 ⏳ TODO
├── quiz.js                   ⏳ TODO
├── flashcards.js             ⏳ TODO
├── vocab.js                  ⏳ TODO
├── alphabet-screen.js        ⏳ TODO (rename from alphabet.js)
├── placement-screen.js       ⏳ TODO (rename from placement.js)
├── aya.js                    ⏳ TODO
├── push.js                   ⏳ TODO (NEW)
├── focused-study.js          ⏳ TODO (NEW - Stage B)
├── my-vocab.js               ⏳ TODO (NEW - Stage C)
├── router.js                 ⏳ Batch 5
└── app.js                    ⏳ Batch 5
```

---

## 🚨 IMPORTANT NOTES FOR NEXT SESSION

### Testing Strategy:
1. **Don't test until Batch 4 is complete** - Files depend on each other
2. **When testing:** Use `test-batch-1-no-server.html` as template
3. **Expected issues:** RLS errors (normal), router not ready (Batch 5)

### Common Patterns to Use:

**Import pattern:**
```javascript
// At top of file
import { AppState, save } from './state.js';
import { UNITS } from './data/units.js';

// For router (avoid circular dependency)
import('./router.js').then(({ navigateTo }) => navigateTo('home'));
```

**Event listener pattern:**
```javascript
// NOT THIS:
<button onclick="handleClick()">Click</button>

// THIS:
<button id="my-btn">Click</button>
// Then in JS:
document.getElementById('my-btn').addEventListener('click', handleClick);
```

**Save state pattern:**
```javascript
async function handleSomething() {
  // Update state
  AppState.profile.name = 'New Name';
  
  // Save to both Supabase and localStorage
  await save();
  
  // Then navigate
  import('./router.js').then(({ navigateTo }) => navigateTo('home'));
}
```

---

## 🎯 NEXT SESSION PROMPT

**When you start the next session, say:**

> "Continue building the Arabic app. I need to finish Batch 4 - update the remaining 9 feature files and create 2 new Stage B/C modules. Start with home.js. Reference the handoff document for context."

**Then upload:**
1. This handoff document
2. All your existing files from `/mnt/user-data/uploads/`
3. The 14 files we've built so far (Batches 1-3 + auth.js + onboarding.js)

---

## 📦 FILES TO DOWNLOAD (Batches 1-3)

**Batch 1 (Infrastructure):**
- config.js
- database.js
- api.js
- storage.js
- state.js

**Batch 2 (Data):**
- data/units.js
- data/aya-course.js
- data/alphabet.js
- data/placement.js
- data/focused-contexts.js

**Batch 3 (Utils):**
- utils/audio.js
- utils/rtl.js
- utils/date.js
- utils/ui.js

**Batch 4 (Started):**
- auth.js
- onboarding.js

**Total:** 16 files built, ~2,500 lines of code

---

## 🎉 PROGRESS SUMMARY

**Built:** 16/27 files (59%)  
**Lines of code:** ~2,500/~4,600 (54%)  
**Batches complete:** 3/7 (43%)  
**Estimated remaining:** 1-2 sessions to finish Batch 4, then 3 more batches

**You're more than halfway there!** 🚀

The foundation is solid. All infrastructure, data, and utilities are done. Now just need to wire the features together and create the 2 new Stage B/C screens.

---

## 💬 Questions for Next Session?

If Claude gets confused or stuck, remind it:
- "Follow the build-protocol skill - discuss before building"
- "Reference ARCHITECTURE.md and BACKLOG.md in outputs"
- "Use the patterns from auth.js and onboarding.js as examples"
- "All data is in data/ files, all state in state.js"

Good luck with the next session! 💚
