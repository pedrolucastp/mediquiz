// quiz.js

import { allWords } from '../vocabulary/vocabulary.js';
import { initializeSelectors } from '../components/selectorsComponent.js';

let currentQuestionIndex = 0;
let timer;
let timeLeft = 7;
let selectedQuestions = [];

// Referências aos elementos HTML
const quizContainer = document.getElementById('quiz-container');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const timeEl = document.getElementById('time');
const nextButton = document.getElementById('next-button');

// Inicializar os seletores de especialidade e dificuldade
initializeSelectors(resetQuiz, resetQuiz);

// Iniciar o quiz
function startQuiz() {
    currentQuestionIndex = 0;
    selectedQuestions = [];

    const specialtySelect = document.getElementById('specialty-select');
    const difficultySelect = document.getElementById('difficulty-select');

    const selectedSpecialty = specialtySelect.value;
    const selectedDifficulty = difficultySelect.value;

    // Filtrar as questões com base nos critérios
    let filteredWords = allWords;

    if (selectedSpecialty !== 'all') {
        const specialtyIndex = parseInt(selectedSpecialty);
        filteredWords = filteredWords.filter(word => word.specialties.includes(specialtyIndex));
    }

    if (selectedDifficulty !== 'all') {
        const difficultyLevel = parseInt(selectedDifficulty);
        filteredWords = filteredWords.filter(word => word.difficulty === difficultyLevel);
    }

    if (filteredWords.length === 0) {
        alert('Nenhuma questão encontrada com os critérios selecionados.');
        quizContainer.style.display = 'none';
        return;
    }

    // Embaralhar as questões
    selectedQuestions = shuffleArray(filteredWords).slice(0, 10); // Seleciona até 10 questões

    quizContainer.style.display = 'block';
    timeLeft = 7;
    showQuestion();
}

function showQuestion() {
    clearInterval(timer);
    if (currentQuestionIndex >= selectedQuestions.length) {
        alert('Você completou o quiz!');
        // Reiniciar o quiz
        resetQuiz();
        return;
    }

    const currentQuestion = selectedQuestions[currentQuestionIndex];

    questionEl.textContent = currentQuestion.clue;
    optionsEl.innerHTML = '';
    timeEl.textContent = timeLeft;

    // Criar opções de resposta (incluindo a correta e alternativas)
    const options = generateOptions(currentQuestion.word);

    options.forEach(option => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', selectOption);
        li.appendChild(button);
        optionsEl.appendChild(li);
    });

    nextButton.style.display = 'none';
    startTimer();
}

function selectOption(event) {
    clearInterval(timer);
    const correctAnswer = selectedQuestions[currentQuestionIndex].word;

    let selectedOption = null;
    if (event) {
        selectedOption = event.target.textContent;

        if (selectedOption === correctAnswer) {
            event.target.style.backgroundColor = '#2ecc71'; // Verde para correto
        } else {
            event.target.style.backgroundColor = '#e74c3c'; // Vermelho para incorreto
        }
    }

    // Destacar a resposta correta caso a opção selecionada seja incorreta ou o tempo esgote
    const optionsButtons = document.querySelectorAll('#options button');
    optionsButtons.forEach(button => {
        if (button.textContent === correctAnswer) {
            button.style.backgroundColor = '#2ecc71';
        }
    });

    disableOptions();
    nextButton.style.display = 'block';
}


function disableOptions() {
    const optionsButtons = document.querySelectorAll('#options button');
    optionsButtons.forEach(button => {
        button.disabled = true;
    });
}

function nextQuestion() {
    currentQuestionIndex++;
    timeLeft = 7;
    showQuestion();
}

function startTimer() {
    const initialTime = timeLeft * 1000; // Converte o tempo inicial para milissegundos
    let remainingTime = initialTime;

    timer = setInterval(() => {
        remainingTime -= 10; // Reduz 10ms a cada iteração
        const seconds = Math.floor(remainingTime / 1000); // Calcula os segundos restantes
        const centiseconds = Math.floor((remainingTime % 1000) / 10); // Calcula os centésimos restantes

        // Exibir o tempo formatado como "segundos:centesimos"
        timeEl.textContent = `${seconds}.${centiseconds.toString().padStart(2, '0')}`;

        if (remainingTime <= 0) {
            clearInterval(timer);
            selectOption(null);
            alert('Tempo esgotado!');
            disableOptions();
            nextButton.style.display = 'block';
        }
    }, 10); // Atualiza a cada 10ms
}


nextButton.addEventListener('click', nextQuestion);

// Função para gerar opções de resposta
function generateOptions(correctAnswer) {
    const options = [correctAnswer];

    // Adicionar mais 3 opções incorretas
    const incorrectOptions = allWords
        .filter(word => word.word !== correctAnswer)
        .map(word => word.word);

    shuffleArray(incorrectOptions);

    while (options.length < 4 && incorrectOptions.length > 0) {
        options.push(incorrectOptions.pop());
    }

    return shuffleArray(options);
}

// Função para embaralhar um array
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Função para resetar o quiz
function resetQuiz() {
    clearInterval(timer);
    quizContainer.style.display = 'none';
    startQuiz();
}

// Inicializar o quiz
startQuiz();
