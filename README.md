# Aquarium Web Migration

This repository hosts the modern JavaScript-based rewrite of the legacy Aquarium Java applet.
The project deliberately avoids bundlers (no Vite/Webpack) so HTML, CSS and ES modules can be
served directly by any static web server during active development.

## Current Progress

- Static HTML layout with canvas aquarium and placeholder control panel.
- Asset loader pulls legacy GIF sprites and draws the aquarium background.
- Lightweight sprite engine animates a small school of neon fish with bounce physics.

## Development Setup

- Reference the legacy sources under `../aquarium` in read-only mode as described in `../aquarium-migration-plan.md`.
- Start a static file server from this directory, for example `python -m http.server 8000`, and open `http://localhost:8000/`.
- Update the vanilla JS modules under `js/` and reload the browser to see changes immediately.

## Next Steps

- Flesh out the core simulation modules (`js/model/`) based on the migration plan.
- Replace the placeholder control panel with the interactive UI widgets from the legacy applet.
- Bring over sprite AI (schooling, collision, nutrition effects) and hook it into the canvas loop.
