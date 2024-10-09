import Image from "next/image";
import { HangmanGame } from "./modules/game";

export default function Home() {
  const game = new HangmanGame();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <WordStateDisplay game={game} />
      </main>
      <footer className="row-start-3 flex gap-2 flex-wrap items-center justify-center">
        Made by <a className="text-orange-600" href="https://github.com/Thiibo">Thiibo</a>
      </footer>
    </div>
  );
}

function WordStateDisplay({ game } : { game: HangmanGame }) {
  const letters = Array.from(game.currentWordStatus).map(letter => (
    <div className="p-6 text-6xl">{letter}</div>
  ));

  return (
    <div className="row-start-3 flex gap-2 flex-wrap items-center justify-center">
      {letters}
    </div>
  )
}
