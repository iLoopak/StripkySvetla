import { useState } from "react";
import { useGameStore } from "../state/gameStore";
import { LightShardMark } from "./LightShardMark";

export function StartMenu() {
  const [confirmingNewGame, setConfirmingNewGame] = useState(false);
  const saveAvailable = useGameStore((state) => state.saveAvailable);
  const errorMessage = useGameStore((state) => state.errorMessage);
  const startNewGame = useGameStore((state) => state.startNewGame);
  const continueGame = useGameStore((state) => state.continueGame);

  const requestNewGame = () => {
    if (saveAvailable && !confirmingNewGame) {
      setConfirmingNewGame(true);
      return;
    }
    startNewGame();
  };

  return (
    <section className="start-menu" aria-label="Hlavní nabídka">
      <div className="start-menu__lantern" aria-hidden="true">
        <LightShardMark />
      </div>
      <p className="eyebrow">Kapitola 1 · Den, kdy tráva zešedla</p>
      <h1>Střípky světla</h1>
      <p className="start-menu__subtitle">Zmizelé stužky</p>

      <div className="start-menu__actions">
        {saveAvailable ? (
          <button type="button" className="start-menu__primary" onClick={continueGame}>
            Pokračovat
          </button>
        ) : null}
        <button type="button" onClick={requestNewGame}>
          {confirmingNewGame ? "Potvrdit novou hru" : "Nová hra"}
        </button>
        {confirmingNewGame ? (
          <button
            type="button"
            className="start-menu__quiet"
            onClick={() => setConfirmingNewGame(false)}
          >
            Zachovat uložený postup
          </button>
        ) : null}
      </div>
      {confirmingNewGame ? (
        <p className="start-menu__warning">Nová hra nahradí současný uložený postup.</p>
      ) : null}
      {errorMessage ? <p className="error-detail">{errorMessage}</p> : null}
    </section>
  );
}
