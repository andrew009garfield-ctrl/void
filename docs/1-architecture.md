# Void — Architecture

Last updated: 2026-09-19

---

## Overview

Void is an Electron-based desktop dictation and voice assistant application. It is a fork of [OpenWhispr](https://github.com/OpenWhispr/openwhispr), rebuilt with Firebase authentication, a new purple brand identity, and additional features including meeting transcription with speaker diarization, an AI voice assistant, local semantic search, and calendar integrations.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ELECTRON APP                                      │
│                                                                             │
│  ┌─────────────────────────┐    ┌──────────────────────────────────────┐    │
│  │    MAIN PROCESS          │    │       RENDERER PROCESS (React)      │    │
│  │    (main.js)             │    │       (src/)                       │    │
│  │                          │    │                                      │    │
│  │  ┌───────────────────┐   │    │  ┌────────────────────────────────┐ │    │
│  │  │ Window Manager     │   │    │  │ App.jsx (Dictation UI)        │ │    │
│  │  │ (dictation pill +  │   │    │  │ ControlPanel.tsx (Settings)    │ │    │
│  │  │  control panel)    │   │    │  │ OnboardingFlow.tsx             │ │    │
│  │  └───────────────────┘   │    │  └────────────────────────────────┘ │    │
│  │                          │    │                                      │    │
│  │  ┌───────────────────┐   │    │  ┌────────────────────────────────┐ │    │
│  │  │ Hotkey Manager     │   │    │  │ Hooks (useAudioRecording,      │ │    │
│  │  │ (global shortcuts) │   │    │  │  useSettings, useAuth)         │ │    │
│  │  └───────────────────┘   │    │  └────────────────────────────────┘ │    │
│  │                          │    │                                      │    │
│  │  ┌───────────────────┐   │IPC │  ┌────────────────────────────────┐ │    │
│  │  │ Audio Manager      │◄──┼────┤  │ Services (ReasoningService,    │ │    │
│  │  │ MediaRecorder tap  │   │    │  │  AI inference providers)       │ │    │
│  │  └───────────────────┘   │    │  └────────────────────────────────┘ │    │
│  │                          │    │                                      │    │
│  │  ┌───────────────────┐   │    │  ┌────────────────────────────────┐ │    │
│  │  │ SQLite Database    │   │    │  │ Stores (zustand)              │ │    │
│  │  │ (better-sqlite3)   │   │    │  └────────────────────────────────┘ │    │
│  │  └───────────────────┘   │    │                                      │    │
│  │                          │    └──────────────────────────────────────┘    │
│  │  ┌───────────────────┐              ▲  context isolation  ▲              │
│  │  │ Preload Script     │◄─────────────┘                  └───────────────►│
│  │  │ (preload.js)       │          Secure IPC bridge                      │
│  │  └───────────────────┘                                                   │
│  │                          │                                               │
│  └──────────────────────────┘                                               │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    SIDECAR PROCESSES                                 │   │
│  │                                                                      │   │
│  │  whisper.cpp ─── Local STT (GGML models)                             │   │
│  │  sherpa-onnx ─── Parakeet / Orukeet / Cohere Transcribe              │   │
│  │  llama-server ── Local LLM inference (GGUF models)                   │   │
│  │  Qdrant ──────── Vector database for semantic search                  │   │
│  │  ONNX Worker ─── Embeddings (MiniLM) + speaker/fbank inference       │   │
│  │                                                                      │   │
│  │  Platform-specific native helpers:                                    │   │
│  │    macOS:  globe-listener, mic-listener, calendar-listener, audio-tap │   │
│  │    Windows: key-listener, mic-listener, system-audio-helper           │   │
│  │    Linux:  key-listener, paste, system-audio                          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    CLOUD SERVICES (optional)                         │   │
│  │                                                                      │   │
│  │  Firebase ─────── Auth (Google + Email/Password)                     │   │
│  │  Neon (Postgres) ─ Void Cloud database                               │   │
│  │  OpenAI / Anthropic / Gemini / Groq / etc. ── BYOK cloud inference   │   │
│  │  Google Calendar / Microsoft Calendar / Apple Calendar ── OAuth sync  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Dual Window Architecture

| Window | Purpose | Window Type |
|---|---|---|
| Main Window | Minimal dictation overlay (draggable pill) | Always-on-top, frameless, content-protected |
| Control Panel | Full settings, notes, chat interface | Normal Electron window |

Both windows share the same React codebase and are routed via URL in `src/AppRouter.jsx`.

---

## Core Data Flow: Dictation

```
1. User presses hotkey (global shortcut)
2. Main process → IPC → Renderer: toggle recording
3. Renderer: MediaRecorder captures audio via Web Audio API
4. User releases hotkey → recording stops
5. Audio Blob → ArrayBuffer → IPC to main process
6. Main process writes temp file
7. Transcription engine processes file:
   - Local: whisper.cpp / sherpa-onnx (Parakeet/Cohere)
   - Cloud: OpenAI / Deepgram / AssemblyAI / Gemini Live
8. Result sent back via IPC → Renderer
9. Optional AI cleanup/agent processing
10. Text pasted at cursor (auto-paste) or displayed
11. Temp file cleaned up
```

**Streaming path (online Parakeet/Orukeet models):** Audio is streamed live via websocket during capture; final transcript committed on stop without a second decode pass.

---

## Core Data Flow: Meeting Transcription

```
1. Meeting detected (process list + audio activity + calendar events)
2. Two parallel audio streams captured:
   - Microphone audio (input)
   - System audio tap (output/speakers)
3. Echo leak detector correlates mic vs system audio (0-500ms lag search)
4. Mic gate applies RMS/peak verdicts: send / zero / skip
5. Text layer holdback checks for duplicates and race conditions
6. Speaker diarization via ONNX models (on-device)
7. Combined transcript displayed in live panel
8. Stored in SQLite (calendar-linked when applicable)
```

---

## Local Semantic Search Pipeline

```
1. App launch → Qdrant binary starts → collection created
2. Embedding model auto-downloads on first run (~22MB, all-MiniLM-L6-v2)
3. Note create/update/delete → SQLite write → background vector upsert/delete
4. Agent search → parallel FTS5 + Qdrant vector search
5. Reciprocal Rank Fusion (K=60, 0.3 cosine threshold)
6. Ranked results returned
```

Fallback chain: cloud search → local semantic (Qdrant) → FTS5 keyword.

---

## File Map

### Root

| File | Purpose |
|---|---|
| `main.js` | Electron main process entry point, initializes all managers |
| `preload.js` | Secure IPC bridge (window.api) |
| `package.json` | Dependencies and scripts (v1.10.0, Node 24+) |
| `electron-builder.json` | Build config (AppId: com.microsive.void) |
| `.env` | Runtime config (transcription provider, API keys) |
| `firebase.json` | Firestore security rules |
| `firestore.rules` | User-scoped Firestore rules |
| `flake.nix` | Nix reproducible build environment |
| `PLAN.md` | Original project plan (Sept 15, 2026) |

### src/ (Renderer)

| Path | Purpose |
|---|---|
| `src/App.jsx` | Main dictation UI with recording states |
| `src/AppRouter.jsx` | Dual-window URL routing |
| `src/main.jsx` | React entry point |
| `src/index.css` | Tailwind v4 theme + brand palette |
| `src/components/` | UI components (shadcn/ui + Radix primitives) |
| `src/components/ui/` | Reusable UI primitives (buttons, cards, inputs) |
| `src/hooks/` | React hooks (useAuth, useSettings, useAudioRecording, etc.) |
| `src/helpers/` | Core business logic (40+ modules) |
| `src/services/` | AI inference providers, reasoning service |
| `src/models/` | Model registry (modelRegistryData.json) |
| `src/stores/` | Zustand state stores |
| `src/config/` | Language registry, inference scopes, retired models |
| `src/locales/` | i18n translations (9 languages + Arabic) |
| `src/assets/` | Images, fonts, brand assets |
| `src/workers/` | ONNX worker process |
| `src/types/` | TypeScript type definitions |

### src/helpers/ (Main Process)

| Module | Purpose |
|---|---|
| `audioManager.js` | Audio device management |
| `whisper.js` | whisper.cpp integration and model management |
| `parakeet.js` | NVIDIA Parakeet model management via sherpa-onnx |
| `qdrantManager.js` | Qdrant vector DB sidecar lifecycle |
| `localEmbeddings.js` | all-MiniLM-L6-v2 via ONNX Runtime |
| `vectorIndex.js` | Qdrant collection management (upsert/search/reindex) |
| `hotkeyManager.js` | Global hotkey registration (GLOBE, GNOME, Hyprland, KDE) |
| `meetingDetectionEngine.js` | Meeting detection orchestrator |
| `meetingProcessDetector.js` | Meeting app process detection |
| `audioActivityDetector.js` | Microphone usage detection |
| `meetingEchoLeakDetector.js` | Echo analysis for meeting recordings |
| `meetingMicGate.js` | Mic chunk send/zero/skip verdicts |
| `meetingMicHoldback.js` | Text-layer duplicate/race condition handling |
| `googleCalendarManager.js` | Google Calendar sync (REST, OAuth) |
| `microsoftCalendarManager.js` | Microsoft Calendar sync (Graph API) |
| `appleCalendarManager.js` | Apple Calendar via Swift helper (macOS) |
| `calendarReminderScheduler.js` | Provider-agnostic meeting reminders |
| `environment.js` | API key management (safeStorage encryption) |
| `database.js` | SQLite operations |
| `clipboard.js` | Cross-platform clipboard (AppleScript/PowerShell/compositor-aware) |
| `dockManager.js` | macOS Dock icon management |
| `autoStart.js` | Launch-at-login (SMAppService/HKCU Run/XDG autostart) |
| `menuManager.js` | Application menu |
| `tray.js` | System tray |
| `ipcHandlers.js` | Centralized IPC handler registration |
| `windowManager.js` | Window creation and lifecycle |
| `cliBridge.js` | Loopback HTTP server (ports 8200-8219) for CLI integration |

### scripts/

| Script | Purpose |
|---|---|
| `download-whisper-cpp.js` | Download whisper.cpp binaries from GitHub |
| `download-llama-server.js` | Download llama.cpp server for local LLM |
| `download-sherpa-onnx.js` | Download sherpa-onnx binaries |
| `download-qdrant.js` | Download Qdrant binary |
| `download-minilm.js` | Download all-MiniLM-L6-v2 ONNX model |
| `download-yt-dlp.js` | Download yt-dlp for YouTube audio import |
| `download-diarization-models.js` | Download speaker diarization models |
| `build-globe-listener.js` | Compile macOS Globe key listener (Swift) |
| `build-macos-mic-listener.js` | Compile macOS mic listener (Swift) |
| `build-windows-key-listener.js` | Compile Windows PTT binary |
| `build-linux-fast-paste.js` | Compile Linux native paste helper |
| `afterPack.js` | Post-build validation (checks DLL names on Windows) |

### resources/

| Path | Purpose |
|---|---|
| `resources/bin/` | Compiled native binaries (per-platform) |
| `resources/nsis/` | Windows NSIS installer scripts |
| `resources/` | Platform-specific installers and assets |

---

## Key Architectural Decisions

1. **Context Isolation:** Renderer is isolated from Node.js; all IPC goes through preload.js bridge
2. **Local-first by default:** All core features work offline with local models; cloud is opt-in
3. **Event-driven OS integration:** Native listeners for mic/process/audio detection (near-zero CPU)
4. **Platform-specific native code:** Swift (macOS), C (Windows/Linux), with fallback chains
5. **Sidecar architecture:** whisper.cpp, sherpa-onnx, Qdrant, llama-server run as child processes
6. **Firebase auth:** Google Sign-in + Email/Password, replaces old Better Auth system
7. **Purple brand identity:** Differentiates from OpenWhispr blue and Wispr Flow teal
