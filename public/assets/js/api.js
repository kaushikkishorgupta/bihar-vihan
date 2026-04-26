// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Helper Functions
class BiharVihaanAPI {
    // Health check
    static async healthCheck() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }

    // Get all destinations with better error handling
    static async getDestinations() {
        try {
            const response = await fetch(`${API_BASE_URL}/destinations`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch destinations');
            }
            
            console.log(`✅ Fetched ${data.data.length} destinations from MongoDB`);
            return data.data;
        } catch (error) {
            console.error('Failed to fetch destinations:', error);
            throw error;
        }
    }

    // Get single destination by ID
    static async getDestination(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/destinations/${id}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch destination');
            }
            
            console.log(`✅ Fetched destination: ${data.data.name}`);
            return data.data;
        } catch (error) {
            console.error('Failed to fetch destination:', error);
            throw error;
        }
    }

    // Add new destination
    static async addDestination(destinationData) {
        try {
            const response = await fetch(`${API_BASE_URL}/destinations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(destinationData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to add destination');
            }
            
            console.log(`✅ Added destination: ${data.data.name}`);
            return data.data;
        } catch (error) {
            console.error('Failed to add destination:', error);
            throw error;
        }
    }

    // Contact Form API (example)
    static async submitContactForm(formData) {
        try {
            // This would be implemented when we create the contact route
            console.log('Contact form data:', formData);
            
            // Simulate API call
            return {
                success: true,
                message: 'Contact form submitted successfully'
            };
        } catch (error) {
            console.error('Failed to submit contact form:', error);
            throw error;
        }
    }
}

// UI Helper Functions
class UIHelpers {
    // Show loading state
    static showLoading(element) {
        if (element) {
            element.innerHTML = '<div class="loading">Loading...</div>';
            element.classList.add('loading');
        }
    }

    // Hide loading state
    static hideLoading(element) {
        if (element) {
            element.classList.remove('loading');
            element.innerHTML = '';
        }
    }

    // Show error message
    static showError(message, containerId = 'error-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${message}
                </div>
            `;
            container.style.display = 'block';
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                container.style.display = 'none';
            }, 5000);
        }
    }

    // Show success message
    static showSuccess(message, containerId = 'success-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    ${message}
                </div>
            `;
            container.style.display = 'block';
            
            // Auto hide after 3 seconds
            setTimeout(() => {
                container.style.display = 'none';
            }, 3000);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Test API connection
    BiharVihaanAPI.healthCheck()
        .then(data => {
            console.log('✅ API Health Check:', data);
        })
        .catch(error => {
            console.error('❌ API Health Check Failed:', error);
            UIHelpers.showError('Failed to connect to server. Please check if the server is running.');
        });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BiharVihaanAPI, UIHelpers };
}
