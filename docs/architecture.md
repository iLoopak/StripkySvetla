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

### Scene-level sky environment

`src/game/environment` owns the reusable sky renderer and the typed
`jasnovSkyEnvironment` configuration. The renderer creates one scene-level root with an
inverted sky dome, two procedural horizon ribbons, and one cloud-sea mesh. The dome uses a
small unlit shader generated from ordered gradient stops; horizon and cloud-sea materials
are shared per layer and use no external textures.

Environment ownership is deliberately separate from `WorldRenderResources`. A rendered
map owns terrain, decoration instances, its atlas, and map observers; disposing that map
does not dispose the sky. `GameRuntime` advances the environment's slow animation from the
Babylon render loop, while scene shutdown explicitly disposes environment meshes,
materials, and cached scene registration before the scene and engine are released.

The factory keeps one environment registration per Babylon scene and returns the existing
resource for a repeated request with the same environment ID. This protects Strict Mode
and hot reload from duplicate domes or cloud seas. A future map transition can dispose and
replace map content while retaining the same Jasnov environment. Map-specific atmosphere
will be selected through another validated configuration rather than a second renderer;
weather, interpolation, and a day/night cycle are outside this pass.

### World texture atlas

`src/game/world/worldAtlas.ts` owns the typed atlas tile IDs, pixel layout, block-face
definitions, deterministic variant selection, and the single UV helper. The checked-in
`public/assets/world/world-atlas.png` is generated from the deliberately small pixel
patterns in `scripts/generate-world-atlas.mjs`; running `npm run assets:world` reproduces
the asset.

Box geometry uses Babylon's face order to map one side tile to the four vertical faces
and distinct top and bottom tiles where needed. Atlas rows are authored from the top of
the PNG, so the UV helper converts them to Babylon coordinates and applies a half-texel
inset. Every 16-pixel tile also has a one-pixel extruded gutter. This keeps UV arithmetic
centralized and prevents adjacent tiles from bleeding into one another.

`WorldRenderResources` is scoped to one rendered map. It owns one nearest-neighbor atlas
texture, one neutral atlas material, the remaining procedural materials, and one source
mesh per face-UV configuration. Blocks that share a source mesh remain Babylon
instances. Stone and leaf source selection uses a stable position hash; the existing
sparse grass variation selects the second grass top. Water, shrine meshes, dark stone,
and emissive light objects remain procedural.

Map disposal unregisters shrine observers, disposes the world root and instances, then
releases cached source references, shared materials, and the atlas texture. The map cache
is not global, and it does not own the scene-level sky environment. React Strict Mode and
hot reload therefore cannot retain map resources from a disposed runtime.

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

## Wave 2 runtime extension

### Map manager and shared resources

`MapManager` owns only the active map content. It resolves a typed map by `mapId`, validates
an `entryPointId`, disposes the previous world root and map entities, renders the next map,
and places the existing player at the selected entry point. `GameRuntime` keeps one engine,
scene, render loop, camera, input manager, and player throughout the transition.

The map manager owns one scene-lifetime `WorldRenderResources` cache. Atlas texture,
atlas material, procedural block materials, and source meshes are created lazily and reused
by both maps. Each map creates instances parented to its own disposable root. The
scene-level sky dome, horizon ribbons, and cloud sea remain outside the map manager, so a
transition neither recreates nor disposes them.

The current transition is deliberately small: interaction lock, fade-out, map replacement,
entry-point placement, checkpoint update, and fade-in. A failed map or entry-point lookup
enters the existing readable error state.

### Story and entity restoration

`StorySnapshot` is the single progression source. It contains Chapter 1's explicit stage,
one-shot memory and awakening fields, delivery state, the explicit `SpuntOutcome`, trust
values, collected entities, and resolved interactions. The pure reducer rejects events
that do not match the current stage and refuses to overwrite a committed choice.

Entity conditions are evaluated from the snapshot. This makes Špunt appear behind the
storehouse only after the clue, disappear after the choice, and reappear either in the pen
or at the forest gate. Loading a checkpoint applies the same conditions before gameplay
resumes.

### Dialogue choices

Dialogue content is a graph of typed nodes. Nodes contain text plus either one `next`
reference or up to two choices. Choice content may carry a story outcome and conditions.
The graph validator checks start nodes, links, unique choice IDs, invalid node shapes, and
a reachable terminal node.

Zustand stores the active dialogue and node, selected choice, and input lock. `W/S`, vertical
arrows, mouse clicks, `E`, and `Enter` all route through the same store actions. The
interaction press is consumed before the graph is opened, so it cannot also confirm a
choice.

### Save and start flow

The V1 save is a validated `localStorage` document containing the format version, timestamp,
current map, safe entry point, story fields, collected entity IDs, and resolved entity IDs.
Transient position, camera, prompts, open dialogue, fades, and telemetry are excluded.

Autosaves occur at story checkpoints: Puk awakened, delivery received, festival map entered,
delivery completed, Špunt choice committed, branch folded at the gate, and Wave 2 complete.
Continue accepts only a valid versioned and map-consistent checkpoint. New Game clears the
single save after an in-menu confirmation.

### Companion

Puk is a scene-owned visual follower rather than a map entity or party member. A focused
controller interpolates toward an offset from the player, adds a restrained bob, and never
participates in collision, triggers, or interaction selection. It survives map replacement
and is disposed with the scene.
