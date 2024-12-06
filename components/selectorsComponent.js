// selectorsComponent.js
import { specialties } from '../vocabulary/vocabulary.js';

export function initializeSelectors(handleSpecialtyChange, handleDifficultyChange) {
    // Criar contêiner principal
    const selectorsContainer = document.getElementById('selectors');
    selectorsContainer.innerHTML = '';

    // Contêiner para a seta e conteúdo
    const toggleButton = document.createElement('button');
    toggleButton.classList.add('collapse-toggle');
    
    toggleButton.innerHTML = `
        Especialidade 
        <svg width="24" height="24" viewBox="0 0 24 24">
            <path
                fill="currentColor"
                d="M12 16.5l-6-6c-.3-.3-.3-.7 0-1 .3-.3.7-.3 1 0l5 5 5-5c.3-.3.7-.3 1 0s.3.7 0 1l-6 6z"
            />
        </svg>
        Dificuldade 
    `;

    const collapsibleContent = document.createElement('div');
    collapsibleContent.classList.add('collapsible-content');

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

    // Adicionar os elementos ao conteúdo colapsável
    collapsibleContent.appendChild(specialtyDiv);
    collapsibleContent.appendChild(difficultyDiv);

    // Adicionar os elementos ao contêiner principal
    selectorsContainer.appendChild(toggleButton);
    selectorsContainer.appendChild(collapsibleContent);

    // Preencher o seletor de especialidades usando o array specialties
    populateSpecialtyOptions(specialtySelect);

    // Adicionar eventos aos seletores para atualizar o jogo quando o usuário alterar as opções
    specialtySelect.addEventListener('change', handleSpecialtyChange);
    difficultySelect.addEventListener('change', handleDifficultyChange);

    // Alternar visibilidade ao clicar no botão
    toggleButton.addEventListener('click', () => {
        const isExpanded = collapsibleContent.classList.toggle('expanded');
        toggleButton.innerHTML = isExpanded
            ? `<svg width="24" height="24" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M12 8l6 6c.3.3.3.7 0 1s-.7.3-1 0l-5-5-5 5c-.3.3-.7.3-1 0s-.3-.7 0-1l6-6z"
                    />
               </svg>`
            : `
            Especialidade 
            <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                    fill="currentColor"
                    d="M12 16.5l-6-6c-.3-.3-.3-.7 0-1 .3-.3.7-.3 1 0l5 5 5-5c.3-.3.7-.3 1 0s.3.7 0 1l-6 6z"
                />
            </svg>
            Dificuldade 
        `;
    });
}

function populateSpecialtyOptions(specialtySelect) {
    specialtySelect.innerHTML = '';
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Todas';
    specialtySelect.appendChild(allOption);
    specialties.forEach((spec, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = spec;
        specialtySelect.appendChild(option);
    });
}
