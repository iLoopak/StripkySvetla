# Střípky světla

A small browser-based voxel JRPG about returning light to a fading world. The project is at
**Wave 1.5 — visual identity pass**.

The playable Wave 1 loop remains unchanged: the player meets festival steward Mila outside
Jasnov, accepts a short task, finds a light spark near an old shrine, and returns with a
trail pointing toward the Moss Forest.

## Stack

Vite, React, strict TypeScript, Babylon.js, Zustand, Vitest, ESLint, and Prettier.
All visuals are procedural; the project uses no external art, fonts, icons, models, or
textures.

## Run locally

A supported Node.js LTS release and npm are required.

```bash
npm ci
npm run dev
```

Production validation:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Controls

- Move: `WASD` or arrow keys
- Interact and advance dialogue: `E` or `Enter`
- Dialogue can also be advanced with its action button
- Rotate camera: mouse drag
- Zoom: mouse wheel

## Architecture

React mounts one canvas and renders screen-space UI. `GameRuntime` owns the Babylon engine,
scene, render loop, input, interactions, and lifecycle. Zustand is the narrow shared bridge
for story state, dialogue, objectives, prompts, feedback, and throttled telemetry.

Authored maps, visual details, entities, characters, dialogue, and objectives live in the
typed `src/content` layer. Renderers and the interaction system consume generic definitions
instead of special-casing Mila or the light spark.

See [docs/architecture.md](docs/architecture.md) for runtime boundaries and
[docs/art-direction.md](docs/art-direction.md) for visual rules.

## Wave 1.5 visual identity

The visual direction is **cozy luminous voxel JRPG**: gentle fairy-tale warmth, restrained
melancholy, dark petrol UI surfaces, warm gold light, soft mint highlights, and small
stylized characters.

The pass adds:

- centralized UI tokens and a shared Babylon world palette;
- a recurring split-shard motif across the HUD, prompts, feedback, shrine, and spark;
- compact chibi proportions with a configurable shared character visual system;
- a courier silhouette for the player, with scarf and luminous pendant;
- a warmer festival-steward silhouette for Mila, with a bun, wrap, sash, and brooch;
- a layered lantern shrine with a split crystal and orbiting shards;
- instanced path lanterns, light flowers, shard markers, and shrine paving;
- quieter scene lighting, controlled emissive accents, and softer environmental variation;
- responsive fantasy-adventure UI, reduced-motion support, and accessible live feedback;
- development-only telemetry that stays available in the store but does not ship as
  production HUD chrome.

## Wave 1 gameplay foundation

- data-driven Jasnov outskirts map with terrain, decorations, and collision;
- generic NPC, collectible, and proximity interaction definitions;
- linear dialogue with movement and camera locking;
- pure story transitions and objective selection;
- one-shot interaction input and a collectible response effect;
- collision with water, the shrine, Mila, decorations, and map boundaries;
- Strict Mode and hot-reload-safe lifecycle cleanup;
- unit tests for story, input, interactions, collision, visual helpers, and character config.

## Deliberate non-goals

Wave 1.5 adds no quests, branching, combat, enemies, inventory, saving, audio, portraits,
cutscenes, new maps, map transitions, gamepad support, touch controls, external assets,
webfonts, icon packs, shaders, heavy post-processing, or new gameplay systems.
