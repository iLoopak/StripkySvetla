import { GameCanvas } from "../game/GameCanvas";
import { GameHud } from "../ui/GameHud";
import { LoadingScreen } from "../ui/LoadingScreen";

export function App() {
  return (
    <main className="game-shell">
      <GameCanvas />
      <GameHud />
      <LoadingScreen />
    </main>
  );
}
