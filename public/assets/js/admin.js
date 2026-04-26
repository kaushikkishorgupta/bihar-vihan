// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.token = localStorage.getItem('adminToken');
        this.user = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        if (this.token) {
            this.verifyToken();
        }

        // Setup event listeners
        this.setupEventListeners();
        this.hideLoading();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        // Add destination form
        const addForm = document.getElementById('addDestinationForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addDestination();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    async login() {
        try {
            this.showLoading('Logging in...');
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('adminToken', this.token);
                this.showDashboard();
                this.showSuccess('Login successful! Welcome back, ' + data.user.username);
            } else {
                this.showError(data.message || 'Login failed');
            }
            
        } catch (error) {
            this.hideLoading();
            this.showError('Login failed: ' + error.message);
        }
    }

    async verifyToken() {
        try {
            const response = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token
                },
                body: JSON.stringify({ token: this.token })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.user = data.user;
                this.showDashboard();
            } else {
                this.logout();
                this.showError('Session expired. Please login again.');
            }
            
        } catch (error) {
            this.logout();
            this.showError('Token verification failed');
        }
    }

    logout() {
        localStorage.removeItem('adminToken');
        this.token = null;
        this.user = null;
        this.showLogin();
        this.showSuccess('Logged out successfully');
    }

    async addDestination() {
        try {
            this.showLoading('Adding destination...');
            
            const name = document.getElementById('name').value;
            const location = document.getElementById('location').value;
            const description = document.getElementById('description').value;
            const image = document.getElementById('image').value;
            
            const response = await fetch('/api/destinations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token
                },
                body: JSON.stringify({ name, location, description, image })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccess('Destination added successfully!');
                document.getElementById('addDestinationForm').reset();
                this.loadDestinations();
            } else {
                this.showError(data.message || 'Failed to add destination');
            }
            
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to add destination: ' + error.message);
        }
    }

    async loadDestinations() {
        try {
            this.showLoading('Loading destinations...');
            
            const response = await fetch('/api/destinations', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.renderDestinationsTable(data.data);
                this.updateStats(data.data);
            } else {
                this.showError(data.message || 'Failed to load destinations');
            }
            
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to load destinations: ' + error.message);
        }
    }

    renderDestinationsTable(destinations) {
        const tbody = document.getElementById('destinationsTableBody');
        if (!tbody) return;
        
        if (!destinations || destinations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">No destinations found</td></tr>';
            return;
        }

        const rowsHTML = destinations.map(dest => `
            <tr>
                <td>${dest.name}</td>
                <td>${dest.location}</td>
                <td>${this.truncateText(dest.description, 100)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn--secondary" onclick="adminPanel.editDestination('${dest._id}')">✏️ Edit</button>
                        <button class="btn btn--danger" onclick="adminPanel.deleteDestination('${dest._id}')">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        tbody.innerHTML = rowsHTML;
    }

    updateStats(destinations) {
        const totalElement = document.getElementById('totalDestinations');
        if (totalElement) {
            totalElement.textContent = destinations.length;
        }
    }

    async editDestination(id) {
        try {
            const response = await fetch(`/api/destinations/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                const dest = data.data;
                document.getElementById('name').value = dest.name;
                document.getElementById('location').value = dest.location;
                document.getElementById('description').value = dest.description;
                document.getElementById('image').value = dest.image || '';
                
                this.showSuccess('Destination loaded for editing');
            } else {
                this.showError(data.message || 'Failed to load destination');
            }
            
        } catch (error) {
            this.showError('Failed to load destination: ' + error.message);
        }
    }

    async deleteDestination(id) {
        if (!confirm('Are you sure you want to delete this destination? This action cannot be undone.')) {
            return;
        }

        try {
            this.showLoading('Deleting destination...');
            
            const response = await fetch(`/api/destinations/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccess('Destination deleted successfully');
                this.loadDestinations();
            } else {
                this.showError(data.message || 'Failed to delete destination');
            }
            
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to delete destination: ' + error.message);
        }
    }

    showLogin() {
        document.getElementById('loginSection').classList.remove('hidden');
        document.getElementById('dashboardSection').classList.add('hidden');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    showDashboard() {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('dashboardSection').classList.remove('hidden');
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage && this.user) {
            welcomeMessage.innerHTML = `<h3>👋 Welcome, ${this.user.username}!</h3><p>Manage destinations from here</p>`;
        }
    }

    showLoading(message) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        `;
        document.body.appendChild(loadingDiv);
    }

    hideLoading() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showError(message) {
        this.showAlert(message, 'error');
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert--${type}`;
        alertDiv.textContent = message;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// Initialize admin panel
const adminPanel = new AdminPanel();
