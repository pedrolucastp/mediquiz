// Verifica se o navegador suporta Service Workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./service-worker.js')
        .then((registration) => {

            alert('Service Worker registrado com sucesso:', registration.scope);
            // registration.unregister()
        })
        .catch((error) => {
            alert('Falha ao registrar o Service Worker:', error);
        });
} else {
    alert('Service Worker não é suportado neste navegador.');
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

    // if (!isStandalone && !isInstalled) {
    console.log('PWA não instalado. Exibindo botão de instalação.');

    // Criar botão personalizado de instalação
    const installButton = document.createElement('button');
    installButton.textContent = 'Download MedQuix';

    const installContainer = document.getElementById('install-icon');
    if (installContainer) {
        installContainer.appendChild(installButton);
        console.log('Botão de instalação adicionado ao #install-icon');
        // }

        installButton.addEventListener('click', () => {
            console.log('Botão de instalação clicado');
            // Remover o botão após o clique
            // installButton.remove();

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
                });
            }
        });
    }
    //  else {
    // console.log('PWA já instalado ou rodando em modo standalone.');
    // }
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
    statusDisplay.style.position = 'fixed';
    statusDisplay.style.bottom = '10px';
    statusDisplay.style.right = '10px';
    statusDisplay.style.backgroundColor = '#2ecc71';
    statusDisplay.style.color = '#fff';
    statusDisplay.style.padding = '10px';
    statusDisplay.style.borderRadius = '5px';
    statusDisplay.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    statusDisplay.style.fontSize = '14px';
    statusDisplay.style.display = 'none';
    document.body.appendChild(statusDisplay);

    function updateOnlineStatus() {
        if (navigator.onLine) {
            statusDisplay.textContent = 'Online - Modo Offline disponível';
            statusDisplay.style.backgroundColor = '#2ecc71';
        } else {
            statusDisplay.textContent = 'Offline - Você ainda pode jogar!';
            statusDisplay.style.backgroundColor = '#e74c3c';
        }
        statusDisplay.style.display = 'block';

        setTimeout(() => {
            statusDisplay.style.display = 'none';
        }, 3000);
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // updateOnlineStatus(); // Mostrar status inicial
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

        // Alert para informar o usuário
        alert('Verificando chaves do cache...');

        // Obter as chaves do cache
        caches.keys().then((cacheNames) => {
            console.log('Caches existentes:', cacheNames);

            if (cacheNames.length === 0) {
                cacheKeysContainer.innerHTML = '<p>Nenhum cache encontrado.</p>';
                return;
            }

            // Criar uma lista para exibir as chaves
            const list = document.createElement('ul');

            cacheNames.forEach((cacheName) => {
                const listItem = document.createElement('li');
                listItem.textContent = cacheName;
                listItem.style.display = 'flex';
                listItem.style.alignItems = 'center';
                listItem.style.justifyContent = 'space-between';
                listItem.style.marginBottom = '10px';

                // Criar botão de exclusão
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Excluir';
                deleteBtn.style.padding = '5px 10px';
                deleteBtn.style.backgroundColor = '#e74c3c';
                deleteBtn.style.color = '#fff';
                deleteBtn.style.border = 'none';
                deleteBtn.style.borderRadius = '3px';
                deleteBtn.style.cursor = 'pointer';

                // Adicionar evento de clique para excluir o cache
                deleteBtn.addEventListener('click', () => {
                    if (confirm(`Deseja realmente excluir o cache "${cacheName}"?`)) {
                        caches.delete(cacheName).then((success) => {
                            if (success) {
                                console.log(`Cache "${cacheName}" excluído com sucesso.`);
                                // Remover o item da lista
                                list.removeChild(listItem);
                                alert(`Cache "${cacheName}" excluído com sucesso.`);
                                
                                // Verificar se ainda há caches
                                caches.keys().then((updatedCacheNames) => {
                                    if (updatedCacheNames.length === 0) {
                                        cacheKeysContainer.innerHTML = '<p>Nenhum cache encontrado.</p>';
                                    }
                                });
                            } else {
                                console.error(`Falha ao excluir o cache "${cacheName}".`);
                                alert(`Falha ao excluir o cache "${cacheName}".`);
                            }
                        }).catch((error) => {
                            console.error(`Erro ao excluir o cache "${cacheName}":`, error);
                            alert(`Erro ao excluir o cache "${cacheName}": ${error}`);
                        });
                    }
                });

                listItem.appendChild(document.createTextNode(cacheName));
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




// Close Page
// const closePageBtn = document.getElementById('close-page-btn');
// if (closePageBtn) {
//     closePageBtn.addEventListener('click', () => {
//         if (confirm('Deseja fechar a página?')) {
//             window.open('', '_self');
//             window.close();
//         }
//     });
// }

