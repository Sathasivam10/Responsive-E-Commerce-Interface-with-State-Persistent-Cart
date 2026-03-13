const API_BASE = 'http://localhost:3000/api';

const Auth = {
    getToken() {
        return localStorage.getItem('token');
    },
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    setSession(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.updateNav();
    },
    clearSession() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.updateNav();
        // Redirect to login or home
        if (window.location.pathname.includes('cart.html') || window.location.pathname.includes('profile.html')) {
            window.location.href = 'login.html';
        }
    },
    updateNav() {
        const navLogin = document.getElementById('nav-login');
        const navLogout = document.getElementById('nav-logout');
        
        if (this.getToken() && navLogin && navLogout) {
            navLogin.style.display = 'none';
            navLogout.style.display = 'inline-block';
        } else if (navLogin && navLogout) {
            navLogin.style.display = 'inline-block';
            navLogout.style.display = 'none';
        }
    },
    showAlert(message, type = 'success') {
        const alertContainer = document.getElementById('alert-container');
        if (!alertContainer) return;
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        alertContainer.appendChild(alert);
        
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transform = 'translateX(100%)';
            alert.style.transition = 'all 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }
};

// Auto update Nav on load
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateNav();
    
    // Logout handler
    const navLogout = document.getElementById('nav-logout');
    if (navLogout) {
        navLogout.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.clearSession();
            Cart.init(); // Reinit cart as anonymous
            Auth.showAlert('Logged out successfully', 'success');
        });
    }

    // Login Form Handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                const response = await fetch(`${API_BASE}/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    Auth.setSession(data.token, data.user);
                    await Cart.syncCartWithServer();
                    window.location.href = 'products.html';
                } else {
                    Auth.showAlert(data.message || 'Login failed', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                Auth.showAlert('An error occurred during login', 'error');
            }
        });
    }

    // Register Form Handler
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            
            try {
                const response = await fetch(`${API_BASE}/users/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    Auth.showAlert('Registration successful! Please login.', 'success');
                    document.getElementById('show-login').click();
                } else {
                    Auth.showAlert(data.message || 'Registration failed', 'error');
                }
            } catch (error) {
                console.error('Registration error:', error);
                Auth.showAlert('An error occurred during registration', 'error');
            }
        });
    }
});
