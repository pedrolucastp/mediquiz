// hangman.js

import { allWords } from '../vocabulary/vocabulary.js';
import { initializeSelectors } from '../components/selectorsComponent.js';

document.addEventListener('DOMContentLoaded', () => {
    // Seletores de elementos (sem mudanças)
    const startGameBtn = document.getElementById('start-game-btn');
    const gameContainer = document.getElementById('game-container');
    const hangmanSvg = document.getElementById('hangman-svg');
    const wordContainer = document.getElementById('word-container');
    const clueContainer = document.getElementById('clue-container');
    const wrongGuessesSpan = document.getElementById('wrong-guesses');
    const maxErrorsSpan = document.getElementById('max-errors');
    const wrongLettersSpan = document.getElementById('wrong-letters');
    const guessContainer = document.getElementById('guess-container');
    const guessInput = document.getElementById('guess-input');
    const guessBtn = document.getElementById('guess-btn');
    const messageContainer = document.getElementById('message-container');
    const restartBtn = document.getElementById('restart-btn');

    // Variáveis do jogo
    let selectedWord = '';
    let selectedClue = '';
    let displayedWord = [];
    let wrongGuesses = 0;
    const maxErrors = 6;
    let wrongLetters = [];

    // Mapeamento de letras sem acento para suas formas acentuadas
    const accentMap = {
        A: ['Á', 'À', 'Â', 'Ã', 'Ä'],
        E: ['É', 'È', 'Ê', 'Ë'],
        I: ['Í', 'Ì', 'Î', 'Ï'],
        O: ['Ó', 'Ò', 'Ô', 'Õ', 'Ö'],
        U: ['Ú', 'Ù', 'Û', 'Ü'],
        C: ['Ç']
    };

    // Inicializar os seletores de especialidade e dificuldade
    initializeSelectors(startGame, startGame);

    // Função para iniciar o jogo
    function startGame() {
        // Resetar variáveis
        wrongGuesses = 0;
        wrongLetters = [];
        wrongGuessesSpan.textContent = wrongGuesses;
        wrongLettersSpan.textContent = '';
        messageContainer.textContent = '';
        restartBtn.style.display = 'none';
        gameContainer.style.display = 'flex';
        guessContainer.style.display = 'flex';

        
    
        // Selecionar palavra com base nos filtros
        const specialtySelect = document.getElementById('specialty-select');
        const difficultySelect = document.getElementById('difficulty-select');
    
        const selectedSpecialty = specialtySelect.value;
        const selectedDifficulty = difficultySelect.value;
    
        let filteredWords = allWords;
    
        if (selectedSpecialty !== 'all') {
            filteredWords = filteredWords.filter(wordObj => wordObj.specialties.includes(parseInt(selectedSpecialty)));
        }
    
        if (selectedDifficulty !== 'all') {
            filteredWords = filteredWords.filter(wordObj => wordObj.difficulty === parseInt(selectedDifficulty));
        }
    
        if (filteredWords.length === 0) {
            alert('Nenhuma palavra encontrada com os filtros selecionados.');
            gameContainer.style.display = 'none';
            return;
        }
    
        // Selecionar aleatoriamente uma palavra
        const randomIndex = Math.floor(Math.random() * filteredWords.length);
        selectedWord = filteredWords[randomIndex].word.toUpperCase();
        selectedClue = filteredWords[randomIndex].clue;
    
        // Atualizar a lógica para exibir apenas caracteres especiais
        displayedWord = selectedWord.split('').map(char => {
            if (char.match(/[\s\-]/)) {
                return char; // Revelar espaços e hifens
            }
            return '_'; // Ocultar todas as letras, incluindo acentuadas
        });
    
        // Atualizar o display da palavra
        renderClue();
        renderWord();
    
        // Resetar a figura da forca
        resetHangmanFigure();
    
        // Focar no input de chute
        guessInput.value = '';
        guessInput.focus();
    }
    

    // Função para renderizar a palavra
    function renderWord() {
        wordContainer.innerHTML = '';
        displayedWord.forEach(letter => {
            const letterSpan = document.createElement('span');
            letterSpan.textContent = letter;
            letterSpan.classList.add('letter');
            wordContainer.appendChild(letterSpan);
        });
    }

    // Função para renderizar a dica
    function renderClue() {
        clueContainer.textContent = selectedClue;
    }

    // Função para lidar com o chute
    function handleGuess() {
        const guess = guessInput.value.toUpperCase();
        guessInput.value = '';
        guessInput.focus();

        if (!/^[A-Z]$/.test(guess)) {
            alert('Por favor, insira uma única letra de A a Z.');
            return;
        }

        if (displayedWord.includes(guess) || wrongLetters.includes(guess)) {
            alert('Você já chutou essa letra.');
            return;
        }

        // Verificar correspondência considerando acentos
        let matched = false;
        selectedWord.split('').forEach((letter, index) => {
            if (
                letter === guess || // Correspondência direta
                (accentMap[guess] && accentMap[guess].includes(letter)) // Correspondência com acentos
            ) {
                displayedWord[index] = letter; // Exibir a letra com acento
                matched = true;
            }
        });

        if (matched) {
            renderWord();

            // Verificar vitória (todas as letras encontradas)
            if (!displayedWord.includes('_')) {
                messageContainer.textContent = 'Parabéns! Você ganhou!';
                restartBtn.style.display = 'block';
            }
        } else {
            // Chute incorreto
            wrongGuesses++;
            wrongGuessesSpan.textContent = wrongGuesses;
            wrongLetters.push(guess);
            wrongLettersSpan.textContent = wrongLetters.join(', ');

            updateHangmanFigure();

            // Verificar derrota
            if (wrongGuesses >= maxErrors) {
                messageContainer.textContent = `Você perdeu! A palavra era "${selectedWord}".`;
                revealWord();
                restartBtn.style.display = 'block';
                guessContainer.style.display = 'none';
            }
        }
    }

    // Função para revelar a palavra após derrota
    function revealWord() {
        displayedWord = selectedWord.split('');
        renderWord();
    }

    // Função para reiniciar o jogo
    function restartGame() {
        startGame();
    }

    // Função para atualizar a figura da forca
    function updateHangmanFigure() {
        const parts = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];
        if (wrongGuesses > 0 && wrongGuesses <= parts.length) {
            const part = document.getElementById(parts[wrongGuesses - 1]);
            if (part) {
                part.style.display = 'block';
            }
        }
    }

    // Função para resetar a figura da forca
    function resetHangmanFigure() {
        const parts = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];
        parts.forEach(partId => {
            const part = document.getElementById(partId);
            if (part) {
                part.style.display = 'none';
            }
        });
    }

    // Adicionar eventos
    guessBtn.addEventListener('click', handleGuess);
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleGuess();
        }
    });
    restartBtn.addEventListener('click', restartGame);

    // Inicializar o jogo
    startGame();
});
