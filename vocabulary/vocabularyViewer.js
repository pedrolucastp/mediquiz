// vocabularyViewer.js

import { allWords, specialties, saveWordsToLocalStorage } from './vocabulary.js';
import { initializeSelectors } from '../components/selectorsComponent.js';

const vocabularyList = document.getElementById('vocabularyList');
const highlightDuplicatesBtn = document.getElementById('highlight-duplicates-btn');
const removeDuplicatesBtn = document.getElementById('remove-duplicates-btn');
const onlyActiveBtn = document.getElementById('only-active-btn');
const setAllActiveBtn = document.getElementById('set-all-active-btn');
const setAllNotActiveBtn = document.getElementById('set-all-not-active-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const totalCountElement = document.getElementById('total-count');
const addWordBtn = document.getElementById('add-word-btn');
const addWordModal = document.getElementById('add-word-modal');
const closeAddWordModalBtn = document.getElementById('close-add-word-modal');
const cancelAddWordBtn = document.getElementById('cancel-add-word');
const addWordForm = document.getElementById('add-word-form');
const newSpecialtiesContainer = document.getElementById('new-specialties');

// Variável para armazenar o estado de destaque de duplicatas
let highlightDuplicates = false;
let onlyActive = false

// Inicializar os seletores de especialidade e dificuldade
initializeSelectors(displayVocabulary, displayVocabulary);

// Função para remover acentos de uma string
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Event listener para destacar duplicatas
highlightDuplicatesBtn.addEventListener('click', () => {
    highlightDuplicates = !highlightDuplicates;
    highlightDuplicatesBtn.textContent = highlightDuplicates ? 'Remover Destaque' : 'Destacar Duplicatas';
    displayVocabulary();
});

// Event listener para remover duplicatas
removeDuplicatesBtn.addEventListener('click', () => {
    if (confirm('Deseja realmente remover todas as duplicatas, mantendo apenas uma instância de cada palavra?')) {
        const uniqueWords = {};
        allWords.forEach(item => {
            const wordKey = removeAccents(item.word.toLowerCase());
            if (!uniqueWords[wordKey]) {
                uniqueWords[wordKey] = item;
            }
        });
        const uniqueWordsArray = Object.values(uniqueWords);
        // Atualizar allWords
        allWords.length = 0; // Limpa o array existente
        allWords.push(...uniqueWordsArray); // Adiciona as palavras únicas
        saveWordsToLocalStorage();
        displayVocabulary();
        alert('Duplicatas removidas com sucesso!');
    }
});

// Event listener para destacar duplicatas
onlyActiveBtn.addEventListener('click', () => {
    onlyActive = !onlyActive;
    onlyActiveBtn.textContent = onlyActive ? 'Exibir todos os itens' : 'Exibir apenas itens ativos';
    displayVocabulary();
});

// Event listener para ativar todos os itens
setAllActiveBtn.addEventListener('click', () => {
    if (confirm('Deseja realmente ativar todos os itens?')) {
        allWords.forEach(item => {
            item.isActive = true
        });
        saveWordsToLocalStorage();
        displayVocabulary();
        alert('Itens ativados com sucesso!');
    }
});

// Event listener para ativar todos os itens
setAllNotActiveBtn.addEventListener('click', () => {
    if (confirm('Deseja realmente desativar todos os itens?')) {
        allWords.forEach(item => {
            item.isActive = false
        });
        saveWordsToLocalStorage();
        displayVocabulary();
        alert('Itens desativados com sucesso!');
    }
});

// Função para abrir o modal
addWordBtn.addEventListener('click', () => {
    addWordModal.style.display = 'flex';
    vocabularyList.style.display = 'none';

});

// Função para fechar o modal
function closeModal() {
    addWordModal.style.display = 'none';
    vocabularyList.style.display = 'flex';

}

// Fechar o modal ao clicar no botão de fechar ou cancelar
closeAddWordModalBtn.addEventListener('click', closeModal);
cancelAddWordBtn.addEventListener('click', closeModal);

// Fechar o modal ao clicar fora do conteúdo do modal
window.addEventListener('click', (event) => {
    if (event.target === addWordModal) {
        closeModal();
    }
});

// Função para gerar as checkboxes de especialidades no modal
function generateSpecialtiesOptions() {
    newSpecialtiesContainer.innerHTML = ''; // Limpa as opções existentes
    specialties.forEach((specialty, index) => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = index;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(specialty));
        newSpecialtiesContainer.appendChild(label);
    });
}

// Event listener para submissão do formulário de adicionar palavra
addWordForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevenir o comportamento padrão do formulário

    // Obter os valores do formulário
    const newWord = document.getElementById('new-word').value.trim();
    const newClue = document.getElementById('new-clue').value.trim();
    const newDifficulty = parseInt(document.getElementById('new-difficulty').value);
    const selectedSpecialties = Array.from(newSpecialtiesContainer.querySelectorAll('input[type="checkbox"]:checked')).map(
        checkbox => parseInt(checkbox.value)
    );

    // Validações
    if (newWord === '') {
        alert('A palavra não pode estar vazia.');
        return;
    }

    if (newClue === '') {
        alert('A dica não pode estar vazia.');
        return;
    }

    if (isNaN(newDifficulty)) {
        alert('Por favor, selecione um nível de dificuldade.');
        return;
    }

    if (selectedSpecialties.length === 0) {
        alert('Por favor, selecione pelo menos uma especialidade.');
        return;
    }

    // Verificar se a palavra já existe (evitar duplicatas)
    const wordExists = allWords.some(item => removeAccents(item.word.toLowerCase()) === removeAccents(newWord.toLowerCase()));
    if (wordExists) {
        if (!confirm('A palavra já existe. Deseja adicionar uma nova instância desta palavra?')) {
            return;
        }
    }

    // Criar o novo objeto de palavra
    const newWordObj = {
        word: newWord,
        clue: newClue,
        specialties: selectedSpecialties,
        difficulty: newDifficulty,
        isActive: true
    };

    // Adicionar ao array allWords
    allWords.push(newWordObj);

    // Salvar no localStorage
    saveWordsToLocalStorage();

    // Atualizar a exibição
    displayVocabulary();

    // Fechar o modal e limpar o formulário
    closeModal();
    addWordForm.reset();
});


// Função para exibir o vocabulário
function displayVocabulary() {
    vocabularyList.innerHTML = ''; // Limpa a lista

    let filteredWords = onlyActive ? allWords.filter(wordObj => wordObj.isActive) : allWords; // Considerar apenas palavras ativas

    // Filtrar por especialidade
    const specialtySelect = document.getElementById('specialty-select');
    const selectedSpecialty = specialtySelect.value;
    if (selectedSpecialty !== 'all') {
        filteredWords = filteredWords.filter(wordObj =>
            wordObj.specialties.includes(parseInt(selectedSpecialty))
        );
    }

    // Filtrar por dificuldade
    const difficultySelect = document.getElementById('difficulty-select');
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
    filteredWords.forEach((item) => {
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
            <svg width="24" height="24" viewBox="0 0 24 24">
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
            <svg width="32" height="28" viewBox="0 0 24 22">
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
                    saveWordsToLocalStorage();
                    displayVocabulary();
                }
            }
        });

        // Toggle para isActive
        const toggleActive = document.createElement('input');
        toggleActive.type = 'checkbox';
        toggleActive.checked = item.isActive;
        toggleActive.classList.add('toggle-active');
        toggleActive.title = 'Ativar/Desativar';
        toggleActive.addEventListener('change', () => {
            item.isActive = toggleActive.checked;
            saveWordsToLocalStorage();
            displayVocabulary();
        });

        iconsContainer.appendChild(editIcon);
        iconsContainer.appendChild(deleteIcon);
        iconsContainer.appendChild(toggleActive); // Adiciona o toggle ao contêiner

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
        specialtiesElement.textContent = `${specialtyNames.join(', ')}`;

        const difficultyElement = document.createElement('p');
        difficultyElement.classList.add('difficulty');
        const difficultyLevels = { 1: 'Fácil', 2: 'Média', 3: 'Difícil' };
        difficultyElement.textContent = `${difficultyLevels[item.difficulty] || 'Desconhecida'}`;

        viewContainer.appendChild(wordElement);
        viewContainer.appendChild(clueElement);
        viewContainer.appendChild(specialtiesElement);
        viewContainer.appendChild(difficultyElement);

        // Elementos de edição (inicialmente ocultos)
        const editContainer = document.createElement('div');
        editContainer.classList.add('edit-container');
        editContainer.style.display = 'none';

        const wordInput = document.createElement('input');
        wordInput.type = 'text';
        wordInput.value = item.word;
        wordInput.classList.add('word-input');

        const clueInput = document.createElement('textarea');
        clueInput.value = item.clue;
        clueInput.classList.add('clue-input');

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

        const difficultySelect = document.createElement('select');
        const difficulties = [
            { value: 1, label: 'Fácil' },
            { value: 2, label: 'Média' },
            { value: 3, label: 'Difícil' }
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

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Salvar';
        saveButton.addEventListener('click', () => {
            // Validação básica
            if (wordInput.value.trim() === '') {
                alert('A palavra não pode estar vazia.');
                return;
            }

            // Atualizar os valores do item
            item.word = wordInput.value.trim();
            item.clue = clueInput.value.trim();
            item.specialties = Array.from(specialtiesSelect.querySelectorAll('input[type="checkbox"]:checked')).map(
                checkbox => parseInt(checkbox.value)
            );
            item.difficulty = parseInt(difficultySelect.value);

            saveWordsToLocalStorage();
            toggleEditMode(termElement, item, false);
        });

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancelar';
        cancelButton.addEventListener('click', () => {
            // Reverter as alterações
            toggleEditMode(termElement, item, false);
        });

        editContainer.appendChild(wordInput);
        editContainer.appendChild(clueInput);
        editContainer.appendChild(specialtiesSelect);
        editContainer.appendChild(difficultySelect);
        editContainer.appendChild(saveButton);
        editContainer.appendChild(cancelButton);

        termElement.appendChild(viewContainer);
        termElement.appendChild(editContainer);
        termElement.appendChild(iconsContainer);

        vocabularyList.appendChild(termElement);
    });
}

// Função para alternar entre modo de visualização e edição
function toggleEditMode(termElement, item, editMode = true) {
    const viewContainer = termElement.querySelector('.view-container');
    const editContainer = termElement.querySelector('.edit-container');
    const iconsContainer = termElement.querySelector('.icons-container');

    if (editMode) {
        viewContainer.style.display = 'none';
        editContainer.style.display = 'block';
        iconsContainer.style.display = 'none';
    } else {
        viewContainer.style.display = 'block';
        editContainer.style.display = 'none';
        iconsContainer.style.display = 'flex'; // Altera para flex para melhor alinhamento

        // Atualizar a visualização com os novos valores
        viewContainer.querySelector('h2').textContent = item.word;
        viewContainer.querySelector('p').textContent = item.clue;
        const specialtyNames = item.specialties.map(index => specialties[index]);
        viewContainer.querySelector('.specialties').textContent = `Especialidades: ${specialtyNames.join(', ')}`;
        const difficultyLevels = { 1: 'Fácil', 2: 'Média', 3: 'Difícil' };
        viewContainer.querySelector('.difficulty').textContent = `Dificuldade: ${difficultyLevels[item.difficulty] || 'Desconhecida'}`;
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    displayVocabulary();
    generateSpecialtiesOptions();
});
