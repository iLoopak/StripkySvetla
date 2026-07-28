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
