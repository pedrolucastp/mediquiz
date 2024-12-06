// script.js
import { allWords } from '../vocabulary/vocabulary.js';
import { initializeSelectors } from '../components/selectorsComponent.js';

// Selecionar elementos DOM
const gameGrid = document.getElementById('game-grid');
const wordListElement = document.getElementById('word-list');
const statusDisplay = document.getElementById('status');

// Inicializar os seletores de especialidade e dificuldade
initializeSelectors(handleSpecialtyChange, handleDifficultyChange);

// Variáveis do jogo
let gameWords = [];
let grid = [];
const GRID_WIDTH = 12;
const GRID_HEIGHT = 24;
let selectedCells = [];
let foundWords = [];
let score = 0;

// Função para iniciar o jogo
function createGame() {
    // Resetar variáveis
    gameGrid.innerHTML = '';
    wordListElement.innerHTML = '';
    statusDisplay.textContent = '';
    selectedCells = [];
    foundWords = [];
    score = 0;

    // Obter palavras com base nos seletores
    const specialtySelect = document.getElementById('specialty-select');
    const difficultySelect = document.getElementById('difficulty-select');

    let selectedSpecialty = specialtySelect.value;
    let selectedDifficulty = difficultySelect.value;

    let filteredWords = allWords.filter(wordObj => wordObj.isActive);

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

    // Filtrar palavras que cabem na grade (horizontal e vertical)
    filteredWords = filteredWords.filter(wordObj =>
        wordObj.word.length <= GRID_WIDTH && wordObj.word.length <= GRID_HEIGHT
    );

    if (filteredWords.length < 10) {
        alert('Não há palavras suficientes para iniciar o jogo. Por favor, ajuste os filtros ou adicione mais palavras que caibam na grade.');
        return;
    }

    // Selecionar 10 palavras aleatórias
    filteredWords.sort(() => 0.5 - Math.random());
    gameWords = filteredWords.slice(0, 10);

    // Preencher a grade com letras aleatórias
    grid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(''));

    // Inserir as palavras na grade
    gameWords.forEach(wordObj => {
        placeWordInGrid(wordObj.word.toUpperCase());
    });

    // Preencher células vazias com letras aleatórias
    fillEmptyCells();

    // Renderizar a grade
    renderGrid();

    // Renderizar a lista de palavras
    renderWordList();
}

// Função para colocar uma palavra na grade
function placeWordInGrid(word) {
    const directions = ['horizontal', 'vertical'];
    
    // Filtrar direções onde a palavra cabe
    const possibleDirections = directions.filter(direction => {
        if (direction === 'horizontal' && word.length <= GRID_WIDTH) {
            return true;
        }
        if (direction === 'vertical' && word.length <= GRID_HEIGHT) {
            return true;
        }
        return false;
    });

    if (possibleDirections.length === 0) {
        console.error(`A palavra "${word}" é muito longa para caber na grade.`);
        return;
    }

    let placed = false;
    let attempts = 0;
    const maxAttempts = 100; // Prevenção de loop infinito

    while (!placed && attempts < maxAttempts) {
        attempts++;
        const direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        const wordLength = word.length;

        let row, col;

        if (direction === 'horizontal') {
            row = getRandomInt(0, GRID_HEIGHT - 1);
            col = getRandomInt(0, GRID_WIDTH - wordLength);
        } else { // vertical
            row = getRandomInt(0, GRID_HEIGHT - wordLength);
            col = getRandomInt(0, GRID_WIDTH - 1);
        }

        // Verificar se a palavra cabe na posição escolhida
        let canPlace = true;
        for (let i = 0; i < wordLength; i++) {
            let currentRow = row;
            let currentCol = col;

            if (direction === 'horizontal') {
                currentCol += i;
            } else { // vertical
                currentRow += i;
            }

            // Verificar se a célula está vazia ou contém a mesma letra
            if (grid[currentRow][currentCol] !== '' && grid[currentRow][currentCol] !== word[i]) {
                canPlace = false;
                break;
            }
        }

        if (canPlace) {
            // Inserir a palavra na grade
            for (let i = 0; i < wordLength; i++) {
                let currentRow = row;
                let currentCol = col;

                if (direction === 'horizontal') {
                    currentCol += i;
                } else { // vertical
                    currentRow += i;
                }

                grid[currentRow][currentCol] = word[i];
            }
            placed = true;
        }
    }

    if (!placed) {
        console.error(`Não foi possível posicionar a palavra "${word}" após ${maxAttempts} tentativas.`);
    }
}

// Função para preencher células vazias com letras aleatórias
function fillEmptyCells() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            if (grid[row][col] === '') {
                grid[row][col] = letters.charAt(Math.floor(Math.random() * letters.length));
            }
        }
    }
}

// Função para renderizar a grade
function renderGrid() {
    gameGrid.innerHTML = '';
    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.textContent = grid[row][col];
            cell.dataset.row = row;
            cell.dataset.col = col;
            gameGrid.appendChild(cell);
        }
    }
}

// Função para renderizar a lista de palavras
function renderWordList() {
    wordListElement.innerHTML = '';
    gameWords.forEach(wordObj => {
        const li = document.createElement('li');
        li.textContent = wordObj.word.toUpperCase();
        li.id = `word-${wordObj.word}`;
        const span = document.createElement('span');
        span.textContent = wordObj.clue;
        span.id = `clue-${wordObj.word}`;
        li.appendChild(span);
        wordListElement.appendChild(li);
    });
}

// Função para obter um número inteiro aleatório entre min e max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Função para lidar com mudanças nos seletores
function handleSpecialtyChange() {
    createGame();
}

function handleDifficultyChange() {
    createGame();
}

// Evento de clique nas células da grade
gameGrid.addEventListener('click', handleCellClick);

// Função para lidar com o clique nas células
function handleCellClick(event) {
    const cell = event.target.closest('.cell');
    if (!cell || cell.classList.contains('found')) return;

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    // Verificar se a célula já está selecionada
    if (selectedCells.some(c => c.row === row && c.col === col)) {
        // Desselecionar a célula
        selectedCells = selectedCells.filter(c => !(c.row === row && c.col === col));
        cell.classList.remove('selected');
    } else {
        // Selecionar a célula
        selectedCells.push({ row, col });
        cell.classList.add('selected');

        // Verificar se há exatamente 2 células selecionadas
        if (selectedCells.length === 2) {
            checkSelectedWord();
        }
    }
}

// Função para verificar a palavra selecionada
function checkSelectedWord() {
    if (selectedCells.length !== 2) return;

    const [first, second] = selectedCells;

    // Verificar se estão na mesma linha ou coluna
    const sameRow = first.row === second.row;
    const sameCol = first.col === second.col;

    if (!sameRow && !sameCol) {
        // Seleções inválidas
        statusDisplay.textContent = `Selecione duas letras na mesma linha ou coluna.`;
        resetSelection();
        return;
    }

    // Determinar a direção e ordenar as células
    let word = '';
    let cellsToCheck = [];

    if (sameRow) {
        // Ordenar por coluna
        const [left, right] = first.col < second.col ? [first, second] : [second, first];
        for (let c = left.col; c <= right.col; c++) {
            word += grid[left.row][c];
            cellsToCheck.push({ row: left.row, col: c });
        }
    } else if (sameCol) {
        // Ordenar por linha
        const [top, bottom] = first.row < second.row ? [first, second] : [second, first];
        for (let r = top.row; r <= bottom.row; r++) {
            word += grid[r][top.col];
            cellsToCheck.push({ row: r, col: top.col });
        }
    }

    const upperWord = word.toUpperCase();
    const reversedWord = upperWord.split('').reverse().join('');

    // Verificar se a palavra está na lista de palavras do jogo
    const foundWord = gameWords.find(wordObj =>
        wordObj.word.toUpperCase() === upperWord ||
        wordObj.word.toUpperCase() === reversedWord
    );

    if (foundWord && !foundWords.includes(foundWord.word.toUpperCase())) {
        // Palavra encontrada
        foundWords.push(foundWord.word.toUpperCase());
        score += 10; // Pontuação por encontrar uma palavra

        // Marcar as células como encontradas
        cellsToCheck.forEach(c => {
            const cell = document.querySelector(`.cell[data-row='${c.row}'][data-col='${c.col}']`);
            if (cell) {
                cell.classList.add('found');
                cell.classList.remove('selected');
            }
        });

        // Atualizar a lista de palavras
        const wordItem = document.getElementById(`word-${foundWord.word}`);
        if (wordItem) {
            wordItem.classList.add('found');
        }

        // Atualizar o status
        statusDisplay.textContent = `Você encontrou: ${foundWord.word.toUpperCase()}`;

        // Resetar as células selecionadas
        selectedCells = [];

        // Verificar se todas as palavras foram encontradas
        if (foundWords.length === gameWords.length) {
            setTimeout(() => {
                alert(`Parabéns! Você encontrou todas as palavras com ${score} pontos.`);
                createGame();
            }, 500);
        }
    } else {
        // Palavra não encontrada
        score -= 1; // Penalização por tentativa incorreta
        statusDisplay.textContent = `Palavra não encontrada: ${upperWord}`;

        // Desselecionar as células após uma breve pausa
        setTimeout(() => {
            cellsToCheck.forEach(c => {
                const cell = document.querySelector(`.cell[data-row='${c.row}'][data-col='${c.col}']`);
                if (cell) {
                    cell.classList.remove('selected');
                }
            });
            selectedCells = [];
        }, 1000);
    }

    // Atualizar a pontuação no título ou em outro local se necessário
    // Por exemplo, você pode adicionar um elemento para exibir a pontuação
}

// Função para resetar a seleção
function resetSelection() {
    selectedCells.forEach(c => {
        const cell = document.querySelector(`.cell[data-row='${c.row}'][data-col='${c.col}']`);
        if (cell) {
            cell.classList.remove('selected');
        }
    });
    selectedCells = [];
}

// Iniciar o jogo ao carregar a página
document.addEventListener('DOMContentLoaded', createGame);
