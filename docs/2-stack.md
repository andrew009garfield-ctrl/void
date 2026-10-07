# Void — Technology Stack

Last updated: 2026-09-19

---

## Core Runtime

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 24 (pinned in `.nvmrc`) | JavaScript runtime for Electron main process |
| Electron | ^41.2.0 | Cross-platform desktop app framework |
| Vite | ^8.1.4 | Frontend bundler and dev server |

---

## Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | ^19.1.0 | UI component library |
| React DOM | ^19.1.0 | DOM rendering |
| TypeScript | ^6.0.2 | Type safety |
| Tailwind CSS | ^4.1.10 | Utility-first CSS framework |
| @tailwindcss/vite | ^4.2.2 | Vite plugin for Tailwind v4 |
| shadcn/ui | ^0.9.5 | Accessible UI components (Radix primitives) |
| Radix UI | various | Headless UI primitives (dialog, dropdown, tabs, etc.) |
| Zustand | ^5.0.11 | Lightweight state management |
| TipTap | 3.31.3 | Rich text editor (notes) |
| react-i18next | ^17.0.10 | Internationalization (9 languages + Arabic) |
| i18next | ^26.3.6 | i18n core |
| react-markdown | ^10.1.0 | Markdown rendering |
| canvas-confetti | ^1.9.4 | Celebration animations |
| tw-animate-css | ^1.3.4 | Tailwind animation utilities |
| @tanstack/react-virtual | ^3.13.2 | Virtualized list rendering |

---

## Speech-to-Text (STT) Engines

| Engine | Integration | Purpose |
|---|---|---|
| whisper.cpp | Bundled native binary | Local STT (GGML models: tiny, base, small, medium, large, turbo) |
| NVIDIA Parakeet | sherpa-onnx runtime | Fast multilingual ASR (INT8 quantized, CPU-efficient) |
| Orukeet | sherpa-onnx runtime | Recommended local model (Parakeet fine-tune from Oruk) |
| Cohere Transcribe | sherpa-onnx runtime | Most accurate local model (5.42% avg WER, 14 languages) |
| Nemotron Streaming | sherpa-onnx online server | Cache-aware streaming FastConformer |
| OpenAI (gpt-transcribe) | REST API | Cloud STT (default OpenAI model) |
| Deepgram | WebSocket API | Cloud streaming STT (BYOK) |
| AssemblyAI | WebSocket API | Cloud streaming STT (BYOK, Universal-3.5 Pro) |
| Gemini Live | API | Cloud streaming STT (BYOK) |

**Runtime binaries:** sherpa-onnx ships separate `sherpa-onnx-ws` (offline) and `sherpa-onnx-online-ws` (streaming) servers per platform/arch.

---

## AI / LLM Providers

| Provider | Models | Integration |
|---|---|---|
| OpenAI | GPT-6 Astra, GPT-5.6 series, GPT-5.5, GPT-5.2, GPT-5 Mini/Nano, GPT-4.1 series | Responses API (direct) |
| Anthropic | Claude Fable 5.1, Fable 5, Sonnet 5/4.6, Haiku 4.5, Opus 5/4.8/4.7/4.6/4.5 | IPC bridge (avoids CORS) |
| Google Gemini | Gemini 3.5 Flash/Flash Lite, 3.1 Pro, 3 Flash, 2.5 Flash Lite, Gemma 4 | Direct API (renderer) |
| Groq | Various LLM models | Via @ai-sdk/groq |
| Amazon Bedrock | Enterprise models | Via @ai-sdk/amazon-bedrock + AWS SDK |
| Azure OpenAI | Enterprise models | Via @ai-sdk/azure |
| Google Vertex | Enterprise models | Via @ai-sdk/google-vertex |
| Local (llama.cpp) | GGUF models (Qwen, Llama, Mistral, GPT-OSS) | llama-server binary with --jinja |
| Tinfoil | Enclave models | Via tinfoil SDK |
| OpenRouter | Various | Via API |
| Void Cloud | Managed models | Via Void API proxy |

**AI SDK:** Vercel AI SDK (`ai` ^6.0.116) for unified provider interface.

---

## Database & Storage

| Technology | Purpose |
|---|---|
| better-sqlite3 | Local transcription history, notes, calendar events, agent conversations |
| Qdrant | Vector database for local semantic search (cosine distance, 384-dim) |
| Firebase Firestore | User profiles, cloud data (asia-south1 region) |
| Neon (Postgres) | Serverless database powering Void Cloud |
| Kysely | Type-safe SQL query builder for SQLite |

**Storage locations:**
- SQLite: `~/.void/void-data/` (platform-dependent)
- Qdrant data: `~/.cache/void/qdrant-data/`
- Whisper models: `~/.cache/void/whisper-models/`
- Parakeet models: `~/.cache/void/parakeet-models/`
- Embedding models: `~/.cache/void/embedding-models/`
- Secure keys: `userData/secure-keys/` (Electron safeStorage)

---

## Native / Platform Code

| Technology | Platform | Purpose |
|---|---|---|
| Swift | macOS | Globe key listener, mic listener, calendar listener, audio tap |
| C | Windows | Key listener (low-level keyboard hook), mic listener (WASAPI), system audio helper (WASAPI loopback) |
| C | Linux | Key listener, fast paste (uinput/XTest), system audio capture |
| ONNX Runtime Node | Cross-platform | Text embeddings, speaker embeddings, fbank extraction |
| FFmpeg (ffmpeg-static) | Cross-platform | Audio format conversion (bundled, no system install needed) |

---

## Authentication & Security

| Technology | Purpose |
|---|---|
| Firebase Auth | Google Sign-in + Email/Password authentication |
| better-auth | Legacy auth system (being migrated away from) |
| @better-auth/sso | SSO support for enterprise |
| Electron safeStorage | API key encryption at rest (OS keychain) |
| @napi-rs/keyring | OS keyring access |

**Encrypted secrets (12 total):** 7 BYOK API keys + 5 enterprise cloud credentials.

---

## Calendar Integration

| Provider | Sync Method | Scope |
|---|---|---|
| Google Calendar | REST API + OAuth (PKCE loopback) | 33-day lookahead, incremental sync via syncToken |
| Microsoft Calendar | Graph API + OAuth (PKCE loopback) | 38-day window, delta sync |
| Apple Calendar | EventKit via Swift helper | macOS only, snapshot-push |

---

## Build & Distribution

| Technology | Purpose |
|---|---|
| electron-builder | App packaging and distribution |
| @electron/notarize | macOS app notarization |
| PostCSS | CSS processing |
| ESLint | Code linting |
| Prettier | Code formatting |
| tsx | TypeScript execution for tests and scripts |
| Nix (flake.nix) | Reproducible build environment |

**Build targets:**
- macOS: .dmg (Apple Silicon + Intel)
- Windows: .exe (NSIS installer)
- Linux: .AppImage, .deb, .rpm, .tar.gz

---

## Networking & Communication

| Technology | Purpose |
|---|---|
| ws (WebSocket) | Real-time streaming (Deepgram, AssemblyAI, Parakeet online) |
| @homebridge/dbus-native | D-Bus IPC for Linux Wayland global hotkeys |
| electron-updater | Auto-update system (AppImage only on Linux) |

---

## Key External Binaries (Downloaded at Build/Dev Time)

| Binary | Source | Purpose |
|---|---|---|
| whisper-cpp | GitHub releases | Local STT engine |
| llama-server | GitHub releases | Local LLM inference |
| sherpa-onnx (offline + online) | GitHub releases | Parakeet/Cohere/Nemotron inference |
| qdrant | GitHub releases | Vector database |
| yt-dlp | GitHub releases | YouTube audio import |
| all-MiniLM-L6-v2 | HuggingFace | Text embedding model |
| diarization models | HuggingFace | Speaker identification |
| whisper VAD model | HuggingFace | Voice Activity Detection |
| nircmd | GitHub releases | Windows clipboard operations |
| windows-key-listener | GitHub releases | Windows PTT binary |
| windows-mic-listener | GitHub releases | Windows mic detection |
| meeting-aec-helper | GitHub releases | Audio echo cancellation |

---

## Dev Dependencies

| Tool | Version | Purpose |
|---|---|---|
| concurrently | ^10.0.3 | Parallel dev server + Electron |
| cross-env | ^10.0.0 | Cross-platform env vars |
| eslint | ^10.7.0 | Linting |
| eslint-plugin-react-hooks | ^7.1.1 | React hooks lint rules |
| espree | ^11.2.0 | JavaScript parser |
| prettier | ^3.8.3 | Formatting |
| postcss | ^8.5.10 | CSS processing |
| @vitejs/plugin-react | ^6.0.1 | Vite React plugin |
