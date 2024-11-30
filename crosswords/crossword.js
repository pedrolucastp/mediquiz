// Importar o vocabulário e as especialidades
import { allWords } from '../vocabulary/vocabulary.js';
import { initializeSelectors } from '../components/selectorsComponent.js';

// Variáveis globais
let currentLevel = 1;
let usedWordIndices = [];
const GRID_ROWS = 15;
const GRID_COLS = 15;
let grid = [];
let placedWords = [];
let currentWord = null;
let currentDirection = 'across'; // Direção padrão

// Variáveis para as seleções do usuário
let selectedSpecialty = 'all';
let selectedDifficulty = 'all';

// Função para inicializar a interface
function initializeInterface() {
    // Inicializar o seletor de especialidade e dificuldade
    initializeSelectors(handleSpecialtyChange, handleDifficultyChange);

    // Inicializar as seleções com os valores padrão
    selectedSpecialty = document.getElementById('specialty-select').value;
    selectedDifficulty = document.getElementById('difficulty-select').value;

    // Exibir o jogo
    document.getElementById('crossword-container').style.display = 'flex';
    document.getElementById('check-button').style.display = 'block';

    // Iniciar o jogo imediatamente
    startLevel();

    // Adicionar evento ao botão "Verificar"
    document.getElementById('check-button').addEventListener('click', checkAnswers);
}

// Função para lidar com mudança de especialidade
function handleSpecialtyChange(event) {
    selectedSpecialty = event.target.value;
    resetGame();
    startLevel();
}

// Função para lidar com mudança de dificuldade
function handleDifficultyChange(event) {
    selectedDifficulty = event.target.value;
    resetGame();
    startLevel();
}

// Função para resetar o jogo
function resetGame() {
    currentLevel = 1;
    usedWordIndices = [];
    grid = [];
    placedWords = [];
    currentWord = null;
    currentDirection = 'across';
    document.getElementById('crossword').innerHTML = '';
    document.getElementById('clue-list').innerHTML = '';
}

// Inicializar a interface
initializeInterface();

// Funções restantes para o jogo
function initializeGrid() {
    grid = [];
    for (let i = 0; i < GRID_ROWS; i++) {
        grid.push(new Array(GRID_COLS).fill(null));
    }
    placedWords = [];
}

function getWordsForLevel(level) {
    // Calcular o número de palavras para o nível atual
    // const wordsPerLevel = 3 + Math.floor((level - 1) / 3);
    const wordsPerLevel = 4;

    // Filtrar palavras com base na especialidade e dificuldade selecionadas
    let filteredWords = allWords.filter(wordObj => {
        // Filtrar por especialidade
        let specialtyMatch = false;
        if (selectedSpecialty === 'all') {
            specialtyMatch = true;
        } else {
            const selectedSpecialtyIndex = parseInt(selectedSpecialty);
            specialtyMatch = wordObj.specialties.includes(selectedSpecialtyIndex);
        }

        // Filtrar por dificuldade
        const difficultyMatch =
            selectedDifficulty === 'all' ||
            wordObj.difficulty === parseInt(selectedDifficulty);

        return specialtyMatch && difficultyMatch;
    });

    // Obter palavras que ainda não foram usadas
    filteredWords = filteredWords.filter(wordObj => {
        return !usedWordIndices.includes(allWords.indexOf(wordObj));
    });

    // Se não houver palavras suficientes, reiniciar o jogo
    if (filteredWords.length < wordsPerLevel) {
        alert(
            'Não há palavras suficientes para as configurações selecionadas. O jogo será reiniciado.'
        );
        usedWordIndices = [];
        currentLevel = 1;
        return getWordsForLevel(currentLevel);
    }

    // Selecionar palavras aleatórias
    const wordsForLevel = [];
    for (let i = 0; i < wordsPerLevel; i++) {
        const randomIndex = Math.floor(Math.random() * filteredWords.length);
        const wordObj = filteredWords.splice(randomIndex, 1)[0];
        wordsForLevel.push(wordObj);
        usedWordIndices.push(allWords.indexOf(wordObj));
    }

    return wordsForLevel;
}

function generateCrossword(wordList) {
    initializeGrid();

    // Ordenar as palavras por tamanho (maior para menor)
    const sortedWords = [...wordList].sort(
        (a, b) => b.word.length - a.word.length
    );

    // Colocar a primeira palavra no centro horizontalmente
    const firstWord = sortedWords[0];
    const startRow = Math.floor(GRID_ROWS / 2);
    const startCol = Math.floor((GRID_COLS - firstWord.word.length) / 2);

    const positions = placeWord(firstWord.word, startRow, startCol, 'across');
    placedWords.push({
        word: firstWord.word,
        clue: firstWord.clue,
        row: startRow,
        col: startCol,
        direction: 'across',
        number: 1,
        positions: positions
    });

    let wordNumber = 2;

    // Tentar posicionar as demais palavras
    for (let i = 1; i < sortedWords.length; i++) {
        const wordObj = sortedWords[i];
        const placed = tryPlaceWord(wordObj.word);
        if (placed) {
            const positions = placeWord(
                wordObj.word,
                placed.row,
                placed.col,
                placed.direction
            );
            placedWords.push({
                word: wordObj.word,
                clue: wordObj.clue,
                row: placed.row,
                col: placed.col,
                direction: placed.direction,
                number: wordNumber,
                positions: positions
            });
            wordNumber++;
        } else {
            console.warn(
                `Não foi possível posicionar a palavra: ${wordObj.word}`
            );
        }
    }
}

function placeWord(word, row, col, direction) {
    let positions = [];
    if (direction === 'across') {
        for (let i = 0; i < word.length; i++) {
            grid[row][col + i] = word[i];
            positions.push({ row: row, col: col + i });
        }
    } else if (direction === 'down') {
        for (let i = 0; i < word.length; i++) {
            grid[row + i][col] = word[i];
            positions.push({ row: row + i, col: col });
        }
    }
    return positions;
}

function tryPlaceWord(word) {
    for (let existingWord of placedWords) {
        for (let i = 0; i < word.length; i++) {
            const letter = word[i];
            // Encontrar posições da letra nas palavras já posicionadas
            const positions = getLetterPositions(existingWord.word, letter);
            for (let pos of positions) {
                const crossRow =
                    existingWord.row +
                    (existingWord.direction === 'down' ? pos : 0);
                const crossCol =
                    existingWord.col +
                    (existingWord.direction === 'across' ? pos : 0);

                // Tentar posicionar a nova palavra cruzando na letra correspondente
                const startRow =
                    crossRow - (existingWord.direction === 'down' ? 0 : i);
                const startCol =
                    crossCol - (existingWord.direction === 'across' ? 0 : i);
                const direction =
                    existingWord.direction === 'across' ? 'down' : 'across';

                if (canPlaceWord(word, startRow, startCol, direction)) {
                    return { row: startRow, col: startCol, direction: direction };
                }
            }
        }
    }
    return null;
}

function getLetterPositions(word, letter) {
    const positions = [];
    for (let i = 0; i < word.length; i++) {
        if (word[i] === letter) {
            positions.push(i);
        }
    }
    return positions;
}

function canPlaceWord(word, row, col, direction) {
    if (direction === 'across') {
        if (
            col < 0 ||
            col + word.length > GRID_COLS ||
            row < 0 ||
            row >= GRID_ROWS
        )
            return false;

        for (let i = 0; i < word.length; i++) {
            const currentRow = row;
            const currentCol = col + i;
            const currentCell = grid[currentRow][currentCol];

            if (currentCell && currentCell !== word[i]) {
                return false;
            }

            // Verificar células acima e abaixo
            if (currentRow > 0) {
                const cellAbove = grid[currentRow - 1][currentCol];
                if (cellAbove && !isPartOfWord(currentRow - 1, currentCol)) {
                    return false;
                }
            }
            if (currentRow < GRID_ROWS - 1) {
                const cellBelow = grid[currentRow + 1][currentCol];
                if (cellBelow && !isPartOfWord(currentRow + 1, currentCol)) {
                    return false;
                }
            }
        }

        // Verificar células antes e depois da palavra
        if (col > 0) {
            const cellBefore = grid[row][col - 1];
            if (cellBefore) {
                return false;
            }
        }
        if (col + word.length < GRID_COLS) {
            const cellAfter = grid[row][col + word.length];
            if (cellAfter) {
                return false;
            }
        }
    } else if (direction === 'down') {
        if (
            row < 0 ||
            row + word.length > GRID_ROWS ||
            col < 0 ||
            col >= GRID_COLS
        )
            return false;

        for (let i = 0; i < word.length; i++) {
            const currentRow = row + i;
            const currentCol = col;
            const currentCell = grid[currentRow][currentCol];

            if (currentCell && currentCell !== word[i]) {
                return false;
            }

            // Verificar células à esquerda e à direita
            if (currentCol > 0) {
                const cellLeft = grid[currentRow][currentCol - 1];
                if (cellLeft && !isPartOfWord(currentRow, currentCol - 1)) {
                    return false;
                }
            }
            if (currentCol < GRID_COLS - 1) {
                const cellRight = grid[currentRow][currentCol + 1];
                if (cellRight && !isPartOfWord(currentRow, currentCol + 1)) {
                    return false;
                }
            }
        }

        // Verificar células antes e depois da palavra
        if (row > 0) {
            const cellBefore = grid[row - 1][col];
            if (cellBefore) {
                return false;
            }
        }
        if (row + word.length < GRID_ROWS) {
            const cellAfter = grid[row + word.length][col];
            if (cellAfter) {
                return false;
            }
        }
    }
    return true;
}

// Função para verificar se a célula faz parte de uma palavra já colocada
function isPartOfWord(row, col) {
    return placedWords.some(wordObj => {
        if (wordObj.direction === 'across') {
            if (
                row === wordObj.row &&
                col >= wordObj.col &&
                col < wordObj.col + wordObj.word.length
            ) {
                return true;
            }
        } else if (wordObj.direction === 'down') {
            if (
                col === wordObj.col &&
                row >= wordObj.row &&
                row < wordObj.row + wordObj.word.length
            ) {
                return true;
            }
        }
        return false;
    });
}

function createCrossword() {
    const crossword = document.getElementById('crossword');
    crossword.innerHTML = '';

    // Determinar os limites da grade para exibir apenas a área utilizada
    let minRow = GRID_ROWS,
        maxRow = 0,
        minCol = GRID_COLS,
        maxCol = 0;
    for (let i = 0; i < GRID_ROWS; i++) {
        for (let j = 0; j < GRID_COLS; j++) {
            if (grid[i][j]) {
                if (i < minRow) minRow = i;
                if (i > maxRow) maxRow = i;
                if (j < minCol) minCol = j;
                if (j > maxCol) maxCol = j;
            }
        }
    }

    // Criar um mapa de células para as palavras
    let cellMap = {};

    placedWords.forEach(wordObj => {
        wordObj.positions.forEach(pos => {
            const key = `${pos.row},${pos.col}`;
            if (!cellMap[key]) {
                cellMap[key] = [];
            }
            cellMap[key].push({
                wordNumber: wordObj.number,
                direction: wordObj.direction,
                word: wordObj.word
            });
        });
    });

    // Renderizar a grade
    for (let i = minRow; i <= maxRow; i++) {
        for (let j = minCol; j <= maxCol; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (grid[i][j]) {
                const input = document.createElement('input');
                input.maxLength = 1;
                input.dataset.row = i;
                input.dataset.col = j;
                input.dataset.correct = grid[i][j];

                // Obter as palavras que incluem esta célula
                const key = `${i},${j}`;
                const cellWords = cellMap[key];

                if (cellWords) {
                    // Armazenar no dataset
                    input.dataset.words = JSON.stringify(cellWords);
                }

                cell.appendChild(input);

                // Adicionar o número da dica na primeira letra da palavra
                const wordAtPosition = placedWords.find(
                    wordObj =>
                        wordObj.positions[0].row === i &&
                        wordObj.positions[0].col === j
                );
                if (wordAtPosition) {
                    const clueNumber = document.createElement('span');
                    clueNumber.classList.add('clue-number');
                    clueNumber.textContent = wordAtPosition.number;
                    cell.appendChild(clueNumber);
                }
            } else {
                cell.style.borderColor = 'white';
            }
            crossword.appendChild(cell);
        }
    }

    // Atualizar o estilo da grade
    crossword.style.gridTemplateColumns = `repeat(${
        maxCol - minCol + 1
    }, 30px)`;
    crossword.style.gridTemplateRows = `repeat(${
        maxRow - minRow + 1
    }, 30px)`;

    // Exibir as dicas
    const clueList = document.getElementById('clue-list');
    clueList.innerHTML = '';
    for (let wordObj of placedWords) {
        const listItem = document.createElement('li');
        listItem.textContent = `${wordObj.number}. ${wordObj.clue} (${
            wordObj.direction === 'across' ? 'Horizontal' : 'Vertical'
        })`;

        // Adicionar o atributo 'title' com a resposta
        listItem.title = wordObj.word;

        clueList.appendChild(listItem);
    }

    // Atualizar o título
    document.getElementById(
        'level-title'
    ).textContent = `Nível ${currentLevel}`;

    // Adicionar eventos aos inputs
    const inputs = crossword.querySelectorAll('input');

    inputs.forEach(input => {
        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('input', handleInput);
        input.addEventListener('keydown', handleKeyDown);
    });
}

// Função para lidar com o foco nos inputs
function handleInputFocus(event) {
    const input = event.target;
    const cellWords = JSON.parse(input.dataset.words);

    // Determinar a palavra e direção
    // Para simplificar, escolheremos a primeira palavra
    if (cellWords && cellWords.length > 0) {
        currentWord = cellWords[0];
        currentDirection = currentWord.direction;
    }
}

// Função para lidar com a entrada do usuário
function handleInput(event) {
    const input = event.target;
    input.value = input.value.toUpperCase();

    // Mover para o próximo input na palavra atual
    moveToNextInput(input);
}

// Função para mover para o próximo input na palavra atual
function moveToNextInput(currentInput) {
    const currentRow = parseInt(currentInput.dataset.row);
    const currentCol = parseInt(currentInput.dataset.col);

    let nextRow = currentRow;
    let nextCol = currentCol;

    while (true) {
        if (currentDirection === 'across') {
            nextCol += 1;
        } else if (currentDirection === 'down') {
            nextRow += 1;
        } else {
            break;
        }

        const nextInput = document.querySelector(
            `input[data-row='${nextRow}'][data-col='${nextCol}']`
        );

        if (!nextInput) {
            break; // Não há mais inputs nessa direção
        }

        if (isInputPartOfCurrentWord(nextInput)) {
            nextInput.focus();
            break;
        } else {
            continue;
        }
    }
}

// Função para verificar se um input faz parte da palavra atual
function isInputPartOfCurrentWord(input) {
    const cellWords = JSON.parse(input.dataset.words);

    if (cellWords) {
        return cellWords.some(
            word =>
                word.wordNumber === currentWord.wordNumber &&
                word.direction === currentWord.direction
        );
    }

    return false;
}

// Função para lidar com a tecla Backspace
function handleKeyDown(event) {
    const input = event.target;
    if (event.key === 'Backspace' && !input.value) {
        // Mover para o input anterior
        moveToPreviousInput(input);
    }
}

// Função para mover para o input anterior na palavra atual
function moveToPreviousInput(currentInput) {
    const currentRow = parseInt(currentInput.dataset.row);
    const currentCol = parseInt(currentInput.dataset.col);

    let prevRow = currentRow;
    let prevCol = currentCol;

    while (true) {
        if (currentDirection === 'across') {
            prevCol -= 1;
        } else if (currentDirection === 'down') {
            prevRow -= 1;
        } else {
            break;
        }

        const prevInput = document.querySelector(
            `input[data-row='${prevRow}'][data-col='${prevCol}']`
        );

        if (!prevInput) {
            break; // Não há mais inputs nessa direção
        }

        if (isInputPartOfCurrentWord(prevInput)) {
            prevInput.focus();
            break;
        } else {
            continue;
        }
    }
}

// Função para verificar as respostas dos usuários
function checkAnswers() {
    const inputs = document.querySelectorAll('input');
    let allCorrect = true;

    inputs.forEach(input => {
        const userInput = input.value.toUpperCase();
        const correctInput = input.dataset.correct.toUpperCase();
        if (userInput === correctInput) {
            input.style.backgroundColor = '#b2ffb2'; // Verde claro
        } else {
            input.style.backgroundColor = '#ffb2b2'; // Vermelho claro
            allCorrect = false;
        }
    });

    if (allCorrect) {
        alert('Parabéns! Você completou o nível com sucesso.');
        // Avançar para o próximo nível
        currentLevel++;
        startLevel();
    } else {
        alert(
            'Existem erros em suas respostas. Por favor, verifique e tente novamente.'
        );
    }
}

function startLevel() {
    const wordsForLevel = getWordsForLevel(currentLevel);
    generateCrossword(wordsForLevel);
    createCrossword();
}
