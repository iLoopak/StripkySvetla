import { useGameStore } from "../state/gameStore";

export function LoadingScreen() {
  const status = useGameStore((state) => state.status);
  const errorMessage = useGameStore((state) => state.errorMessage);

  if (status === "ready") {
    return null;
  }

  return (
    <section className={`loading-screen loading-screen--${status}`} role="status">
      <div className="loading-crystal" aria-hidden="true" />
      {status === "booting" ? (
        <>
          <p className="eyebrow">Střípky světla</p>
          <h2>Světlo se probouzí…</h2>
        </>
      ) : (
        <>
          <p className="eyebrow">Scénu se nepodařilo spustit</p>
          <h2>Zkontrolujte podporu WebGL a zkuste stránku obnovit.</h2>
          <p className="error-detail">{errorMessage}</p>
        </>
      )}
    </section>
  );
}
