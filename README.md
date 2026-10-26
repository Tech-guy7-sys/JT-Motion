# JT Motion

JT Motion is the J Tech Digital World video-planning and storyboard workspace. It helps organize a video idea into scenes, shot notes, and a lightweight timeline before production.

## Current capabilities

- Create and edit a project title, format, frame rate, and description
- Add, edit, reorder, and remove storyboard scenes
- Record each scene's visual, action, dialogue/audio, and duration notes
- Review a simple scene timeline and estimated total duration
- Autosave the current project locally in the browser or desktop app
- Export and import project data as JSON
- Export a clean printable storyboard using the browser's print function
- Run as a browser app or in an Electron desktop shell

## Important limits

JT Motion is currently a planning/storyboard tool, not a full nonlinear video editor. It does not yet render or export finished videos, edit media tracks, process audio, or provide cloud synchronization. Scene durations are planning estimates. No AI provider is connected by default; Jeff AI integration should be added only through the shared JT AI Core provider interface and verified before being advertised.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm start
```

To serve the web app in a browser:

```bash
npm run serve
```

Then open http://localhost:4173.

## Package a desktop app

```bash
npm run dist
```

Builds are configured for Windows x64, macOS Intel/Apple Silicon, and Linux x64/ARM64. A platform/architecture is available only after its CI job succeeds and the resulting artifact is checked. Packages are unsigned by default; macOS signing/notarization is not configured.

## Privacy and JT ecosystem

- Uses JT branding and the exact product name **JT Motion**.
- Project data is stored locally in the app/browser unless the user exports it.
- Imported JSON is validated before loading.
- No analytics, remote upload, or background microphone/camera access is included.
- Future AI features must use the shared JT AI Core and clearly disclose what data is sent to a configured provider.
- Desktop/device control belongs exclusively to JT Desktop Agent.

## Project structure

- `index.html`, `styles.css`, `app.js`: storyboard web application
- `desktop/main.cjs`: Electron shell
- `electron-builder.yml`: packaging targets
- `.github/workflows/build.yml`: artifact-only CI builds; no GitHub Releases are published automatically
