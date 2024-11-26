// vocabularyViewer.js

import { allWords, specialties } from './vocabulary.js';

const vocabularyList = document.getElementById('vocabularyList');
const specialtySelect = document.getElementById('specialty-select');
const difficultySelect = document.getElementById('difficulty-select');
const highlightDuplicatesBtn = document.getElementById('highlight-duplicates-btn');
const removeDuplicatesBtn = document.getElementById('remove-duplicates-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const totalCountElement = document.getElementById('total-count');

// Variável para armazenar o estado de destaque de duplicatas
let highlightDuplicates = false;

// Função para remover acentos de uma string
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Função para contar o número de acentos em uma string
function countAccents(str) {
    const accents = str.match(/[\u0300-\u036f]/g);
    return accents ? accents.length : 0;
}

// Função para preencher as opções de especialidades
function populateSpecialties() {
    specialties.forEach((specialty, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = specialty;
        specialtySelect.appendChild(option);
    });
}

// Função para exibir o vocabulário
function displayVocabulary() {
    vocabularyList.innerHTML = ''; // Limpa a lista

    let filteredWords = [...allWords];

    // Filtrar por especialidade
    const selectedSpecialty = specialtySelect.value;
    if (selectedSpecialty !== 'all') {
        filteredWords = filteredWords.filter(wordObj =>
            wordObj.specialties.includes(parseInt(selectedSpecialty))
        );
    }

    // Filtrar por dificuldade
    const selectedDifficulty = difficultySelect.value;
    if (selectedDifficulty !== 'all') {
        filteredWords = filteredWords.filter(wordObj =>
            wordObj.difficulty === parseInt(selectedDifficulty)
        );
    }

    // Ordenar os termos em ordem alfabética
    filteredWords.sort((a, b) => a.word.localeCompare(b.word));

    totalCountElement.textContent = filteredWords.length;

    // Identificar duplicatas (desconsiderando acentos)
    const wordCounts = {};
    filteredWords.forEach(item => {
        const wordKey = removeAccents(item.word.toLowerCase());
        wordCounts[wordKey] = (wordCounts[wordKey] || 0) + 1;
    });

    // Renderizar os termos
    filteredWords.forEach((item, index) => {
        const termElement = document.createElement('div');
        termElement.classList.add('term-item');

        // Destacar duplicatas se estiver ativado
        const wordKey = removeAccents(item.word.toLowerCase());
        if (highlightDuplicates && wordCounts[wordKey] > 1) {
            termElement.classList.add('duplicate');
        }

        // Contêiner para os ícones
        const iconsContainer = document.createElement('div');
        iconsContainer.classList.add('icons-container');

        // Ícone de editar
        const editIcon = document.createElement('span');
        editIcon.classList.add('icon', 'edit-icon');
        editIcon.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#2980b9" d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM21.41
                6.34c.38-.38.38-1.02 0-1.41l-2.34-2.34a1.003
                1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z"/>
            </svg>
        `;
        editIcon.title = 'Editar';
        editIcon.addEventListener('click', () => {
            toggleEditMode(termElement, item);
        });

        // Ícone de deletar
        const deleteIcon = document.createElement('span');
        deleteIcon.classList.add('icon', 'delete-icon');
        deleteIcon.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#e74c3c" d="M16 9v10H8V9h8m-1.5-6h-5l-1
                1H5v2h14V4h-3.5l-1-1z"/>
            </svg>
        `;
        deleteIcon.title = 'Deletar';
        deleteIcon.addEventListener('click', () => {
            if (confirm(`Deseja realmente deletar o termo "${item.word}"?`)) {
                const index = allWords.indexOf(item);
                if (index > -1) {
                    allWords.splice(index, 1);
                    displayVocabulary();
                }
            }
        });

        iconsContainer.appendChild(editIcon);
        iconsContainer.appendChild(deleteIcon);

        // Elementos de visualização
        const viewContainer = document.createElement('div');
        viewContainer.classList.add('view-container');

        const wordElement = document.createElement('h2');
        wordElement.textContent = item.word;

        const clueElement = document.createElement('p');
        clueElement.textContent = item.clue;

        const specialtiesElement = document.createElement('p');
        specialtiesElement.classList.add('specialties');
        const specialtyNames = item.specialties.map(index => specialties[index]);
        specialtiesElement.textContent = `Especialidades: ${specialtyNames.join(', ')}`;

        const difficultyElement = document.createElement('p');
        difficultyElement.classList.add('difficulty');
        const difficultyLevels = { 1: 'Fácil', 2: 'Média', 3: 'Difícil' };
        difficultyElement.textContent = `Dificuldade: ${difficultyLevels[item.difficulty] || 'Desconhecida'}`;

        viewContainer.appendChild(wordElement);
        viewContainer.appendChild(clueElement);
        viewContainer.appendChild(specialtiesElement);
        viewContainer.appendChild(difficultyElement);

        // Elementos de edição (inicialmente ocultos)
        const editContainer = document.createElement('div');
        editContainer.classList.add('edit-container');
        editContainer.style.display = 'none';

        // Campo editável para a palavra
        const wordInput = document.createElement('input');
        wordInput.type = 'text';
        wordInput.value = item.word;
        wordInput.classList.add('word-input');

        // Campo editável para a descrição (clue)
        const clueInput = document.createElement('textarea');
        clueInput.value = item.clue;
        clueInput.classList.add('clue-input');

        // Selecionar especialidades
        const specialtiesSelect = document.createElement('div');
        specialtiesSelect.classList.add('specialties-select');
        specialties.forEach((specialty, specIndex) => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = specIndex;
            checkbox.checked = item.specialties.includes(specIndex);
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(specialty));
            specialtiesSelect.appendChild(label);
        });

        // Selecionar dificuldade
        const difficultySelect = document.createElement('select');
        const difficulties = [
            { value: 1, label: 'Fácil' },
            { value: 2, label: 'Média' },
            { value: 3, label: 'Difícil' },
        ];
        difficulties.forEach(diff => {
            const option = document.createElement('option');
            option.value = diff.value;
            option.textContent = diff.label;
            if (item.difficulty === diff.value) {
                option.selected = true;
            }
            difficultySelect.appendChild(option);
        });

        // Botão para salvar alterações
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Salvar';
        saveButton.addEventListener('click', () => {
            // Atualizar os valores do item
            item.word = wordInput.value;
            item.clue = clueInput.value;
            item.specialties = Array.from(specialtiesSelect.querySelectorAll('input[type="checkbox"]:checked')).map(
                checkbox => parseInt(checkbox.value)
            );
            item.difficulty = parseInt(difficultySelect.value);

            // Voltar ao modo de visualização
            toggleEditMode(termElement, item, false);
        });

        // Botão para cancelar edição
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancelar';
        cancelButton.addEventListener('click', () => {
            // Reverter as alterações (opcional)
            wordInput.value = item.word;
            clueInput.value = item.clue;
            specialtiesSelect.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = item.specialties.includes(parseInt(checkbox.value));
            });
            difficultySelect.value = item.difficulty;

            // Voltar ao modo de visualização
            toggleEditMode(termElement, item, false);
        });

        editContainer.appendChild(wordInput);
        editContainer.appendChild(clueInput);
        editContainer.appendChild(specialtiesSelect);
        editContainer.appendChild(difficultySelect);
        editContainer.appendChild(saveButton);
        editContainer.appendChild(cancelButton);

        // Montar o elemento do termo
        termElement.appendChild(iconsContainer);
        termElement.appendChild(viewContainer);
        termElement.appendChild(editContainer);

        vocabularyList.appendChild(termElement);
    });
}

// Função para alternar entre modo de visualização e edição
function toggleEditMode(termElement, item, editMode = true) {
    const viewContainer = termElement.querySelector('.view-container');
    const editContainer = termElement.querySelector('.edit-container');

    if (editMode) {
        viewContainer.style.display = 'none';
        editContainer.style.display = 'block';
    } else {
        viewContainer.style.display = 'block';
        editContainer.style.display = 'none';

        // Atualizar a visualização com os novos valores
        viewContainer.querySelector('h2').textContent = item.word;
        viewContainer.querySelector('p').textContent = item.clue;
        const specialtyNames = item.specialties.map(index => specialties[index]);
        viewContainer.querySelector('.specialties').textContent = `Especialidades: ${specialtyNames.join(', ')}`;
        const difficultyLevels = { 1: 'Fácil', 2: 'Média', 3: 'Difícil' };
        viewContainer.querySelector('.difficulty').textContent = `Dificuldade: ${difficultyLevels[item.difficulty] || 'Desconhecida'}`;
    }
}

// Evento para destacar duplicatas
highlightDuplicatesBtn.addEventListener('click', () => {
    highlightDuplicates = !highlightDuplicates;
    highlightDuplicatesBtn.textContent = highlightDuplicates ? 'Ocultar Duplicatas' : 'Destacar Duplicatas';
    displayVocabulary();
});

// Evento para remover duplicatas
removeDuplicatesBtn.addEventListener('click', () => {
    if (confirm('Deseja realmente remover todas as duplicatas?')) {
        removeDuplicates();
        displayVocabulary();
        alert('Duplicatas removidas com sucesso!');
    }
});

// Função para remover duplicatas priorizando itens acentuados
function removeDuplicates() {
    const wordMap = {};
    // Percorrer de trás para frente para evitar problemas ao remover itens durante a iteração
    for (let i = allWords.length - 1; i >= 0; i--) {
        const item = allWords[i];
        const wordKey = removeAccents(item.word.toLowerCase());
        const accentCount = countAccents(item.word);

        if (wordMap[wordKey]) {
            const existingItem = wordMap[wordKey];
            const existingAccentCount = countAccents(existingItem.word);

            if (accentCount > existingAccentCount) {
                // O item atual tem mais acentos, substitui o existente
                const index = allWords.indexOf(existingItem);
                if (index > -1) {
                    allWords.splice(index, 1);
                }
                wordMap[wordKey] = item;
            } else {
                // Mantém o existente, remove o atual
                allWords.splice(i, 1);
            }
        } else {
            wordMap[wordKey] = item;
        }
    }
}

// Evento para exportar a lista em JSON
exportJsonBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(allWords, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Criar um link temporário para download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vocabulary.json';
    a.click();
    URL.revokeObjectURL(url);
});

// Eventos para mudança nos filtros
specialtySelect.addEventListener('change', displayVocabulary);
difficultySelect.addEventListener('change', displayVocabulary);

// Inicialização
populateSpecialties();
displayVocabulary();
