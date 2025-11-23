// Global variables
let selectedChats = [];
let allChats = [];
let isTelegramConfigSaved = false;

// DOM Elements
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const authorizeBtn = document.getElementById('authorize-btn');

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toastMessage.className = `px-4 py-2 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    toast.classList.remove('hidden');
    toast.classList.add('flex');
    
    setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('flex');
    }, 3000);
}

// Enable authorize button if config is saved
function updateAuthorizeButton() {
    const apiId = document.getElementById('api-id').value;
    const apiHash = document.getElementById('api-hash').value;
    const phone = document.getElementById('phone').value;
    
    if (apiId && apiHash && phone) {
        authorizeBtn.classList.remove('disabled');
    } else {
        authorizeBtn.classList.add('disabled');
    }
}

// Initialize event listeners once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    
    // Save Telegram settings
    const saveTgBtn = document.getElementById('save-telegram-settings');
    if (saveTgBtn) {
        saveTgBtn.addEventListener('click', async () => {
            const data = {
                api_id: document.getElementById('api-id').value,
                api_hash: document.getElementById('api-hash').value,
                phone: document.getElementById('phone').value,
                session: document.getElementById('session').value || 'telegram_session'
            };
            
            try {
                const response = await fetch('/api/telegram/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    isTelegramConfigSaved = true;
                    updateAuthorizeButton();
                    showToast('Настройки Telegram сохранены');
                } else {
                    const error = await response.json();
                    showToast(`Ошибка сохранения настроек: ${error.detail}`, 'error');
                }
            } catch (error) {
                showToast(`Ошибка сети: ${error.message}`, 'error');
            }
        });
    }

    // Start authorization
    if (authorizeBtn) {
        authorizeBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/telegram/auth/start', { method: 'POST' });
                if (response.ok) {
                    const result = await response.json();
                    document.getElementById('auth-modal').classList.remove('hidden');
                    document.getElementById('auth-modal').classList.add('flex');
                    showToast(result.message);
                } else {
                    const error = await response.json();
                    showToast(`Ошибка авторизации: ${error.detail}`, 'error');
                }
            } catch (error) {
                showToast(`Ошибка сети: ${error.message}`, 'error');
            }
        });
    }

    // Submit authorization code
    const submitCodeBtn = document.getElementById('submit-code-btn');
    if (submitCodeBtn) {
        submitCodeBtn.addEventListener('click', async () => {
            const code = document.getElementById('auth-code').value;
            try {
                const response = await fetch('/api/telegram/auth/code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: code })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.status === 'need_2fa') {
                        document.getElementById('auth-modal').classList.add('hidden');
                        document.getElementById('auth-modal').classList.remove('flex');
                        document.getElementById('password-modal').classList.remove('hidden');
                        document.getElementById('password-modal').classList.add('flex');
                    } else {
                        document.getElementById('auth-modal').classList.add('hidden');
                        document.getElementById('auth-modal').classList.remove('flex');
                        showToast(`Авторизация успешна! Добро пожаловать, ${result.user.first_name}`);
                    }
                } else {
                    const error = await response.json();
                    showToast(`Ошибка: ${error.detail}`, 'error');
                }
            } catch (error) {
                showToast(`Ошибка сети: ${error.message}`, 'error');
            }
        });
    }

    // Cancel authorization
    const cancelAuthBtn = document.getElementById('cancel-auth-btn');
    if (cancelAuthBtn) {
        cancelAuthBtn.addEventListener('click', () => {
            document.getElementById('auth-modal').classList.add('hidden');
            document.getElementById('auth-modal').classList.remove('flex');
        });
    }

    // Submit 2FA password
    const submitPassBtn = document.getElementById('submit-password-btn');
    if (submitPassBtn) {
        submitPassBtn.addEventListener('click', async () => {
            const password = document.getElementById('auth-password').value;
            try {
                const response = await fetch('/api/telegram/auth/password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: password })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    document.getElementById('password-modal').classList.add('hidden');
                    document.getElementById('password-modal').classList.remove('flex');
                    showToast(`Авторизация успешна! Добро пожаловать, ${result.user.first_name}`);
                } else {
                    const error = await response.json();
                    showToast(`Ошибка: ${error.detail}`, 'error');
                }
            } catch (error) {
                showToast(`Ошибка сети: ${error.message}`, 'error');
            }
        });
    }

    // Cancel 2FA password
    const cancelPassBtn = document.getElementById('cancel-password-btn');
    if (cancelPassBtn) {
        cancelPassBtn.addEventListener('click', () => {
            document.getElementById('password-modal').classList.add('hidden');
            document.getElementById('password-modal').classList.remove('flex');
        });
    }

    // Get chats list
    const getChatsBtn = document.getElementById('get-chats-btn');
    if (getChatsBtn) {
        getChatsBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/chats/list');
                if (response.ok) {
                    const result = await response.json();
                    allChats = result.chats;
                    renderChatsTable(allChats);
                    showToast('Список чатов загружен');
                } else {
                    const error = await response.json();
                    showToast(`Ошибка загрузки чатов: ${error.detail}`, 'error');
                }
            } catch (error) {
                showToast(`Ошибка сети: ${error.message}`, 'error');
            }
        });
    }

    // Chat search
    const chatSearch = document.getElementById('chat-search');
    if (chatSearch) {
        chatSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const filteredChats = allChats.filter(chat => 
                chat.name.toLowerCase().includes(searchTerm)
            );
            renderChatsTable(filteredChats);
        });
    }

    // Save selected chats
    const saveChatsBtn = document.getElementById('save-chats-btn');
    if (saveChatsBtn) {
        saveChatsBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/chats/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chats: selectedChats })
                });
                
                if (response.ok) {
                    showToast('Выбранные чаты сохранены');
                    updateStats();
                } else {
                    const error = await response.json();
                    showToast(`Ошибка сохранения чатов: ${error.detail}`, 'error');
                }
            } catch (error) {
                showToast(`Ошибка сети: ${error.message}`, 'error');
            }
        });
    }

    // Save webhook
    const saveWebhookBtn = document.getElementById('save-webhook-btn');
    if (saveWebhookBtn) {
        saveWebhookBtn.addEventListener('click', async () => {
            const url = document.getElementById('webhook-url').value;
            try {
                const response = await fetch('/api/webhook/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: url })
                });
                
                if (response.ok) {
                    showToast('Webhook URL сохранен');
                } else {
                    const error = await response.json();
                    showToast(`Ошибка сохранения webhook: ${error.detail}`, 'error');
                }
            } catch (error) {
                showToast(`Ошибка сети: ${error.message}`, 'error');
            }
        });
    }

    // Test webhook
    const testWebhookBtn = document.getElementById('test-webhook-btn');
    if (testWebhookBtn) {
        testWebhookBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/webhook/test', { method: 'POST' });
                if (response.ok) {
                    const result = await response.json();
                    showToast(result.message);
                } else {
                    const error = await response.json();
                    showToast(`Ошибка: ${error.detail}`, 'error');
                }
            } catch (error) {
                showToast(`Ошибка сети: ${error.message}`, 'error');
            }
        });
    }

    // Save AI settings
    const saveAiBtn = document.getElementById('save-ai-settings');
    if (saveAiBtn) {
        saveAiBtn.addEventListener('click', async () => {
            const settings = {
                ai_enabled: document.getElementById('ai-enabled').checked,
                openai_api_key: document.getElementById('openai-api-key').value,
                openai_model: document.getElementById('openai-model').value,
                system_prompt: document.getElementById('openai-prompt').value,
                min_words: parseInt(document.getElementById('min-words').value) || 5,
                use_triggers: document.getElementById('use-triggers').checked,
                trigger_words: document.getElementById('trigger-words').value
                    .split(',')
                    .map(word => word.trim())
                    .filter(word => word.length > 0)
            };
            
            try {
                const response = await fetch('/api/openai/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(settings)
                });
                
                if (response.ok) {
                    showToast('Настройки AI сохранены');
                    updateStats();
                } else {
                    let errorMessage = 'Ошибка сохранения настроек AI';
                    try {
                        const errorText = await response.text();
                        errorMessage = errorText || errorMessage;
                    } catch (e) {}
                    showToast(errorMessage, 'error');
                }
            } catch (error) {
                showToast(`Ошибка сети: ${error.message}`, 'error');
            }
        });
    }

    // Start monitoring - CORRECTED ID
    const startBtn = document.getElementById('start-monitoring-btn');
    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            console.log('Start monitoring clicked');
            try {
                const response = await fetch('/api/monitor/start', { method: 'POST' });
                if (response.ok) {
                    showToast('Мониторинг запущен');
                    updateMonitoringStatus();
                } else {
                    const error = await response.json();
                    showToast(`Ошибка запуска: ${error.detail}`, 'error');
                }
            } catch (error) {
                showToast(`Ошибка сети: ${error.message}`, 'error');
            }
        });
    }

    // Stop monitoring
    const stopBtn = document.getElementById('stop-monitoring-btn');
    if (stopBtn) {
        stopBtn.addEventListener('click', async () => {
            console.log('Stop monitoring clicked');
            try {
                const response = await fetch('/api/monitor/stop', { method: 'POST' });
                if (response.ok) {
                    showToast('Мониторинг остановлен');
                    updateMonitoringStatus();
                } else {
                    const error = await response.json();
                    showToast(`Ошибка остановки: ${error.detail}`, 'error');
                }
            } catch (error) {
                showToast(`Ошибка сети: ${error.message}`, 'error');
            }
        });
    }

    // Event listeners for AI settings UI updates
    const aiEnabledCheckbox = document.getElementById('ai-enabled');
    if (aiEnabledCheckbox) {
        aiEnabledCheckbox.addEventListener('change', updateAIUI);
    }
    const useTriggersCheckbox = document.getElementById('use-triggers');
    if (useTriggersCheckbox) {
        useTriggersCheckbox.addEventListener('change', updateAIUI);
    }

    // Initialize input listeners
    const apiIdInput = document.getElementById('api-id');
    if (apiIdInput) apiIdInput.addEventListener('input', updateAuthorizeButton);
    const apiHashInput = document.getElementById('api-hash');
    if (apiHashInput) apiHashInput.addEventListener('input', updateAuthorizeButton);
    const phoneInput = document.getElementById('phone');
    if (phoneInput) phoneInput.addEventListener('input', updateAuthorizeButton);

    // Start app initialization
    init();
});

// Render chats table
function renderChatsTable(chats) {
    const tbody = document.getElementById('chats-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    chats.forEach(chat => {
        const row = document.createElement('tr');
        const isSelected = selectedChats.includes(chat.id);
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <input type="checkbox" class="chat-checkbox" data-id="${chat.id}" ${isSelected ? 'checked' : ''}>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${chat.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${chat.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${chat.type}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.chat-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const chatId = parseInt(this.dataset.id);
            if (this.checked) {
                if (!selectedChats.includes(chatId)) {
                    selectedChats.push(chatId);
                }
            } else {
                selectedChats = selectedChats.filter(id => id !== chatId);
            }
        });
    });
}

// Update statistics
function updateStats() {
    const chatsCountEl = document.getElementById('monitored-chats-count');
    if (chatsCountEl) chatsCountEl.textContent = selectedChats.length;
    
    const triggerWordsInput = document.getElementById('trigger-words');
    if (triggerWordsInput) {
        const triggerWordsText = triggerWordsInput.value;
        const triggerWordsCount = triggerWordsText.split(',')
            .map(word => word.trim())
            .filter(word => word.length > 0)
            .length;
        const keywordsCountEl = document.getElementById('keywords-count');
        if (keywordsCountEl) keywordsCountEl.textContent = triggerWordsCount;
    }
}

// Update AI UI based on settings
function updateAIUI() {
    const aiEnabledCheckbox = document.getElementById('ai-enabled');
    const useTriggersCheckbox = document.getElementById('use-triggers');
    
    if (!aiEnabledCheckbox || !useTriggersCheckbox) return;

    const aiEnabled = aiEnabledCheckbox.checked;
    const useTriggers = useTriggersCheckbox.checked;
    
    const aiSettingsContainer = document.getElementById('ai-settings-container');
    if (aiSettingsContainer) aiSettingsContainer.style.display = aiEnabled ? 'block' : 'none';
    
    const triggerWordsContainer = document.getElementById('trigger-words-container');
    if (triggerWordsContainer) triggerWordsContainer.style.display = (aiEnabled && useTriggers) ? 'block' : 'none';
}

// Load AI settings from backend
async function loadAISettings() {
    try {
        const response = await fetch('/api/openai/status');
        if (response.ok) {
            const data = await response.json();
            
            const aiEnabled = document.getElementById('ai-enabled');
            if (aiEnabled) aiEnabled.checked = data.ai_enabled || false;
            
            const apiKey = document.getElementById('openai-api-key');
            if (apiKey) apiKey.value = data.openai_api_key || '';
            
            const model = document.getElementById('openai-model');
            if (model) model.value = data.openai_model || 'gpt-5-nano';
            
            const prompt = document.getElementById('openai-prompt');
            if (prompt) prompt.value = data.system_prompt || 'Ты классификатор сообщений из чатов фрилансеров. Твоя задача — определить, содержит ли сообщение поиск исполнителя, вакансию или предложение работы. Если сообщение — это вопрос новичка, спам, реклама услуг или просто общение — возвращай false. Если это заказ/вакансия — возвращай true. Ответь ТОЛЬКО валидным JSON формата: {"relevant": true} или {"relevant": false}';
            
            const minWords = document.getElementById('min-words');
            if (minWords) minWords.value = data.min_words || 5;
            
            const useTriggers = document.getElementById('use-triggers');
            if (useTriggers) useTriggers.checked = data.use_triggers !== undefined ? data.use_triggers : true;
            
            const triggerWords = document.getElementById('trigger-words');
            if (triggerWords) {
                if (data.trigger_words && Array.isArray(data.trigger_words)) {
                    triggerWords.value = data.trigger_words.join(', ');
                } else {
                    triggerWords.value = 'ищу, нужен, требуется, заказ, сделать, настроить, разработать, кто может, помогите';
                }
            }
            
            updateAIUI();
            updateStats();
        }
    } catch (error) {
        console.error('Error loading AI settings:', error);
    }
}

// Update monitoring status
async function updateMonitoringStatus() {
    try {
        const response = await fetch('/api/monitor/status');
        if (response.ok) {
            const data = await response.json();
            
            const statusIndicator = document.getElementById('monitoring-status-indicator');
            const statusText = document.getElementById('monitoring-status-text');
            
            if (statusIndicator && statusText) {
                if (data.active) {
                    statusIndicator.className = 'status-indicator status-active';
                    statusText.textContent = 'Запущен';
                } else {
                    statusIndicator.className = 'status-indicator status-inactive';
                    statusText.textContent = 'Остановлен';
                }
            }
            
            const chatsCount = document.getElementById('monitored-chats-count');
            if (chatsCount) chatsCount.textContent = data.chats_count || 0;
            
            // Sync keywords count from input if possible
            updateStats();
        }
    } catch (error) {
        console.error('Error updating monitoring status:', error);
    }
}

// Connect to SSE for real-time logs
function connectSSE() {
    const eventSource = new EventSource('/api/monitor/logs');
    const eventsLog = document.getElementById('events-log');
    
    if (!eventsLog) return;

    eventSource.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data);
            
            const eventElement = document.createElement('div');
            eventElement.className = 'mb-2 p-2 bg-white rounded shadow event-item border border-gray-100';
            eventElement.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="text-xs text-gray-500">${data.time ? new Date(data.time).toLocaleTimeString() : new Date().toLocaleTimeString()}</div>
                    <div class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">${data.chat_name || 'Unknown'}</div>
                </div>
                <div class="text-sm mt-1 text-gray-800">${data.text_preview || ''}</div>
                ${data.keywords ? `<div class="text-xs text-green-600 mt-1 font-medium">Found: ${data.keywords.join(', ')}</div>` : ''}
            `;
            
            eventsLog.insertBefore(eventElement, eventsLog.firstChild);
            
            while (eventsLog.children.length > 50) {
                eventsLog.removeChild(eventsLog.lastChild);
            }
        } catch (e) {
            console.error('Error parsing SSE event:', e);
        }
    };
    
    eventSource.onerror = function(error) {
        console.error('SSE error:', error);
    };
}

// Initialize app
async function init() {
    // Check auth status
    try {
        const response = await fetch('/api/telegram/status');
        const data = await response.json();
        if (data.authorized) {
            // Optional: update UI to show authorized state
        }
    } catch (e) {
        console.log('Auth check failed');
    }
    
    try {
        await updateMonitoringStatus();
        await loadAISettings();
        
        // Poll status every 5s
        setInterval(updateMonitoringStatus, 5000);
        
        // Start SSE
        connectSSE();
    } catch (error) {
        console.error('Init error:', error);
    }
}
