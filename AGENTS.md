# Contributor instructions

- Write source code, filenames, technical documentation, and commit messages in English.
- Keep player-facing copy in Czech until the project adopts a localization system.
- Use strict TypeScript. Avoid `any` unless a concrete integration makes it unavoidable and
  the reason is documented.
- Keep game logic and the Babylon.js lifecycle separate from React UI.
- Use Zustand only for state shared with the UI; do not drive the render loop through React.
- Design future content to be data-driven, but do not add empty abstractions before they are
  needed.
- Do not add external art, audio, model, or texture assets without an explicit project
  decision.
- Keep every Wave tightly scoped. Do not pre-implement systems assigned to later Waves.
- Every change must pass typecheck, lint, tests, and the production build.
- Fix warnings at their source. Do not hide them with indiscriminate `eslint-disable`
  comments.
- Keep story transitions and objective selection out of React components.
- Keep authored map, entity, interaction, dialogue, and objective content separate from
  Babylon runtime code.
- Route new proximity interactions through the shared interaction system.
- Give every important character a recognizable silhouette, not only a different palette.
- Use 2D side-view pixel sprites for humanoid characters unless an explicit project
  decision chooses a different visual direction.
- New humanoid sprites must have a transparent background, face right in side view, use a
  limited palette, and retain a readable silhouette at gameplay scale.
- Add only project-owned or explicitly approved visual assets after checking their style,
  alpha edges, scale, and in-game readability; never accept random external assets as-is.
- Treat light, lanterns, and split shards as the primary recurring visual motifs.
- Build new UI from the centralized design tokens instead of repeating visual constants.
- Keep glow restrained and avoid ornate fantasy frames that compete with gameplay.
- Preserve gameplay clarity and performance when adding visual polish.
