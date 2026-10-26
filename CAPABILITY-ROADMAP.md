# JT Motion — Video Creation Capability Roadmap

JT Motion belongs to the video / motion category in the JT ecosystem. The goal is to grow it from its current storyboard workspace into a practical video-production tool, without claiming features before they exist.

## Available today
- Storyboard scenes with visual, action, dialogue/audio and duration notes
- Scene ordering and estimated runtime
- Local project autosave
- JSON project import/export and printable storyboard

## Capability targets
1. Timeline editing: multiple video, title and audio tracks; clip trimming, splitting, snapping, ripple edits and undo/redo.
2. Media library: import video, image and audio files; thumbnails, metadata, relinking missing media and project-relative assets.
3. Preview and playback: seekable preview, aspect ratios, frame-rate settings, timecode and audio monitoring.
4. Transitions and titles: fades, transitions, text overlays, captions and reusable title templates.
5. Audio tools: clip gain, fades, waveform display, mute/solo and voice-over recording where platform support permits.
6. Export: render finished video using a maintained media engine such as FFmpeg when installed/licensed correctly; presets for resolution, frame rate, codec and quality; progress, cancellation and clear errors.
7. AI-assisted production: through JT AI Core only, offer opt-in shot lists, scene summaries, caption drafts and editing suggestions. AI must not overwrite a project without user approval.
8. Project portability: versioned project format, asset manifest, backups and explicit missing-media warnings.

## Engineering and safety requirements
- Keep Electron renderer isolated; use a narrow, validated IPC bridge for filesystem and media operations.
- Never run imported project data as code.
- Do not silently download codecs, upload footage, or send media to AI services.
- Add automated tests for project import validation, timeline calculations, save/restore and export settings.
- Keep Windows, macOS and Linux packaging claims tied to successful CI jobs.

## Status
This document is a roadmap, not a claim that the target features are already implemented. Prioritize a working media import + preview + basic timeline before advanced effects.