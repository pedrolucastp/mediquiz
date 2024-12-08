// script.js

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

    // Exibir o botão personalizado de instalação
    const installButton = document.createElement('button');
    installButton.textContent = 'Adicionar MEDiQUiZ à Tela Inicial';
    installButton.style.padding = '10px 20px';
    installButton.style.fontSize = '16px';
    installButton.style.backgroundColor = '#2980b9';
    installButton.style.color = '#fff';
    installButton.style.border = 'none';
    installButton.style.borderRadius = '5px';
    installButton.style.cursor = 'pointer';
    installButton.style.marginTop = '10px';

    const installContainer = document.getElementById('install-icon');
    installContainer.appendChild(installButton);

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
                } else {
                    console.log('Usuário recusou instalar o PWA.');
                }
                deferredPrompt = null;
            });
        }
    });
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

    updateOnlineStatus(); // Mostrar status inicial
});
