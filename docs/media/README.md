# Demo Media

This directory holds the screenshots, GIFs, and video that document each user story in the
README. Media is attached per user story, starting with the first UI commit (#8).

## Naming convention

```
us-XX-<slug>.gif   # e.g. us-02-calculator.gif
us-XX-<slug>.mp4   # e.g. us-08-widget.mp4
```

One primary asset per user story; `XX` is the zero-padded story number.

## Capture protocol

1. **Record from the iOS Simulator**

   ```
   xcrun simctl io booted recordVideo docs/media/us-XX-<slug>.mp4
   ```

   Press `Ctrl-C` to stop.

2. **Record an E2E flow with Maestro** (drives the app deterministically)

   ```
   maestro record .maestro/us-XX-<slug>.yaml
   ```

3. **Convert MP4 → optimized GIF with gifski**

   ```
   gifski --fps 20 --width 480 -o docs/media/us-XX-<slug>.gif docs/media/us-XX-<slug>.mp4
   ```

4. **Reference it** from the README demo-media table and the matching Features row.

## Guidelines

- Keep clips short (5–12 s) and focused on one story.
- Capture both light and dark where the story is visual (US-12).
- No real personal financial data on screen — use sample loans only.
