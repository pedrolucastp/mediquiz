// Verifica se o navegador suporta Service Workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./service-worker.js')
        .then((registration) => {
            console.log('Service Worker registrado com sucesso: ' + registration.scope);
            // Se desejar desregistrar o Service Worker, descomente a linha abaixo
            // registration.unregister();
        })
        .catch((error) => {
            // alert('Falha ao registrar o Service Worker: ' + error);
        });
} else {
    console.log('Service Worker não é suportado neste navegador.');
}

// Variável para armazenar o evento `beforeinstallprompt`
let deferredPrompt;

// Lidar com o evento `beforeinstallprompt`
window.addEventListener('beforeinstallprompt', (event) => {
    console.log('Evento beforeinstallprompt disparado');

    // Prevenir que o prompt padrão seja exibido
    event.preventDefault();
    deferredPrompt = event;

    // Verificar se o PWA já foi instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = localStorage.getItem('pwaInstalled') === 'true';

    if (!isStandalone && !isInstalled) {
        console.log('PWA não instalado. Exibindo botão de instalação.');

        // Criar botão personalizado de instalação
        const installButton = document.createElement('button');
        installButton.textContent = 'Download MedQuix';
        installButton.className = 'install-button'; // Classe para estilização via CSS

        const installContainer = document.getElementById('install-icon');
        if (installContainer) {
            installContainer.appendChild(installButton);
            console.log('Botão de instalação adicionado ao #install-icon');

            installButton.addEventListener('click', () => {
                console.log('Botão de instalação clicado');

                // Exibir o prompt de instalação
                if (deferredPrompt) {
                    deferredPrompt.prompt();

                    // Verificar a escolha do usuário
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('Usuário aceitou instalar o PWA.');
                            // Salvar no localStorage que o app foi instalado
                            localStorage.setItem('pwaInstalled', 'true');
                        } else {
                            console.log('Usuário recusou instalar o PWA.');
                        }
                        deferredPrompt = null; // Resetar a variável após o uso
                    }).catch((error) => {
                        console.error('Erro ao obter a escolha do usuário:', error);
                    });
                }
            });
        } else {
            console.error('Elemento #install-icon não encontrado no HTML.');
        }
    } else {
        console.log('PWA já instalado ou rodando em modo standalone.');
    }
});

// Lidar com o evento `appinstalled`
window.addEventListener('appinstalled', () => {
    console.log('PWA instalado');
    // alert('PWA instalado');
    localStorage.setItem('pwaInstalled', 'true');
});

// Verificar o status da conexão e exibir mensagens
document.addEventListener('DOMContentLoaded', () => {
    const statusDisplay = document.createElement('div');
    statusDisplay.className = 'status-display'; // Classe para estilização via CSS
    document.body.appendChild(statusDisplay);

    function updateOnlineStatus() {
        if (navigator.onLine) {
            statusDisplay.textContent = 'Online - Modo Offline disponível';
            statusDisplay.classList.remove('offline');
            statusDisplay.classList.add('online');
        } else {
            statusDisplay.textContent = 'Offline - Você ainda pode jogar!';
            statusDisplay.classList.remove('online');
            statusDisplay.classList.add('offline');
        }
        statusDisplay.style.display = 'block';

        setTimeout(() => {
            statusDisplay.style.display = 'none';
        }, 3000);
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Mostrar status inicial
    updateOnlineStatus();
});

// Verificar se o app já está sendo executado em modo standalone
if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('O PWA já está rodando em modo standalone.');
    // alert('O PWA já está rodando em modo standalone.');
    localStorage.setItem('pwaInstalled', 'true');
}

// Refresh Cache - Exibir e Gerenciar as chaves do cache existentes
const refreshCacheBtn = document.getElementById('refresh-cache-btn');
const cacheKeysContainer = document.getElementById('cache-keys-container');

if (refreshCacheBtn) {
    console.log('Botão de atualização encontrado.');
    refreshCacheBtn.addEventListener('click', () => {
        console.log('Botão de atualização clicado');
        
        // Limpar o container de chaves anteriores
        cacheKeysContainer.innerHTML = '';

        // Remover 'pwaInstalled' do localStorage
        localStorage.removeItem('pwaInstalled');

        // Informar o usuário
        // alert('Verificando chaves do cache...');

        // Obter as chaves do cache
        caches.keys().then((cacheNames) => {
            console.log('Caches existentes:', cacheNames);

            if (cacheNames.length === 0) {
                cacheKeysContainer.innerHTML = '<p>Nenhum cache encontrado.</p>';
                return;
            }

            // Criar uma lista para exibir as chaves
            const list = document.createElement('ul');
            list.className = 'cache-list'; // Classe para estilização via CSS

            cacheNames.forEach((cacheName) => {
                const listItem = document.createElement('li');
                listItem.className = 'cache-item'; // Classe para estilização via CSS

                // Criar elemento de texto para o nome do cache
                const cacheNameText = document.createElement('span');
                cacheNameText.textContent = cacheName;
                cacheNameText.className = 'cache-name'; // Classe para estilização via CSS

                // Criar botão de exclusão
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Excluir';
                deleteBtn.className = 'delete-button'; // Classe para estilização via CSS

                // Adicionar evento de clique para excluir o cache
                deleteBtn.addEventListener('click', () => {
                    if (confirm(`Deseja realmente excluir o cache "${cacheName}"?`)) {
                        caches.delete(cacheName).then((success) => {
                            if (success) {
                                console.log(`Cache "${cacheName}" excluído com sucesso.`);
                                // Remover o item da lista
                                list.removeChild(listItem);
                                // alert(`Cache "${cacheName}" excluído com sucesso.`);
                                
                                // Verificar se ainda há caches
                                caches.keys().then((updatedCacheNames) => {
                                    if (updatedCacheNames.length === 0) {
                                        cacheKeysContainer.innerHTML = '<p>Nenhum cache encontrado.</p>';
                                    }
                                });
                            } else {
                                console.error(`Falha ao excluir o cache "${cacheName}".`);
                                // alert(`Falha ao excluir o cache "${cacheName}".`);
                            }
                        }).catch((error) => {
                            console.error(`Erro ao excluir o cache "${cacheName}":`, error);
                            // alert(`Erro ao excluir o cache "${cacheName}": ${error}`);
                        });
                    }
                });

                listItem.appendChild(cacheNameText);
                listItem.appendChild(deleteBtn);
                list.appendChild(listItem);
            });

            cacheKeysContainer.appendChild(list);
        }).catch((error) => {
            console.error('Erro ao obter as chaves do cache:', error);
            cacheKeysContainer.innerHTML = `<p>Erro ao obter as chaves do cache: ${error}</p>`;
        });
    });
} else {
    console.warn('Botão de atualização não encontrado no HTML.');
}

// Close Page (Descomentado se necessário)
// const closePageBtn = document.getElementById('close-page-btn');
// if (closePageBtn) {
//     closePageBtn.addEventListener('click', () => {
//         if (confirm('Deseja fechar a página?')) {
//             window.open('', '_self');
//             window.close();
//         }
//     });
// }
