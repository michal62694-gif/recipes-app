// Authentication logic

// Simple hash function (must match storage.js)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// Timing-safe string comparison
function timingSafeEqual(a, b) {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

function login(username, password) {
    if (!username || !password) {
        return false;
    }
    
    try {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const hashedPassword = simpleHash(password);
        const user = users.find(u => u.username === username && timingSafeEqual(u.password, hashedPassword));
        
        if (user) {
            localStorage.setItem('currentUser', username);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

function register(username, password, passwordConfirm) {
    if (!username || !password || !passwordConfirm) {
        return { success: false, message: 'כל השדות הם חובה' };
    }
    
    if (username.length < 3) {
        return { success: false, message: 'שם משתמש חייב להיות לפחות 3 תווים' };
    }
    
    if (password.length < 4) {
        return { success: false, message: 'סיסמה חייבת להיות לפחות 4 תווים' };
    }
    
    if (password !== passwordConfirm) {
        return { success: false, message: 'הסיסמאות אינן זהות' };
    }
    
    try {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if username already exists
        if (users.find(u => u.username === username)) {
            return { success: false, message: 'שם המשתמש כבר קיים' };
        }
        
        // Add new user with hashed password
        users.push({ username, password: simpleHash(password) });
        localStorage.setItem('users', JSON.stringify(users));
        
        return { success: true, message: 'הרשמה הצליחה! מתחבר...' };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'שגיאה בהרשמה' };
    }
}

function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleBtn = document.getElementById('toggleBtn');
    const formTitle = document.getElementById('formTitle');
    
    let isLoginMode = true;
    
    // Toggle between login and register
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            isLoginMode = !isLoginMode;
            
            if (isLoginMode) {
                if (loginForm) loginForm.style.display = 'block';
                if (registerForm) registerForm.style.display = 'none';
                if (formTitle) formTitle.textContent = '🍳 התחברות למתכונים';
                toggleBtn.textContent = 'אין לך חשבון? הירשם עכשיו';
            } else {
                if (loginForm) loginForm.style.display = 'none';
                if (registerForm) registerForm.style.display = 'block';
                if (formTitle) formTitle.textContent = '🍳 הרשמה למתכונים';
                toggleBtn.textContent = 'כבר יש לך חשבון? התחבר';
            }
        });
    }
    
    // Login form handler
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const errorDiv = document.getElementById('error');
            
            if (!usernameInput || !passwordInput || !errorDiv) return;
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            if (!username || !password) {
                errorDiv.textContent = 'שם משתמש וסיסמה הם שדות חובה';
                return;
            }
            
            if (login(username, password)) {
                window.location.href = 'recipes.html';
            } else {
                errorDiv.textContent = 'שם משתמש או סיסמה שגויים';
                passwordInput.value = '';
            }
        });
    }
    
    // Register form handler
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const usernameInput = document.getElementById('regUsername');
            const passwordInput = document.getElementById('regPassword');
            const passwordConfirmInput = document.getElementById('regPasswordConfirm');
            const errorDiv = document.getElementById('regError');
            
            if (!usernameInput || !passwordInput || !passwordConfirmInput || !errorDiv) return;
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            const passwordConfirm = passwordConfirmInput.value;
            
            const result = register(username, password, passwordConfirm);
            
            if (result.success) {
                errorDiv.style.color = 'var(--success-color)';
                errorDiv.textContent = result.message;
                
                // Auto login after successful registration
                setTimeout(() => {
                    if (login(username, password)) {
                        window.location.href = 'recipes.html';
                    }
                }, 1000);
            } else {
                errorDiv.style.color = 'var(--danger-color)';
                errorDiv.textContent = result.message;
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoginPage);
} else {
    initLoginPage();
}
