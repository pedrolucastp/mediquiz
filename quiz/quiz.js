// quiz.js

import { allWords } from '../vocabulary/vocabulary.js';
import { initializeSelectors } from '../components/selectorsComponent.js';

let currentQuestionIndex = 0;
let timer;
let timeLeft = 15;
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
    timeLeft = 15;
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
    const selectedOption = event.target.textContent;
    const correctAnswer = selectedQuestions[currentQuestionIndex].word;

    if (selectedOption === correctAnswer) {
        event.target.style.backgroundColor = '#2ecc71'; // Verde para correto
    } else {
        event.target.style.backgroundColor = '#e74c3c'; // Vermelho para incorreto
        // Destacar a resposta correta
        const optionsButtons = document.querySelectorAll('#options button');
        optionsButtons.forEach(button => {
            if (button.textContent === correctAnswer) {
                button.style.backgroundColor = '#2ecc71';
            }
        });
    }

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
    timeLeft = 15;
    showQuestion();
}

function startTimer() {
    timeEl.textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timeEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert('Tempo esgotado!');
            disableOptions();
            nextButton.style.display = 'block';
        }
    }, 1000);
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
