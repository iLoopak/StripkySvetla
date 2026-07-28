# Wave 0 architecture

## Runtime boundaries

React owns application composition: it mounts one canvas and renders loading, error, title,
controls, and telemetry overlays. It never advances the game simulation.

`GameRuntime` owns the Babylon `Engine`, scene, render loop, camera, input manager, movement,
animation, resize handling, and disposal. World and character factories build scene content
from Babylon primitives. Pure terrain and movement helpers remain independent of WebGL and
are unit tested.

Zustand is the narrow bridge between these layers. The runtime writes readiness, errors, FPS,
and player coordinates. Telemetry is throttled to four updates per second so React is not
re-rendered every frame.

## Engine lifecycle

The canvas effect constructs one runtime. The runtime registers its render loop, keyboard
input, camera controls, and resize listener. Its idempotent `dispose()` stops the loop,
removes listeners and controls, then disposes the scene and engine in dependency order.
This makes development remounts and hot reload safe.

## Scene growth

Wave 0 has one exploration scene. A later world/battle split should keep a shared engine and
move scene ownership behind explicit scene controllers. World content should become
data-driven when Wave requirements introduce authored maps, encounters, or persistence;
Wave 0 avoids placeholder systems for them.

## Why there is no physics engine

Current movement is planar and uses deterministic terrain-height and walkability functions.
An external physics engine would increase bundle size and lifecycle complexity without
serving Wave 0. Collision or physics should be introduced only when a concrete later Wave
requires it.

## Foundation for later Waves

Input, scene construction, character animation, world generation, runtime lifecycle, and UI
state already have clear boundaries. This permits later Waves to replace the terrain data,
add scene controllers, or enrich character behavior without coupling Babylon's frame loop
to React.
