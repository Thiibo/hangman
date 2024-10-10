"use client";
import { useCallback, useEffect, useState } from "react";
import { letters } from "../modules/constants";
import { pickRandomItemFromArray } from "../modules/helper-functions";
import words from 'an-array-of-english-words';
import { RagdollSimulation } from "../modules/ragdoll";

export function Game() {
    const [secretWord, setSecretWord] = useState<string>('');
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [simulation, setSimulation] = useState<RagdollSimulation>();
    const [wins, setWins] = useState<number>(0);
    const [losses, setLosses] = useState<number>(0);


    useEffect(() => {
        resetGame();

        const simulation = new RagdollSimulation(document.querySelector('#ragdoll') as HTMLElement);
        setSimulation(simulation);
        simulation.attach();
    });

    function resetGame() {
        setSecretWord(pickRandomItemFromArray(words));
        setGuessedLetters([]);
        if (simulation) simulation.resetStages();
    }

    const getCurrentWordStatus = useCallback(() => {
        return Array.from(secretWord).map(letter => guessedLetters.includes(letter) ? letter : null);
    }, [secretWord, guessedLetters])

    function guess(guessedLetter: string) {
        if (!simulation) return;
        if (guessedLetter.length !== 1 || !letters.includes(guessedLetter)) {
            throw Error(`Incorrect argument: ${guessedLetter}. Please provide a single English letter.`);
        }

        const newGuessedLetters = [...guessedLetters, guessedLetter];
        setGuessedLetters(newGuessedLetters);
        if (secretWord.includes(guessedLetter)) {
            if (Array.from(secretWord).every(letter => newGuessedLetters.includes(letter))) {
                setWins(wins + 1);
                resetGame();
            }
        } else {
            simulation.nextStage();

            if (simulation.isFinalStage) {
                setLosses(losses + 1);
                simulation.obliterateRagdoll();
                setGuessedLetters(letters.split(''));
                setTimeout(resetGame, 2000);
            }
        }
    }

    return (
        <div className="w-full flex flex-col gap-20 row-start-2 items-center">
            <WordStateDisplay currentWordStatus={getCurrentWordStatus()} />
            <Keyboard guessedLetters={guessedLetters} guessLetter={guess} />
            <Scoreboard wins={wins} losses={losses} />
        </div>
    )
}

function WordStateDisplay({ currentWordStatus } : { currentWordStatus: (string | null)[] }) {
    const letters = currentWordStatus.map((letter, i) => (
      <div key={i} className={`p-2 h-30 w-30 text-6xl border-b-4 white ${letter ? 'text-white' : 'text-gray-800'}`}>{letter ?? "?"}</div>
    ));
  
    return (
      <div className="row-start-3 flex gap-10 flex-wrap items-center justify-center">
        {letters}
      </div>
    )
  }
  
function Keyboard({ guessedLetters, guessLetter } : { guessedLetters: string[], guessLetter: (letter: string) => void }) {
    const keys = Array.from(letters).map(letter => (
        <button key={letter} disabled={guessedLetters.includes(letter)} onClick={() => guessLetter(letter)}>{letter}</button>
    ));

    return (
        <div className="grid grid-cols-13">{keys}</div>
    )
}

function Scoreboard({ wins, losses } : { wins: number, losses: number }) {
    return (
        <div className="fixed bottom-16 right-16 flex flex-col gap-5 text-3xl">
            <span title="Wins" className="wins flex gap-5">{wins}</span>
            <span title="Losses" className="losses flex gap-5">{losses}</span>
        </div>
    )
}
