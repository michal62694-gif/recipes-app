// Recipe reader logic

let currentRecipe = null;
let currentStepIndex = 0;
let isReading = false;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

function getRecipeIdFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    } catch (error) {
        console.error('Error parsing URL:', error);
        return null;
    }
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        padding: 15px 25px; border-radius: 8px; font-size: 16px;
        background: ${type === 'error' ? '#f44336' : '#4CAF50'};
        color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

function loadRecipe() {
    const recipeId = getRecipeIdFromUrl();
    const titleElement = document.getElementById('recipeTitle');
    
    if (!recipeId) {
        if (titleElement) {
            titleElement.textContent = 'מתכון לא נמצא';
        }
        return;
    }
    
    try {
        const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
        currentRecipe = recipes.find(r => String(r.id) === recipeId);
        
        if (currentRecipe) {
            displayRecipe(currentRecipe);
        } else if (titleElement) {
            titleElement.textContent = 'מתכון לא נמצא';
        }
    } catch (error) {
        console.error('Error loading recipe:', error);
        if (titleElement) {
            titleElement.textContent = 'שגיאה בטעינת המתכון';
        }
    }
}

function displayRecipe(recipe) {
    const titleElement = document.getElementById('recipeTitle');
    const ingredientsList = document.getElementById('ingredientsList');
    const stepsList = document.getElementById('stepsList');
    
    if (!recipe) return;
    
    if (titleElement) {
        titleElement.textContent = recipe.name || 'מתכון';
    }
    
    if (ingredientsList && Array.isArray(recipe.ingredients)) {
        ingredientsList.innerHTML = '';
        recipe.ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            ingredientsList.appendChild(li);
        });
    }
    
    if (stepsList && Array.isArray(recipe.steps)) {
        stepsList.innerHTML = '';
        recipe.steps.forEach((step, index) => {
            const li = document.createElement('li');
            li.textContent = step;
            li.id = `step-${index}`;
            stepsList.appendChild(li);
        });
    }
}

function getWaitTime() {
    try {
        const userSettings = JSON.parse(localStorage.getItem('userSettings')) || {};
        const delay = parseInt(userSettings.stepDelay, 10);
        return (isNaN(delay) || delay < 1 || delay > 30) ? 3000 : delay * 1000;
    } catch (error) {
        console.error('Error reading settings:', error);
        return 3000;
    }
}

function highlightStep(index) {
    const allSteps = document.querySelectorAll('#stepsList li');
    
    allSteps.forEach(li => {
        li.style.backgroundColor = '';
        li.style.fontWeight = '';
    });
    
    if (index >= 0 && currentRecipe && index < currentRecipe.steps.length) {
        const stepElement = document.getElementById(`step-${index}`);
        if (stepElement) {
            stepElement.style.backgroundColor = '#ffffcc';
            stepElement.style.fontWeight = 'bold';
            stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function highlightIngredients() {
    const ingredientsList = document.getElementById('ingredientsList');
    if (ingredientsList) {
        ingredientsList.style.backgroundColor = '#ffffcc';
        ingredientsList.style.padding = '15px';
        ingredientsList.style.borderRadius = '10px';
        ingredientsList.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function removeHighlightIngredients() {
    const ingredientsList = document.getElementById('ingredientsList');
    if (ingredientsList) {
        ingredientsList.style.backgroundColor = '';
        ingredientsList.style.padding = '';
    }
}

let availableVoices = [];

function initVoices() {
    availableVoices = speechSynthesis.getVoices() || [];

    // Some browsers (Chrome) load voices asynchronously.
    if (typeof speechSynthesis.onvoiceschanged === 'function') {
        speechSynthesis.onvoiceschanged = () => {
            availableVoices = speechSynthesis.getVoices() || [];
        };
    }
}

function getPreferredHebrewVoice(voiceGender) {
    const voices = availableVoices.length ? availableVoices : (speechSynthesis.getVoices() || []);
    const hebrewVoices = voices.filter(v => v.lang && v.lang.startsWith('he'));
    const gender = (voiceGender || 'male').toLowerCase();

    const genderHints = gender === 'female'
        ? ['female', 'woman', 'w']
        : ['male', 'man', 'm'];

    // Prefer a voice that explicitly matches the requested gender.
    const genderMatch = voices.find(v =>
        genderHints.some(hint => v.name.toLowerCase().includes(hint))
    );

    if (genderMatch) return genderMatch;

    // Prefer a Hebrew voice if available.
    if (hebrewVoices.length > 0) {
        // Use second voice for female if there are at least 2 Hebrew voices.
        if (gender === 'female' && hebrewVoices.length > 1) {
            return hebrewVoices[1];
        }
        return hebrewVoices[0];
    }

    // Fall back to any voice.
    return voices[0] || null;
}

function speakText(text, onEndCallback, attempt = 0) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.rate = 0.85;

    // Get voice preference from settings
    try {
        const settings = JSON.parse(localStorage.getItem('userSettings')) || {};
        const voiceGender = settings.voiceGender || 'male';
        const preferredVoice = getPreferredHebrewVoice(voiceGender);
        if (preferredVoice) utterance.voice = preferredVoice;
    } catch (error) {
        console.error('Error setting voice:', error);
    }

    utterance.onend = () => {
        if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (event) => {
        console.error('שגיאה בקריאה:', event);
        if (onEndCallback) onEndCallback();
    };

    try {
        // If voices are not yet loaded, retry once more after a short delay.
        const voices = speechSynthesis.getVoices();
        if ((voices == null || voices.length === 0) && attempt < 4) {
            setTimeout(() => speakText(text, onEndCallback, attempt + 1), 150);
            return;
        }

        speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('Speech synthesis error:', error);
        if (onEndCallback) onEndCallback();
    }
}

function readStep(index) {
    if (!isReading || !currentRecipe) {
        stopReading();
        return;
    }
    
    // Get voice preference
    let voiceGender = 'male';
    try {
        const settings = JSON.parse(localStorage.getItem('userSettings')) || {};
        voiceGender = settings.voiceGender || 'male';
    } catch (error) {
        console.error('Error reading settings:', error);
    }
    
    // First read ingredients (index -1)
    if (index === -1) {
        highlightIngredients();
        
        const ingredientsText = 'המרכיבים שנצטרך: ' + currentRecipe.ingredients.join(', ');
        
        currentUtterance = new SpeechSynthesisUtterance(ingredientsText);
        currentUtterance.lang = 'he-IL';
        currentUtterance.rate = 0.85;
        
        // Set voice
        const preferredVoice = getPreferredHebrewVoice(voiceGender);
        if (preferredVoice) currentUtterance.voice = preferredVoice;
        
        currentUtterance.onend = () => {
            if (isReading) {
                removeHighlightIngredients();
                currentStepIndex = 0;
                setTimeout(() => {
                    const introText = 'עכשיו נתחיל בשלבי ההכנה';
                    speakText(introText, () => {
                        setTimeout(() => readStep(0), 1000);
                    });
                }, getWaitTime());
            }
        };
        
        currentUtterance.onerror = (event) => {
            console.error('שגיאה בקריאה:', event);
            stopReading();
        };
        
        try {
            speechSynthesis.speak(currentUtterance);
        } catch (error) {
            console.error('Speech synthesis error:', error);
            stopReading();
        }
        return;
    }
    
    // Read steps
    if (!Array.isArray(currentRecipe.steps) || index >= currentRecipe.steps.length) {
        // Finished reading all steps
        const finishText = 'המתכון מוכן! בתאבון!';
        speakText(finishText, () => {
            stopReading();
        });
        return;
    }
    
    highlightStep(index);
    
    const stepText = currentRecipe.steps[index];
    if (!stepText) {
        currentStepIndex++;
        readStep(currentStepIndex);
        return;
    }
    
    // Add step number to speech
    const stepNumber = index + 1;
    const fullText = `שלב ${stepNumber}: ${stepText}`;
    
    currentUtterance = new SpeechSynthesisUtterance(fullText);
    currentUtterance.lang = 'he-IL';
    currentUtterance.rate = 0.85;
    
    // Set voice
    const voices = speechSynthesis.getVoices();
    const hebrewVoices = voices.filter(v => v.lang.startsWith('he'));
    if (hebrewVoices.length > 0) {
        const preferredVoice = hebrewVoices.find(v => 
            voiceGender === 'female' ? v.name.includes('female') || v.name.includes('Female') : true
        );
        if (preferredVoice) currentUtterance.voice = preferredVoice;
    }
    
    currentUtterance.onend = () => {
        if (isReading) {
            currentStepIndex++;
            if (currentStepIndex < currentRecipe.steps.length) {
                setTimeout(() => {
                    readStep(currentStepIndex);
                }, getWaitTime());
            } else {
                readStep(currentStepIndex); // Will trigger finish message
            }
        }
    };
    
    currentUtterance.onerror = (event) => {
        console.error('שגיאה בקריאה:', event);
        stopReading();
    };
    
    try {
        speechSynthesis.speak(currentUtterance);
    } catch (error) {
        console.error('Speech synthesis error:', error);
        stopReading();
    }
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        padding: 15px 25px; border-radius: 8px; font-size: 16px;
        background: ${type === 'error' ? '#f44336' : '#4CAF50'};
        color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

function startReading() {
    if (!currentRecipe || !Array.isArray(currentRecipe.steps) || currentRecipe.steps.length === 0) {
        showMessage('אין שלבים לקריאה', 'error');
        return;
    }
    
    isReading = true;
    currentStepIndex = -1; // Start with ingredients
    
    const startBtn = document.getElementById('startReadingBtn');
    const stopBtn = document.getElementById('stopReadingBtn');
    
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
    
    // Start with welcome message
    const welcomeText = `בואו נכין את ${currentRecipe.name}`;
    speakText(welcomeText, () => {
        setTimeout(() => readStep(-1), 1000);
    });
}

function stopReading() {
    isReading = false;
    
    try {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    } catch (error) {
        console.error('Error stopping speech:', error);
    }
    
    // Remove all highlights
    const allSteps = document.querySelectorAll('#stepsList li');
    allSteps.forEach(li => {
        li.style.backgroundColor = '';
        li.style.fontWeight = '';
    });
    
    removeHighlightIngredients();
    
    const startBtn = document.getElementById('startReadingBtn');
    const stopBtn = document.getElementById('stopReadingBtn');
    
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
    
    currentStepIndex = 0;
}

function initReaderPage() {
    initVoices();

    const startBtn = document.getElementById('startReadingBtn');
    const stopBtn = document.getElementById('stopReadingBtn');
    const editBtn = document.getElementById('editRecipeBtn');
    const closeModal = document.getElementById('closeModal');
    const editForm = document.getElementById('editRecipeForm');
    
    if (startBtn) {
        startBtn.addEventListener('click', startReading);
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', stopReading);
    }
    
    if (editBtn) {
        editBtn.addEventListener('click', openEditModal);
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeEditModal);
    }
    
    if (editForm) {
        editForm.addEventListener('submit', saveEditedRecipe);
    }
    
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('editModal');
        if (e.target === modal) {
            closeEditModal();
        }
    });
    
    loadRecipe();
}

function openEditModal() {
    if (!currentRecipe) return;
    
    const modal = document.getElementById('editModal');
    const editName = document.getElementById('editName');
    const editIngredients = document.getElementById('editIngredients');
    const editSteps = document.getElementById('editSteps');
    
    if (editName) editName.value = currentRecipe.name || '';
    if (editIngredients) editIngredients.value = (currentRecipe.ingredients || []).join('\n');
    if (editSteps) editSteps.value = (currentRecipe.steps || []).join('\n');
    
    if (modal) modal.style.display = 'block';
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.style.display = 'none';
}

function saveEditedRecipe(e) {
    e.preventDefault();
    
    const editName = document.getElementById('editName');
    const editIngredients = document.getElementById('editIngredients');
    const editSteps = document.getElementById('editSteps');
    
    if (!editName || !editIngredients || !editSteps || !currentRecipe) return;
    
    const name = editName.value.trim();
    const ingredients = editIngredients.value.split('\n').map(i => i.trim()).filter(i => i);
    const steps = editSteps.value.split('\n').map(s => s.trim()).filter(s => s);
    
    if (!name || ingredients.length === 0 || steps.length === 0) {
        showMessage('יש למלא את כל השדות', 'error');
        return;
    }
    
    try {
        const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
        const index = recipes.findIndex(r => r.id === currentRecipe.id);
        
        if (index !== -1) {
            recipes[index] = {
                ...currentRecipe,
                name: name,
                ingredients: ingredients,
                steps: steps
            };
            
            localStorage.setItem('recipes', JSON.stringify(recipes));
            currentRecipe = recipes[index];
            displayRecipe(currentRecipe);
            closeEditModal();
            showMessage('✅ המתכון עודכן בהצלחה!');
        }
    } catch (error) {
        console.error('Error saving recipe:', error);
        showMessage('שגיאה בשמירת המתכון', 'error');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReaderPage);
} else {
    initReaderPage();
}
