import { Game } from "./components/Game";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="h-full">
        <Game />
      </main>
      <footer className="row-start-3 flex gap-2 flex-wrap items-center justify-center">
        Made by <a className="text-orange-600" href="https://github.com/Thiibo">Thiibo</a>
      </footer>
      <div id="ragdoll" className="fixed inset-0 bg-gray-500 -z-10"></div>
    </div>
  );
}
