"use client";
import { useCallback, useEffect, useState } from "react";
import { letters } from "../modules/constants";
import { pickRandomItemFromArray } from "../modules/helper-functions";
import words from 'an-array-of-english-words';
import { createSimulation } from "../modules/ragdoll";

export function Game() {
    const [secretWord, setSecretWord] = useState<string>('');
    const [wrongGuessesLeft, setWrongGuessesLeft] = useState<number>(0);
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);

    useEffect(() => {
        resetGame();
        createSimulation();
    }, []);

    function resetGame() {
        setSecretWord(pickRandomItemFromArray(words));
        setWrongGuessesLeft(3);
        setGuessedLetters([]);
    }

    const getCurrentWordStatus = useCallback(() => {
        return Array.from(secretWord).map(letter => guessedLetters.includes(letter) ? letter : null);
    }, [secretWord, guessedLetters])

    function isLost() {
        return wrongGuessesLeft < 1;
    }

    function guess(guessedLetter: string) {
        if (guessedLetter.length !== 1 || !letters.includes(guessedLetter)) {
            throw Error(`Incorrect argument: ${guessedLetter}. Please provide a single English letter.`);
        }

        setGuessedLetters([...guessedLetters, guessedLetter]);
        if (!secretWord.includes(guessedLetter)) setWrongGuessesLeft(wrongGuessesLeft - 1);
    }

    return (
        <div className="w-full flex flex-col gap-20 row-start-2 items-center">
            <WordStateDisplay currentWordStatus={getCurrentWordStatus()} />
            <Keyboard guessedLetters={guessedLetters} guessLetter={guess} />
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
