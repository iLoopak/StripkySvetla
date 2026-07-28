import { GameCanvas } from "../game/GameCanvas";
import { DialogueOverlay } from "../ui/DialogueOverlay";
import { GameHud } from "../ui/GameHud";
import { LoadingScreen } from "../ui/LoadingScreen";

export function App() {
  return (
    <main className="game-shell">
      <GameCanvas />
      <GameHud />
      <DialogueOverlay />
      <LoadingScreen />
    </main>
  );
}
