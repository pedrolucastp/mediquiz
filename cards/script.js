import { allWords, specialties } from "../vocabulary/vocabulary.js";

// Selecionar os elementos DOM
const specialtySelect = document.getElementById('specialty-select');
const difficultySelect = document.getElementById('difficulty-select');
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');

// Preencher as opções de especialidades
function populateSpecialties() {
    specialties.forEach((specialty, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = specialty;
        specialtySelect.appendChild(option);
    });
}

// Variáveis do jogo
let firstCard = null;
let secondCard = null;
let count = 0;
let matchedCards = [];
let score = 0;
let gameWords = [];

// Criar o tabuleiro do jogo
function createBoard() {
    gameBoard.innerHTML = '';
    matchedCards = [];
    score = 0;
    scoreDisplay.textContent = `Pontuação: ${score}`;

    // Obter palavras com base na especialidade e dificuldade selecionadas
    let selectedSpecialty = specialtySelect.value;
    let selectedDifficulty = difficultySelect.value;

    let filteredWords = allWords;

    if (selectedSpecialty !== 'all') {
        filteredWords = filteredWords.filter(wordObj =>
            wordObj.specialties.includes(parseInt(selectedSpecialty))
        );
    }

    if (selectedDifficulty !== 'all') {
        filteredWords = filteredWords.filter(wordObj =>
            wordObj.difficulty === parseInt(selectedDifficulty)
        );
    }

    // Se não houver palavras suficientes, usar todas as palavras
    if (filteredWords.length < 8) {
        filteredWords = allWords;
    }

    // Embaralhar as palavras e selecionar 8 palavras aleatórias
    filteredWords.sort(() => 0.5 - Math.random());
    gameWords = filteredWords.slice(0, 8);

    // Criar pares de palavras
    let gameCards = gameWords.concat(gameWords);
    // Embaralhar as cartas
    gameCards.sort(() => 0.5 - Math.random());

    gameCards.forEach(wordObj => {
        const card = document.createElement('div');
        card.classList.add('card');

        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        cardFront.textContent = '?';

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.textContent = wordObj.word;

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);

        card.dataset.word = wordObj.word;

        gameBoard.appendChild(card);
    });
}

// Lógica ao clicar na carta
function flipCard(event) {
    const clicked = event.target.closest('.card');

    if (
        clicked === null ||
        clicked.classList.contains('flipped') ||
        matchedCards.includes(clicked)
    ) {
        return;
    }

    if (count < 2) {
        count++;
        if (count === 1) {
            firstCard = clicked;
            firstCard.classList.add('flipped');
        } else {
            secondCard = clicked;
            secondCard.classList.add('flipped');

            if (firstCard.dataset.word === secondCard.dataset.word) {
                matchedCards.push(firstCard, secondCard);
                updateScore();
                resetGuesses();

                // Verificar se todas as cartas foram combinadas
                if (matchedCards.length === gameWords.length * 2) {
                    setTimeout(() => {
                        alert('Parabéns! Você encontrou todos os pares.');
                        // Reiniciar o jogo
                        createBoard();
                    }, 500);
                }
            } else {
                setTimeout(unflipCards, 1000);
            }
        }
    }
}

function unflipCards() {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetGuesses();
}

function resetGuesses() {
    count = 0;
    firstCard = null;
    secondCard = null;
}

function updateScore() {
    score += 10;
    scoreDisplay.textContent = `Pontuação: ${score}`;
}

// Atualizar o jogo ao mudar as opções
specialtySelect.addEventListener('change', createBoard);
difficultySelect.addEventListener('change', createBoard);

// Evento de clique nas cartas
gameBoard.addEventListener('click', flipCard);

// Iniciar o jogo
populateSpecialties();
createBoard();
