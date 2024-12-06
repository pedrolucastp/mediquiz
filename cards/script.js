// memoryGame.js
import { allWords } from '../vocabulary/vocabulary.js';
import { initializeSelectors } from '../components/selectorsComponent.js';

// Selecionar os elementos DOM
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const definitionDisplay = document.getElementById('definition'); // Novo elemento para definição

// Inicializar os seletores de especialidade e dificuldade
initializeSelectors(handleSpecialtyChange, handleDifficultyChange);

// Variáveis do jogo
let firstCard = null;
let secondCard = null;
let count = 0;
let matchedCards = [];
let score = 0;
let gameWords = [];
let currentDefinitionWord = null;
let availableDefinitions = [];

// Criar o tabuleiro do jogo
function createBoard() {
    gameBoard.innerHTML = '';
    matchedCards = [];
    score = 0;
    scoreDisplay.textContent = `Clicks ${score}`;
    definitionDisplay.textContent = ''; // Resetar definição

    // Obter palavras com base na especialidade e dificuldade selecionadas
    const specialtySelect = document.getElementById('specialty-select');
    const difficultySelect = document.getElementById('difficulty-select');
    
    let selectedSpecialty = specialtySelect.value;
    let selectedDifficulty = difficultySelect.value;

    let filteredWords = allWords.filter(wordObj => wordObj.isActive); // Considerar apenas palavras ativas

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

    // Se não houver palavras suficientes, usar todas as palavras ativas
    if (filteredWords.length < 2) {
        alert('Não há palavras suficientes para iniciar o jogo. Por favor, ajuste os filtros.');
        return;
    }

    // Embaralhar as palavras e selecionar 8 palavras aleatórias (total de 16 cartas)
    filteredWords.sort(() => 0.5 - Math.random());
    gameWords = filteredWords.slice(0, 8);

    // Preparar definições disponíveis
    availableDefinitions = [...gameWords]; // Clone do array

    // Selecionar a primeira definição
    selectNextDefinition();

    // Criar pares de palavras
    let gameCards = gameWords.concat(gameWords);
    // Embaralhar as cartas
    gameCards.sort(() => 0.5 - Math.random());

    gameCards.forEach((wordObj, i) => {
        const card = document.createElement('div');
        card.classList.add('card');

        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        cardFront.textContent = ''; // Pode adicionar uma imagem ou símbolo aqui

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

// Selecionar a próxima definição a ser exibida
function selectNextDefinition() {
    if (availableDefinitions.length === 0) {
        // Todas as definições foram usadas
        definitionDisplay.textContent = 'Todas as palavras foram encontradas!';
        return;
    }

    // Selecionar uma definição aleatória das disponíveis
    availableDefinitions.sort(() => 0.5 - Math.random());
    currentDefinitionWord = availableDefinitions.pop();
    definitionDisplay.textContent = `${currentDefinitionWord.clue}`;
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

    // Incrementar o score por cada tentativa (cada clique válido)
    score += 1;
    scoreDisplay.textContent = `Pontuação: ${score}`;

    if (count < 2) {
        count++;
        if (count === 1) {
            firstCard = clicked;
            firstCard.classList.add('flipped');
        } else {
            secondCard = clicked;
            secondCard.classList.add('flipped');

            // Verificar se as duas cartas correspondem à palavra da definição
            const firstWord = firstCard.dataset.word;
            const secondWord = secondCard.dataset.word;

            if (firstWord === currentDefinitionWord.word && secondWord === currentDefinitionWord.word) {
                // Par correto
                matchedCards.push(firstCard, secondCard);
                resetGuesses();

                // Verificar se todas as cartas foram combinadas
                if (matchedCards.length === gameWords.length * 2) {
                    setTimeout(() => {
                        alert(`Parabéns! Você encontrou todos os pares com ${score} tentativas.`);
                        // Reiniciar o jogo
                        createBoard();
                    }, 500);
                } else {
                    // Selecionar a próxima definição
                    setTimeout(() => {
                        selectNextDefinition();
                    }, 500);
                }
            } else {
                // Par incorreto
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

// Atualizar o jogo ao mudar as opções
function handleSpecialtyChange() {
    createBoard();
}

function handleDifficultyChange() {
    createBoard();
}

// Evento de clique nas cartas
gameBoard.addEventListener('click', flipCard);

// Iniciar o jogo
createBoard();
