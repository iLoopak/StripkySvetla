# Wave 1.5 architecture

## Runtime boundaries

React owns application composition and screen-space UI: loading and error states,
the objective panel, interaction prompt, feedback, telemetry, and the dialogue
overlay. It never advances the world simulation or mutates Babylon nodes.

`GameRuntime` owns the Babylon `Engine`, scene, render loop, camera, player
movement, proximity checks, input modes, collision resolution, animation, resize
handling, and disposal. Render factories create the map, characters, and
collectible visuals from content definitions.

Zustand is the narrow bridge. It is the single shared owner of story stage,
collected entity IDs, active dialogue and line, input mode, objective-facing
state, prompt, feedback, readiness, and throttled telemetry. React is not
updated every frame.

## Content and map layer

`src/content` contains typed definitions for:

- the Jasnov outskirts map, terrain cells, spawn, and entities;
- player and NPC character palettes, proportions, hair, outfits, and signature accessories;
- procedural signature environment details that do not participate in gameplay;
- Wave 1 dialogue lines;
- story-stage objective text;
- interaction prompts and availability.

The world renderer consumes `WorldMapDefinition`. A future second map can be
added as a new definition without duplicating scene setup. Wave 1 intentionally
does not add map loading, transitions, an editor, or server-provided content.

## Visual layer

The visual pass keeps presentation data separate from gameplay:

- `src/styles/tokens.css` is the central UI color, spacing, radius, shadow, glow,
  typography, focus, and motion source;
- `src/styles/components.css` applies those tokens to the HUD and dialogue;
- `src/game/visual/visualPalette.ts` is the restrained Babylon scene palette;
- character content selects only the proportions, palette, hair, outfit, and two
  signature accessories used by the current cast;
- the shared character factory turns those definitions into procedural models and
  retains one animation path for the player and Mila;
- map `visualDetails` drive instanced lanterns, flowers, markers, and paving without
  becoming colliders or interaction targets.

The development HUD may read telemetry, while production rendering omits the debug
panel. Telemetry remains in Zustand for diagnostics and future tooling.

## Entity and interaction flow

NPC, collectible, and decoration definitions use stable IDs and a discriminated
union. Babylon creates visuals for them, while the generic interaction search
only sees target position, radius, enabled state, prompt, and available story
stages.

```text
Map content
    ↓
World runtime
    ↓ nearest valid interaction
Story state
    ↓
Objective + dialogue state
    ↓
React HUD
```

The runtime resolves the selected definition after an interaction. NPC data
maps story stages to dialogue IDs; collectible interactions dispatch a story
event. The proximity search itself knows nothing about Mila or the light spark.

## Story, objectives, and dialogue

`Wave1StoryStage` is the single progression source of truth:

```text
meet-mila → find-spark → return-to-mila → completed
```

`reduceStory` accepts explicit dialogue-completed and collectible-collected
events. Invalid transitions return the unchanged snapshot, which prevents early
turn-in and repeated collection.

Objectives are a pure mapping from story stage to content data. Dialogues are
linear content definitions. The React overlay reads the active definition and
current line from the store; finishing a dialogue dispatches a story event
instead of containing quest logic in the component.

## Input modes and collision

World mode allows movement, camera control, and one-shot interaction input.
Dialogue mode zeroes movement, detaches camera controls, and routes `E` or
`Enter` to dialogue advancement. Consuming the edge-triggered input prevents a
held key from opening and immediately advancing a dialogue.

Movement remains delta-time based and uses map terrain cells plus circular
blockers. It attempts full movement and then axis-aligned sliding. Water,
blocked entities, the shrine, decorations, and map boundaries require no
external physics engine.

## Engine lifecycle

The canvas effect constructs one runtime. Disposal stops the render loop,
removes resize and keyboard listeners, detaches camera controls, unregisters
Babylon observers, disposes collectible lights and effects, and then disposes
the scene and engine. Feedback timers live in a React effect with cleanup.
Idempotent cleanup keeps Strict Mode and hot reload safe.

## Foundation for later Waves

Wave 1.5 establishes reusable content, interaction, story-event, dialogue, objective,
and visual identity boundaries without creating a full quest engine, ECS, or design
system framework. A later Wave
can add another NPC, a small dialogue choice, or a second map by extending the
appropriate content and focused runtime capability.
