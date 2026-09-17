# BOSS — modular 2D boss arena

Web game inspired by the modular-boss / bullet-hell genre. This project is intentionally split into clear folders so gameplay systems can be extended without mixing responsibilities.

## Structure

- `index.html` — application shell.
- `src/main.js` — composition root and game startup.
- `src/core/` — loop, input, state and shared utilities.
- `src/entities/` — player, boss and projectiles.
- `src/systems/` — combat, boss modules and spawning.
- `src/render/` — Canvas renderer.
- `src/ui/` — HUD and mobile controls.
- `src/styles/` — responsive visual styling.

## Run

Open `index.html` in a modern browser or publish the repository with GitHub Pages.

Controls: WASD / arrows to move, mouse to aim, hold/click to fire. On phones use the on-screen controls.
