// Settings page logic

let selectedVoiceName = '';

function populateVoiceList(selected = '') {
    const voiceSelect = document.getElementById('voiceName');
    if (!voiceSelect) return;

    const voices = speechSynthesis.getVoices() || [];

    // Keep current selection if possible
    const currentValue = selected || selectedVoiceName || voiceSelect.value;

    voiceSelect.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '(לא נבחר קול)';
    voiceSelect.appendChild(defaultOption);

    voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });

    if (currentValue) {
        voiceSelect.value = currentValue;
        if (voiceSelect.value !== currentValue) {
            // If the exact name isn't found, keep the default.
            voiceSelect.value = '';
        }
    }
}

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

        selectedVoiceName = settings.voiceName || '';
    populateVoiceList(selectedVoiceName);
        
        applyTheme(settings.theme || 'light');
    } catch (error) {
        console.error('Error loading settings:', error);
        applyTheme('light');
    }
}

function saveSettings(stepDelay, theme, voiceGender, voiceName) {
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
        voiceGender: voiceGender || 'male',
        voiceName: voiceName || ''
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

    // Ensure voice list is populated for browsers that load voices asynchronously
    if (typeof speechSynthesis.onvoiceschanged === 'function') {
        speechSynthesis.onvoiceschanged = () => {
            populateVoiceList(selectedVoiceName);
        };
    }

    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const stepDelayInput = document.getElementById('stepDelay');
        const themeSelect = document.getElementById('theme');
        const voiceGenderSelect = document.getElementById('voiceGender');
        const voiceNameSelect = document.getElementById('voiceName');
        
        if (!stepDelayInput || !themeSelect) return;
        
        const stepDelay = stepDelayInput.value;
        const theme = themeSelect.value;
        const voiceGender = voiceGenderSelect ? voiceGenderSelect.value : 'male';
        const voiceName = voiceNameSelect ? voiceNameSelect.value : '';

        // Keep the selection so it can be restored after voices load.
        selectedVoiceName = voiceName;

        if (!saveSettings(stepDelay, theme, voiceGender, voiceName)) {
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
