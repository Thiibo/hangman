import words from 'an-array-of-english-words';
import { pickRandomItemFromArray } from './helper-functions';
const letters = "abcdefghijklmnopqrstuvwxyz"

export class HangmanGame {
    private secretWord: string;
    private guessedLetters: Map<string, boolean>;
    private wrongGuessesLeft: number;

    constructor() {
        this.secretWord = pickRandomItemFromArray(words);
        this.guessedLetters = new Map();
        this.wrongGuessesLeft = 3;
        Array.from(letters).forEach(letter => this.guessedLetters.set(letter, false));
    }

    get currentWordStatus() {
        return Array.from(this.secretWord).map(letter => this.guessedLetters.get(letter) ? letter : '_').join('');
    }

    get isLost() {
        return this.wrongGuessesLeft < 1;
    }

    guess(guessedLetter: string) {
        if (guessedLetter.length !== 1 || !letters.includes(guessedLetter)) {
            throw Error(`Incorrect argument: ${guessedLetter}. Please provide a single English letter.`);
        }

        this.guessedLetters.set(guessedLetter, true);
        if (!this.secretWord.includes(guessedLetter)) this.wrongGuessesLeft--;
    }
}
