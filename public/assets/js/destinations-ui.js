// Dynamic Destinations UI Rendering
class DestinationsUI {
    constructor() {
        this.destinationsContainer = null;
        this.loading = false;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
    }

    setupUI() {
        // Find destinations container in the page
        this.destinationsContainer = document.querySelector('[data-destinations-container]');
        
        if (this.destinationsContainer) {
            this.loadDestinations();
        } else {
            console.warn('⚠️ Destinations container not found in the page');
        }
    }

    async loadDestinations() {
        try {
            this.showLoading();
            console.log('🔄 Loading destinations from MongoDB...');
            
            const destinations = await BiharVihaanAPI.getDestinations();
            
            this.hideLoading();
            this.renderDestinations(destinations);
            
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to load destinations: ' + error.message);
            console.error('❌ Error loading destinations:', error);
        }
    }

    showLoading() {
        this.loading = true;
        if (this.destinationsContainer) {
            this.destinationsContainer.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner">🔄</div>
                    <p class="loading-text">Loading destinations from database...</p>
                </div>
            `;
        }
    }

    hideLoading() {
        this.loading = false;
        const loadingElement = this.destinationsContainer.querySelector('.loading-container');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    showError(message) {
        if (this.destinationsContainer) {
            this.destinationsContainer.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">❌</div>
                    <h3 class="error-title">Error Loading Destinations</h3>
                    <p class="error-message">${message}</p>
                    <button class="btn btn--primary" onclick="destinationsUI.loadDestinations()">
                        🔄 Try Again
                    </button>
                </div>
            `;
        }
    }

    renderDestinations(destinations) {
        if (!destinations || destinations.length === 0) {
            this.renderEmptyState();
            return;
        }

        const esc = (v) => this.escapeHtml(v);
        const destinationsHTML = destinations.map((destination) => {
            const id = esc(destination._id);
            return `
            <div class="card destination-card" data-destination-id="${id}">
                <div class="destination-card__image">
                    <img src="${esc(destination.image)}" alt="${esc(destination.name)}" loading="lazy">
                </div>
                <div class="destination-card__body">
                    <h3 class="destination-card__title">${esc(destination.name)}</h3>
                    <p class="destination-card__location">📍 ${esc(destination.location)}</p>
                    <p class="destination-card__description">${esc(this.truncateText(destination.description || '', 150))}</p>
                    
                    <div class="destination-card__meta">
                        <span class="destination-card__category">${esc(destination.category || 'heritage')}</span>
                        <span class="destination-card__time">🕐 ${esc(destination.bestTime || 'Best time: Oct-Mar')}</span>
                    </div>
                    
                    <div class="destination-card__actions">
                        <button class="btn btn--primary" onclick="destinationsUI.viewDestination('${id}')">
                            👁 View Details
                        </button>
                        <button class="btn btn--soft" onclick="destinationsUI.shareDestination('${id}')">
                            📤 Share
                        </button>
                    </div>
                </div>
            </div>
        `;
        }).join('');

        this.destinationsContainer.innerHTML = `
            <div class="destinations-header">
                <h2 class="destinations-title">🌍 Explore Bihar Destinations</h2>
                <p class="destinations-subtitle">Discover amazing places from our database</p>
            </div>
            <div class="destination-grid">
                ${destinationsHTML}
            </div>
        `;

        console.log(`✅ Rendered ${destinations.length} destinations in UI`);
    }

    renderEmptyState() {
        this.destinationsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3 class="empty-title">No Destinations Found</h3>
                <p class="empty-message">
                    We couldn't find any destinations in our database.<br>
                    Please check back later or contact us to add some amazing places!
                </p>
                <button class="btn btn--primary" onclick="destinationsUI.loadDestinations()">
                    🔄 Refresh
                </button>
            </div>
        `;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Escape user/admin-supplied values before inserting into innerHTML to prevent XSS.
    escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    async viewDestination(id) {
        try {
            console.log(`🔍 Viewing destination: ${id}`);
            const destination = await BiharVihaanAPI.getDestination(id);
            this.showDestinationModal(destination);
        } catch (error) {
            console.error('❌ Error fetching destination:', error);
            this.showError('Failed to load destination details');
        }
    }

    showDestinationModal(destination) {
        const esc = (v) => this.escapeHtml(v);
        const modal = document.createElement('div');
        modal.className = 'destination-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="destinationsUI.closeModal()">
                <div class="modal-card" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3 class="modal-title">${esc(destination.name)}</h3>
                        <button class="modal-close" onclick="destinationsUI.closeModal()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="modal-image">
                            <img src="${esc(destination.image)}" alt="${esc(destination.name)}">
                        </div>
                        <div class="modal-content">
                            <p class="modal-location">📍 ${esc(destination.location)}</p>
                            <p class="modal-description">${esc(destination.description)}</p>
                            
                            ${destination.attractions && destination.attractions.length > 0 ? `
                                <div class="modal-attractions">
                                    <h4>🎯 Top Attractions:</h4>
                                    <ul class="attractions-list">
                                        ${destination.attractions.map(attr => `<li>${esc(attr)}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            <div class="modal-meta">
                                <p class="modal-time">🕐 Best Time: ${esc(destination.bestTime || 'October to March')}</p>
                                <p class="modal-reach">🚗 How to Reach: ${esc(destination.howToReach || 'By road from Patna')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 100);
    }

    closeModal() {
        const modal = document.querySelector('.destination-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    async shareDestination(id) {
        try {
            const destination = await BiharVihaanAPI.getDestination(id);
            const shareText = `Check out ${destination.name} in ${destination.location}! ${destination.description}`;
            
            if (navigator.share) {
                await navigator.share({
                    title: destination.name,
                    text: shareText,
                    url: window.location.href + '#destination-' + id
                });
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(shareText);
                alert('📋 Destination details copied to clipboard!');
            }
        } catch (error) {
            console.error('❌ Error sharing destination:', error);
            alert('❌ Failed to share destination');
        }
    }
}

// Initialize the destinations UI
const destinationsUI = new DestinationsUI();

// Add CSS styles dynamically
const destinationsStyles = `
<style>
.destinations-header {
    text-align: center;
    margin-bottom: 40px;
}

.destinations-title {
    font-size: 2.5rem;
    color: var(--brand);
    margin-bottom: 10px;
}

.destinations-subtitle {
    color: var(--muted);
    font-size: 1.1rem;
    margin-bottom: 20px;
}

.destination-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.destination-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.destination-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow);
}

.destination-card__image {
    width: 100%;
    height: 200px;
    overflow: hidden;
}

.destination-card__image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.destination-card__body {
    padding: 20px;
}

.destination-card__title {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 8px;
}

.destination-card__location {
    color: var(--brand);
    font-weight: 600;
    margin-bottom: 12px;
}

.destination-card__description {
    color: var(--muted);
    line-height: 1.6;
    margin-bottom: 16px;
}

.destination-card__meta {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.destination-card__category,
.destination-card__time {
    font-size: 0.85rem;
    padding: 4px 8px;
    border-radius: 12px;
    background: var(--beige);
    color: var(--ink);
}

.destination-card__actions {
    display: flex;
    gap: 10px;
}

.loading-container,
.error-container,
.empty-state {
    text-align: center;
    padding: 60px 20px;
}

.loading-spinner {
    font-size: 2rem;
    margin-bottom: 20px;
    animation: spin 1s linear infinite;
}

.loading-text {
    color: var(--muted);
    font-size: 1.1rem;
}

.error-icon,
.empty-icon {
    font-size: 3rem;
    margin-bottom: 20px;
}

.error-title,
.empty-title {
    color: var(--ink);
    margin-bottom: 15px;
}

.error-message,
.empty-message {
    color: var(--muted);
    line-height: 1.6;
    margin-bottom: 25px;
}

.destination-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.destination-modal.active {
    opacity: 1;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
}

.modal-card {
    background: var(--surface);
    border-radius: var(--radius);
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    margin: 20px;
    position: relative;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 0;
    border-bottom: 1px solid var(--border);
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--ink);
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 5px;
}

.modal-body {
    padding: 20px;
}

.modal-image {
    width: 100%;
    height: 250px;
    overflow: hidden;
    border-radius: var(--radius2);
    margin-bottom: 20px;
}

.modal-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.modal-content {
    margin-bottom: 20px;
}

.modal-location {
    color: var(--brand);
    font-weight: 600;
    margin-bottom: 15px;
}

.modal-description {
    color: var(--ink);
    line-height: 1.7;
    margin-bottom: 20px;
}

.modal-attractions h4 {
    color: var(--ink);
    margin-bottom: 10px;
}

.attractions-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.attractions-list li {
    padding: 5px 0;
    color: var(--muted);
}

.modal-meta {
    border-top: 1px solid var(--border);
    padding-top: 15px;
}

.modal-meta p {
    margin-bottom: 8px;
    color: var(--muted);
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
    .destination-grid {
        grid-template-columns: 1fr;
    }
    
    .modal-card {
        margin: 10px;
        max-width: 95%;
    }
}
</style>
`;

// Add styles to page
document.head.insertAdjacentHTML('beforeend', destinationsStyles);
