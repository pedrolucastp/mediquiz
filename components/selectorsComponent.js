// selectorsComponent.js
import { specialties } from '../vocabulary/vocabulary.js';

export function initializeSelectors(handleSpecialtyChange, handleDifficultyChange) {
    // Criar contêiner dos seletores
    const selectorsContainer = document.getElementById('selectors');
    selectorsContainer.innerHTML = '';

    // Criar o elemento de especialidade
    const specialtyDiv = document.createElement('div');
    specialtyDiv.classList.add('controls-option');
    const specialtyLabel = document.createElement('label');
    specialtyLabel.setAttribute('for', 'specialty-select');
    specialtyLabel.textContent = 'Especialidade';
    const specialtySelect = document.createElement('select');
    specialtySelect.id = 'specialty-select';
    specialtyDiv.appendChild(specialtyLabel);
    specialtyDiv.appendChild(specialtySelect);

    // Criar o elemento de dificuldade
    const difficultyDiv = document.createElement('div');
    difficultyDiv.classList.add('controls-option');
    const difficultyLabel = document.createElement('label');
    difficultyLabel.setAttribute('for', 'difficulty-select');
    difficultyLabel.textContent = 'Dificuldade';
    const difficultySelect = document.createElement('select');
    difficultySelect.id = 'difficulty-select';
    const difficulties = [
        { value: 'all', text: 'Todas' },
        { value: '1', text: 'Fácil' },
        { value: '2', text: 'Média' },
        { value: '3', text: 'Difícil' }
    ];
    difficulties.forEach(difficulty => {
        const option = document.createElement('option');
        option.value = difficulty.value;
        option.textContent = difficulty.text;
        difficultySelect.appendChild(option);
    });
    difficultyDiv.appendChild(difficultyLabel);
    difficultyDiv.appendChild(difficultySelect);

    // Adicionar os elementos ao contêiner
    selectorsContainer.appendChild(specialtyDiv);
    selectorsContainer.appendChild(difficultyDiv);

    // Preencher o seletor de especialidades usando o array specialties
    populateSpecialtyOptions(specialtySelect);

    // Adicionar eventos aos seletores para atualizar o jogo quando o usuário alterar as opções
    specialtySelect.addEventListener('change', handleSpecialtyChange);
    difficultySelect.addEventListener('change', handleDifficultyChange);
}

function populateSpecialtyOptions(specialtySelect) {
    // Limpar opções existentes
    specialtySelect.innerHTML = '';

    // Adicionar a opção 'Todas as Especialidades'
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Todas';
    specialtySelect.appendChild(allOption);

    // Adicionar as especialidades ao seletor
    specialties.forEach((spec, index) => {
        const option = document.createElement('option');
        option.value = index; // Usar o índice como valor
        option.textContent = spec;
        specialtySelect.appendChild(option);
    });
}
