// Settings page logic

function loadSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('userSettings')) || {};
        
        const stepDelayInput = document.getElementById('stepDelay');
        const themeSelect = document.getElementById('theme');
        const voiceGenderSelect = document.getElementById('voiceGender');
        
        if (stepDelayInput) {
            stepDelayInput.value = settings.stepDelay || 3;
        }
        
        if (themeSelect) {
            themeSelect.value = settings.theme || 'light';
        }
        
        if (voiceGenderSelect) {
            voiceGenderSelect.value = settings.voiceGender || 'male';
        }
        
        applyTheme(settings.theme || 'light');
    } catch (error) {
        console.error('Error loading settings:', error);
        applyTheme('light');
    }
}

function saveSettings(stepDelay, theme, voiceGender) {
    if (!stepDelay || isNaN(stepDelay) || stepDelay < 1 || stepDelay > 30) {
        console.error('Invalid step delay value');
        return false;
    }
    
    if (!theme || (theme !== 'light' && theme !== 'dark')) {
        console.error('Invalid theme value');
        return false;
    }
    
    const settings = {
        stepDelay: parseInt(stepDelay, 10),
        theme: theme,
        voiceGender: voiceGender || 'male'
    };
    
    try {
        localStorage.setItem('userSettings', JSON.stringify(settings));
        applyTheme(theme);
        showSaveMessage();
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

function applyTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
        document.body.setAttribute('data-theme', theme);
    }
}

function showSaveMessage() {
    const message = document.getElementById('saveMessage');
    if (!message) return;
    
    message.textContent = '✅ ההגדרות נשמרו בהצלחה!';
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

function initSettingsPage() {
    const settingsForm = document.getElementById('settingsForm');
    if (!settingsForm) return;
    
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const stepDelayInput = document.getElementById('stepDelay');
        const themeSelect = document.getElementById('theme');
        const voiceGenderSelect = document.getElementById('voiceGender');
        
        if (!stepDelayInput || !themeSelect) return;
        
        const stepDelay = stepDelayInput.value;
        const theme = themeSelect.value;
        const voiceGender = voiceGenderSelect ? voiceGenderSelect.value : 'male';
        
        if (!saveSettings(stepDelay, theme, voiceGender)) {
            const message = document.getElementById('saveMessage');
            if (message) {
                message.textContent = '❌ שגיאה בשמירת ההגדרות';
                message.style.display = 'block';
                message.style.color = 'var(--danger-color)';
                setTimeout(() => message.style.display = 'none', 3000);
            }
        }
    });
    
    loadSettings();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettingsPage);
} else {
    initSettingsPage();
}
