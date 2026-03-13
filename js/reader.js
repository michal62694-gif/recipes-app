// Recipe reader logic

let currentRecipe = null;
let currentStepIndex = 0;
let isReading = false;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

function getRecipeIdFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        return id ? parseInt(id, 10) : null;
    } catch (error) {
        console.error('Error parsing URL:', error);
        return null;
    }
}

function loadRecipe() {
    const recipeId = getRecipeIdFromUrl();
    const titleElement = document.getElementById('recipeTitle');
    
    if (!recipeId || isNaN(recipeId)) {
        if (titleElement) {
            titleElement.textContent = 'מתכון לא נמצא';
        }
        return;
    }
    
    try {
        const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
        currentRecipe = recipes.find(r => r.id === recipeId);
        
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

function speakText(text, onEndCallback) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.rate = 0.85;
    
    utterance.onend = () => {
        if (onEndCallback) onEndCallback();
    };
    
    utterance.onerror = (event) => {
        console.error('שגיאה בקריאה:', event);
        if (onEndCallback) onEndCallback();
    };
    
    try {
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
    
    // First read ingredients (index -1)
    if (index === -1) {
        highlightIngredients();
        
        const ingredientsText = 'המרכיבים שנצטרך: ' + currentRecipe.ingredients.join(', ');
        
        currentUtterance = new SpeechSynthesisUtterance(ingredientsText);
        currentUtterance.lang = 'he-IL';
        currentUtterance.rate = 0.85;
        
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

function startReading() {
    if (!currentRecipe || !Array.isArray(currentRecipe.steps) || currentRecipe.steps.length === 0) {
        alert('אין שלבים לקריאה');
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
    const startBtn = document.getElementById('startReadingBtn');
    const stopBtn = document.getElementById('stopReadingBtn');
    
    if (startBtn) {
        startBtn.addEventListener('click', startReading);
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', stopReading);
    }
    
    loadRecipe();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReaderPage);
} else {
    initReaderPage();
}
