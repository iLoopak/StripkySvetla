# Art direction

## Identity

**Střípky světla is a cozy luminous voxel JRPG.** Its world is gently melancholic,
readable, warm near living light, and built from small stylized forms. The identity
comes from silhouette, restrained color, and recurring light motifs rather than
textures, heavy effects, or ornate fantasy decoration.

## Visual pillars

1. Light is the narrative and visual anchor.
2. Important characters read as compact voxel JRPG silhouettes.
3. UI uses deep petrol surfaces instead of generic black cards.
4. Mint and gold identify magical and human-made light.
5. Fantasy presentation stays clean, quiet, and immediately readable.
6. Procedural details should feel authored rather than Minecraft-like.

## Palette

### UI

- Deep petrol `#132b34`: page and scene foundation
- Panel petrol `#10242b`: primary UI surface
- Soft petrol `#18333c`: secondary surface
- Warm ivory `#f4eee2`: primary text
- Mist mint `#b8d5d0`: secondary text
- Luminous mint `#a8eadb`: magical light and guidance
- Lantern gold `#f6d58a`: warmth, action, and human-made light
- Soft green `#8ed8ad`: completion and healthy status

Use the CSS custom properties in `src/styles/tokens.css`. Do not copy these values
into components.

### World

Use `src/game/visual/visualPalette.ts`. Ordinary terrain is muted and slightly cool.
Shrines, sparks, pendants, flowers, and lanterns may use emissive mint or gold in small
areas. Never rely on pure white to communicate brightness.

## Typography roles

- Display title: restrained system serif, sentence case, compact line height
- Section eyebrow: small sans-serif metadata with moderate tracking
- Objective title: readable serif, one clear level below the game title
- Body text: system sans-serif with comfortable line height
- Helper text: quieter sans-serif; never the only carrier of essential information
- Interaction label: compact, medium-weight sans-serif next to a distinct keycap
- Debug text: small monospace, low contrast, development only

Do not add remote fonts. Avoid large uppercase blocks and dashboard-like labels.

## Shape language

The primary motif is a **split diamond shard**. The secondary motif is a **small
lantern frame**. Reuse these forms in objectives, interactions, feedback, shrines,
sparks, and character light details. Corners may be lightly cut or offset, but frames
must remain simple.

## Character proportions

- Heads are slightly larger than natural proportions, but not bobblehead-sized.
- Bodies are compact and broad enough to read at the isometric camera distance.
- Legs are short, with readable foot depth and a stable grid footprint.
- Arms support a clear walk cycle without becoming thin sticks.
- Faces stay minimal; silhouette, outfit blocks, and color carry identity.

## Important characters

Every important character needs:

- a distinct hair or head silhouette;
- a distinct outfit silhouette;
- no more than two signature accessories;
- a controlled palette with one light accent;
- a readable role before dialogue is opened.

The player is an ordinary young courier: dark teal tunic, cream scarf, practical hood,
and a warm pendant. Mila is a trusted festival steward: burgundy and terracotta
layers, festival bun, gold sash, and brooch. They must never become palette swaps.

## Light motif rules

- Magical guidance uses mint; lanterns and community warmth use gold.
- A luminous element needs a readable solid form before it receives emissive color.
- Prefer one local light per major focal object.
- Keep glow localized and avoid white clipping.
- Reuse split shards and lantern frames instead of inventing a new symbol per feature.

## UI principles

- The objective plaque is the main HUD anchor.
- Interaction prompts feel like a game moment, with a physical keycap and shard mark.
- Feedback is one short ceremonial message, never a toast stack.
- Dialogue stays readable over the scene and uses the same cut-corner language.
- Debug information is visually subordinate and hidden from production builds.
- Focus, contrast, live regions, responsive sizing, and reduced motion are required.

## Environment principles

- Start from the authored path, terrain, shrine, and gameplay landmarks.
- Add three to five sparse signature detail families, not dense decoration.
- Instance repeated geometry and share materials.
- Keep paths, interactions, and silhouettes unobstructed.
- Alternate terrain color sparingly to soften the technical grid.
- Use height and contrast to guide attention before adding glow.

## Do / do not

Do:

- use a warm lantern near a path turn;
- repeat one shard symbol in world and UI;
- distinguish NPCs through hair, outfit, and accessory silhouette;
- pair mint magic with muted surrounding colors;
- validate every pass at gameplay camera distance.

Do not:

- add imported textures, models, webfonts, or icon sets;
- use pure white as the main light color;
- surround every panel with fantasy metalwork;
- add bloom-heavy post-processing;
- fill empty grass with unrelated props;
- treat a new palette as a complete character identity.

## Rules for future content

- Extend typed content only for visuals the wave actually uses.
- Reuse the character factory before adding a one-off model path.
- Select a primary silhouette feature and at most two accessories per important NPC.
- Add world details through authored visual data and shared procedural renderers.
- Preserve the mint/gold meaning and the split-shard/lantern vocabulary.
- Profile draw calls and lights before adding more transparent or emissive geometry.

## Visual checklist for future waves

- [ ] Important characters are distinguishable in silhouette at gameplay distance.
- [ ] New UI uses existing tokens and remains readable on narrow and short viewports.
- [ ] Magical light is mint, lantern warmth is gold, and neither clips to white.
- [ ] Split-shard or lantern motifs are reused consistently.
- [ ] The objective, prompt, dialogue, and feedback hierarchy remains clear.
- [ ] Repeated world details are instanced and materials are shared.
- [ ] Reduced motion, focus visibility, live feedback, and contrast still work.
- [ ] Gameplay, lifecycle, hot reload, automated checks, and performance remain intact.
