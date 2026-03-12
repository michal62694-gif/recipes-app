// Authentication logic

function login(username, password) {
    if (!username || !password) {
        return false;
    }
    
    try {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === password);
        
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

function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoginPage);
} else {
    initLoginPage();
}
