// Verifica se o navegador suporta Service Workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./service-worker.js')
        .then((registration) => {
            console.log('Service Worker registrado com sucesso:', registration.scope);
        })
        .catch((error) => {
            console.error('Falha ao registrar o Service Worker:', error);
        });
} else {
    console.warn('Service Worker não é suportado neste navegador.');
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
        installButton.textContent = 'Baixar MedQuix';

        const installContainer = document.getElementById('install-icon');
        if (installContainer) {
            installContainer.appendChild(installButton);
            console.log('Botão de instalação adicionado ao #install-icon');
        }

        installButton.addEventListener('click', () => {
            console.log('Botão de instalação clicado');
            // Remover o botão após o clique
            installButton.remove();

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
    } else {
        console.log('PWA já instalado ou rodando em modo standalone.');
    }
});

// Lidar com o evento `appinstalled`
window.addEventListener('appinstalled', () => {
    console.log('PWA instalado');
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
    localStorage.setItem('pwaInstalled', 'true');
}

// Refresh Cache
const refreshCacheBtn = document.getElementById('refresh-cache-btn');
if (refreshCacheBtn) {
    refreshCacheBtn.addEventListener('click', () => {
        if (confirm('Deseja atualizar os arquivos do cache para as versões mais recentes?')) {
            localStorage.setItem('pwaInstalled', 'false');
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            }).then(() => {
                location.reload();
            });
        }
    });
}

// Close Page
const closePageBtn = document.getElementById('close-page-btn');
if (closePageBtn) {
    closePageBtn.addEventListener('click', () => {
        if (confirm('Deseja fechar a página?')) {
            window.open('', '_self');
            window.close();
        }
    });
}

