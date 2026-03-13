// Recipes list logic

let recipes = [];

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

function loadRecipes() {
    try {
        recipes = JSON.parse(localStorage.getItem('recipes')) || [];
        displayRecipes(recipes);
    } catch (error) {
        console.error('Error loading recipes:', error);
        recipes = [];
        displayRecipes([]);
    }
}

function deleteRecipe(id) {
    if (!confirm('האם אתה בטוח שברצונך למחוק מתכון זה?')) return;
    
    try {
        recipes = recipes.filter(r => r.id !== id);
        localStorage.setItem('recipes', JSON.stringify(recipes));
        displayRecipes(recipes);
        showMessage('✅ המתכון נמחק בהצלחה!');
    } catch (error) {
        console.error('Error deleting recipe:', error);
        showMessage('שגיאה במחיקת המתכון', 'error');
    }
}

function displayRecipes(recipesToDisplay) {
    const grid = document.getElementById('recipesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (recipesToDisplay.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px; font-size: 18px;">😔 לא נמצאו מתכונים</p>';
        return;
    }
    
    recipesToDisplay.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        const title = document.createElement('h3');
        title.textContent = `🍽️ ${recipe.name}`;
        
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display: flex; gap: 10px;';
        
        const viewBtn = document.createElement('button');
        viewBtn.textContent = '👁️ צפה במתכון';
        viewBtn.onclick = () => viewRecipe(recipe.id);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️ מחק';
        deleteBtn.style.cssText = 'background: var(--danger-color); flex: 0.5;';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteRecipe(recipe.id);
        };
        
        btnContainer.appendChild(viewBtn);
        btnContainer.appendChild(deleteBtn);
        card.appendChild(title);
        card.appendChild(btnContainer);
        grid.appendChild(card);
    });
}

function viewRecipe(id) {
    if (!id || isNaN(id)) {
        console.error('Invalid recipe ID');
        return;
    }
    window.location.href = `recipe.html?id=${encodeURIComponent(id)}`;
}

function searchRecipes() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filtered = recipes.filter(recipe => 
        recipe.name && recipe.name.toLowerCase().includes(searchTerm)
    );
    displayRecipes(filtered);
}

function addRecipe(name, ingredients, steps) {
    if (!name || !ingredients || !steps) {
        console.error('Missing required recipe fields');
        return false;
    }
    
    if (!Array.isArray(ingredients) || !Array.isArray(steps)) {
        console.error('Ingredients and steps must be arrays');
        return false;
    }
    
    const newId = recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) + 1 : 1;
    const newRecipe = {
        id: newId,
        name: name.trim(),
        ingredients: ingredients.filter(i => i.trim()),
        steps: steps.filter(s => s.trim())
    };
    
    recipes.push(newRecipe);
    
    try {
        localStorage.setItem('recipes', JSON.stringify(recipes));
        displayRecipes(recipes);
        return true;
    } catch (error) {
        console.error('Error saving recipe:', error);
        recipes.pop();
        return false;
    }
}

function initRecipesPage() {
    const searchInput = document.getElementById('searchInput');
    const addRecipeBtn = document.getElementById('addRecipeBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const addRecipeForm = document.getElementById('addRecipeForm');
    const addRecipeModal = document.getElementById('addRecipeModal');
    
    if (searchInput) {
        searchInput.addEventListener('input', searchRecipes);
    }
    
    if (addRecipeBtn) {
        addRecipeBtn.addEventListener('click', () => {
            if (addRecipeModal) {
                addRecipeModal.style.display = 'block';
            }
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (addRecipeModal) {
                addRecipeModal.style.display = 'none';
            }
            if (addRecipeForm) {
                addRecipeForm.reset();
            }
        });
    }
    
    if (addRecipeForm) {
        addRecipeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('recipeName');
            const ingredientsInput = document.getElementById('recipeIngredients');
            const stepsInput = document.getElementById('recipeSteps');
            
            if (!nameInput || !ingredientsInput || !stepsInput) return;
            
            const name = nameInput.value.trim();
            const ingredients = ingredientsInput.value.split('\n').filter(i => i.trim());
            const steps = stepsInput.value.split('\n').filter(s => s.trim());
            
            if (addRecipe(name, ingredients, steps)) {
                if (addRecipeModal) {
                    addRecipeModal.style.display = 'none';
                }
                addRecipeForm.reset();
                showMessage('✅ המתכון נוסף בהצלחה!');
            } else {
                showMessage('שגיאה בשמירת המתכון', 'error');
            }
        });
    }
    
    loadRecipes();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecipesPage);
} else {
    initRecipesPage();
}
