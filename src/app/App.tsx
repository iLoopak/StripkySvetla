import { GameCanvas } from "../game/GameCanvas";
import { DialogueOverlay } from "../ui/DialogueOverlay";
import { GameHud } from "../ui/GameHud";
import { LoadingScreen } from "../ui/LoadingScreen";
import { MapTransitionOverlay } from "../ui/MapTransitionOverlay";
import { StartMenu } from "../ui/StartMenu";
import { useGameStore } from "../state/gameStore";

export function App() {
  const gameStarted = useGameStore((state) => state.gameStarted);

  return (
    <main className="game-shell">
      {gameStarted ? (
        <>
          <GameCanvas />
          <GameHud />
          <DialogueOverlay />
          <MapTransitionOverlay />
          <LoadingScreen />
        </>
      ) : (
        <StartMenu />
      )}
    </main>
  );
}
