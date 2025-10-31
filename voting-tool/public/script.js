class VotingApp {
    constructor() {
        this.currentApp = null;
        this.votedSuggestions = new Set(this.getVotedSuggestions());
        this.currentFilter = 'all';
        this.allSuggestions = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadApps();
    }

    bindEvents() {
        // Navigation
        document.getElementById('backBtn').addEventListener('click', () => this.showAppSelection());
        document.getElementById('formBackBtn').addEventListener('click', () => this.showSuggestions());
        document.getElementById('fabBtn').addEventListener('click', () => this.showSuggestionForm());
        document.getElementById('cancelBtn').addEventListener('click', () => this.showSuggestions());

        // Form submission
        document.getElementById('newSuggestionForm').addEventListener('submit', (e) => this.submitSuggestion(e));
    }

    // Navigation methods
    showAppSelection() {
        document.getElementById('appSelection').classList.remove('hidden');
        document.getElementById('suggestionsView').classList.add('hidden');
        document.getElementById('suggestionForm').classList.add('hidden');
        document.getElementById('fabBtn').style.display = 'none';
        this.currentApp = null;
    }

    showSuggestions() {
        document.getElementById('appSelection').classList.add('hidden');
        document.getElementById('suggestionsView').classList.remove('hidden');
        document.getElementById('suggestionForm').classList.add('hidden');
        document.getElementById('fabBtn').style.display = 'flex';
    }

    showSuggestionForm() {
        document.getElementById('appSelection').classList.add('hidden');
        document.getElementById('suggestionsView').classList.add('hidden');
        document.getElementById('suggestionForm').classList.remove('hidden');
        document.getElementById('fabBtn').style.display = 'none';

        // Clear form
        document.getElementById('newSuggestionForm').reset();
    }

    // API methods
    async loadApps() {
        try {
            const response = await fetch('/api/apps');

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const apps = await response.json();

            if (apps.length === 0) {
                this.renderApps([]);
                return;
            }

            this.renderApps(apps);
        } catch (error) {
            console.error('Error loading apps:', error);
            this.showToast('Fehler beim Laden der Apps', 'error');
        }
    }


    async loadSuggestions(appId) {
        try {
            const response = await fetch(`/api/apps/${appId}/suggestions`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const suggestions = await response.json();

            // Ensure suggestions is an array
            if (!Array.isArray(suggestions)) {
                throw new Error('Invalid response format from server');
            }

            // hasVoted is now included in the response from backend
            this.allSuggestions = suggestions;
            this.renderFilterBar();
            this.renderSuggestions(this.filterSuggestions(suggestions));
        } catch (error) {
            console.error('Error loading suggestions:', error);
            this.showToast('Fehler beim Laden der Vorschläge', 'error');
        }
    }

    async submitSuggestion(e) {
        e.preventDefault();

        const title = document.getElementById('suggestionTitle').value.trim();
        const description = document.getElementById('suggestionDescription').value.trim();

        if (!title || !description) {
            this.showToast('Bitte füllen Sie alle Felder aus', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/apps/${this.currentApp.id}/suggestions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description })
            });

            if (response.ok) {
                const result = await response.json();
                this.showSuccessOverlay();
                this.loadSuggestions(this.currentApp.id);
            } else {
                const error = await response.json();
                this.showToast(error.error || 'Fehler beim Einreichen des Vorschlags', 'error');
            }
        } catch (error) {
            console.error('Error submitting suggestion:', error);
            this.showToast('Fehler beim Einreichen des Vorschlags', 'error');
        }
    }

    async voteSuggestion(suggestionId, button) {
        if (button.disabled) return;

        const isVoted = button.classList.contains('voted');

        try {
            button.disabled = true;
            button.textContent = isVoted ? 'Removing...' : 'Voting...';

            const url = `/api/suggestions/${suggestionId}/vote`;
            const method = isVoted ? 'DELETE' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const voteCountEl = button.parentElement.querySelector('.vote-count');
                const currentCount = parseInt(voteCountEl.textContent);

                if (isVoted) {
                    // Unvote
                    this.showToast('Vote erfolgreich entfernt!', 'success');
                    button.textContent = 'Vote';
                    button.classList.remove('voted');
                    voteCountEl.textContent = Math.max(0, currentCount - 1);
                    this.votedSuggestions.delete(suggestionId);
                } else {
                    // Vote
                    this.showToast('Vote erfolgreich abgegeben!', 'success');
                    button.textContent = 'Gevotet';
                    button.classList.add('voted');
                    voteCountEl.textContent = currentCount + 1;
                    this.votedSuggestions.add(suggestionId);
                }

                this.saveVotedSuggestions();
                button.disabled = false;
            } else {
                const error = await response.json();
                this.showToast(error.error || 'Fehler beim Voten', 'error');
                button.disabled = false;
                button.textContent = isVoted ? 'Gevotet' : 'Vote';
            }
        } catch (error) {
            console.error('Error voting:', error);
            this.showToast('Fehler beim Voten', 'error');
            button.disabled = false;
            button.textContent = isVoted ? 'Gevotet' : 'Vote';
        }
    }

    // Filtering methods
    renderFilterBar() {
        const suggestionsList = document.getElementById('suggestionsList');

        // Don't render filter bar if no suggestions at all
        if (this.allSuggestions.length === 0) {
            return;
        }

        // Count suggestions by tag
        const counts = {
            all: this.allSuggestions.length,
            'wird umgesetzt': 0,
            'ist umgesetzt': 0,
            'wird geprüft': 0,
            'wird nicht umgesetzt': 0,
            'keine': 0
        };

        this.allSuggestions.forEach(s => {
            if (s.tag && counts.hasOwnProperty(s.tag)) {
                counts[s.tag]++;
            } else if (!s.tag) {
                counts['keine']++;
            }
        });

        const filters = [
            { id: 'all', label: 'Alle', count: counts.all, color: '#6366F1' },
            { id: 'wird umgesetzt', label: 'Wird umgesetzt', count: counts['wird umgesetzt'], color: '#10b981' },
            { id: 'ist umgesetzt', label: 'Ist umgesetzt', count: counts['ist umgesetzt'], color: '#059669' },
            { id: 'wird geprüft', label: 'Wird geprüft', count: counts['wird geprüft'], color: '#f59e0b' },
            { id: 'wird nicht umgesetzt', label: 'Wird nicht umgesetzt', count: counts['wird nicht umgesetzt'], color: '#ef4444' },
            { id: 'keine', label: 'Ohne Status', count: counts['keine'], color: '#64748b' }
        ];

        // Only show filters with count > 0 (except 'all')
        const visibleFilters = filters.filter(f => f.id === 'all' || f.count > 0);

        const filterBar = `
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; padding: 16px; background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow);">
                ${visibleFilters.map(filter => `
                    <button
                        onclick="app.setFilter('${filter.id}')"
                        class="filter-pill ${this.currentFilter === filter.id ? 'active' : ''}"
                        style="
                            padding: 8px 16px;
                            border: 2px solid ${this.currentFilter === filter.id ? filter.color : 'var(--border)'};
                            background: ${this.currentFilter === filter.id ? filter.color : 'var(--surface)'};
                            color: ${this.currentFilter === filter.id ? 'white' : 'var(--text-primary)'};
                            border-radius: var(--radius-full);
                            font-size: 0.875rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s;
                            display: inline-flex;
                            align-items: center;
                            gap: 6px;
                        "
                        onmouseover="if ('${this.currentFilter}' !== '${filter.id}') { this.style.borderColor = '${filter.color}'; this.style.background = '${filter.color}15'; }"
                        onmouseout="if ('${this.currentFilter}' !== '${filter.id}') { this.style.borderColor = 'var(--border)'; this.style.background = 'var(--surface)'; }"
                    >
                        <span>${filter.label}</span>
                        <span style="
                            background: ${this.currentFilter === filter.id ? 'rgba(255,255,255,0.3)' : 'var(--border-light)'};
                            padding: 2px 8px;
                            border-radius: var(--radius-full);
                            font-size: 0.75rem;
                        ">${filter.count}</span>
                    </button>
                `).join('')}
            </div>
        `;

        // Prepend filter bar to suggestions list
        const existingFilterBar = suggestionsList.querySelector('.filter-bar-container');
        if (existingFilterBar) {
            existingFilterBar.remove();
        }

        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-bar-container';
        filterContainer.innerHTML = filterBar;
        suggestionsList.insertBefore(filterContainer, suggestionsList.firstChild);
    }

    setFilter(filterId) {
        this.currentFilter = filterId;
        this.renderFilterBar();
        this.renderSuggestions(this.filterSuggestions(this.allSuggestions));
    }

    filterSuggestions(suggestions) {
        if (this.currentFilter === 'all') {
            return suggestions;
        } else if (this.currentFilter === 'keine') {
            return suggestions.filter(s => !s.tag);
        } else {
            return suggestions.filter(s => s.tag === this.currentFilter);
        }
    }

    // Rendering methods
    renderApps(apps) {
        const appGrid = document.getElementById('appGrid');

        if (apps.length === 0) {
            appGrid.innerHTML = '<div class="loading">Keine Apps verfügbar</div>';
            return;
        }

        appGrid.innerHTML = apps.map(app => `
            <div class="app-card" onclick="app.selectApp('${app.id}', '${app.name}')">
                <h3>${this.escapeHtml(app.name)}</h3>
                <p>${this.escapeHtml(app.description || 'Keine Beschreibung verfügbar')}</p>
            </div>
        `).join('');
    }

    renderSuggestions(suggestions) {
        const suggestionsList = document.getElementById('suggestionsList');

        // Remove existing suggestions but keep filter bar
        const existingCards = suggestionsList.querySelectorAll('.suggestion-card');
        existingCards.forEach(card => card.remove());

        // Remove loading message if exists
        const loadingMsg = suggestionsList.querySelector('.loading:not(.filter-bar-container .loading)');
        if (loadingMsg && !loadingMsg.closest('.filter-bar-container')) {
            loadingMsg.remove();
        }

        if (suggestions.length === 0) {
            const noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'loading';
            noResultsMsg.innerHTML = `
                ${this.currentFilter === 'all' ?
                    'Noch keine Vorschläge vorhanden.<br>Seien Sie der Erste und reichen Sie einen Vorschlag ein!' :
                    'Keine Vorschläge mit diesem Status gefunden.'
                }
            `;
            suggestionsList.appendChild(noResultsMsg);
            return;
        }

        const suggestionsHTML = suggestions.map(suggestion => {
            // Check if suggestion is implemented (ausgegraut)
            const isImplemented = suggestion.tag === 'ist umgesetzt';
            const cardOpacity = isImplemented ? 'opacity: 0.5;' : '';

            // Generate tag badge if tag exists
            let tagBadge = '';
            if (suggestion.tag) {
                let tagColor = '';
                let tagIcon = '';

                switch (suggestion.tag) {
                    case 'wird umgesetzt':
                        tagColor = '#10b981'; // green
                        tagIcon = '✓';
                        break;
                    case 'ist umgesetzt':
                        tagColor = '#059669'; // darker green
                        tagIcon = '✓✓';
                        break;
                    case 'wird nicht umgesetzt':
                        tagColor = '#ef4444'; // red
                        tagIcon = '✗';
                        break;
                    case 'wird geprüft':
                        tagColor = '#f59e0b'; // orange
                        tagIcon = '⏳';
                        break;
                }

                tagBadge = `
                    <div style="margin-top: 8px;">
                        <span style="display: inline-flex; align-items: center; gap: 4px; background: ${tagColor}; color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 500;">
                            <span>${tagIcon}</span>
                            <span>${this.escapeHtml(suggestion.tag)}</span>
                        </span>
                    </div>
                `;
            }

            // Generate comment badge if comments exist
            const hasComments = suggestion.commentCount > 0;
            const commentBadge = hasComments ? `
                <div style="margin-top: 8px;">
                    <button
                        onclick="app.toggleComments('${suggestion.id}'); event.stopPropagation();"
                        style="display: inline-flex; align-items: center; gap: 4px; background: #3b82f6; color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; border: none; cursor: pointer;"
                    >
                        <span>💬</span>
                        <span>${suggestion.commentCount} Admin-Kommentar${suggestion.commentCount > 1 ? 'e' : ''}</span>
                    </button>
                </div>
            ` : '';

            return `
                <div class="suggestion-card" style="${cardOpacity}">
                    <div class="suggestion-header">
                        <div class="suggestion-content">
                            <h3 class="suggestion-title">${this.escapeHtml(suggestion.title)}</h3>
                            <p class="suggestion-description">${this.escapeHtml(suggestion.description)}</p>
                            ${tagBadge}
                            ${commentBadge}
                            <div id="comments-${suggestion.id}" style="display: none; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-light);">
                                <div class="loading" style="font-size: 0.9rem;">Kommentare werden geladen...</div>
                            </div>
                        </div>
                    </div>
                    <div class="suggestion-footer">
                        <div class="vote-info">
                            <span class="vote-count">${suggestion.votes || 0}</span>
                            <span>Vote${(suggestion.votes || 0) !== 1 ? 's' : ''}</span>
                        </div>
                        <button
                            class="vote-btn ${suggestion.hasVoted ? 'voted' : ''}"
                            ${suggestion.hasVoted || isImplemented ? 'disabled' : ''}
                            onclick="app.voteSuggestion('${suggestion.id}', this)"
                        >
                            ${suggestion.hasVoted ? 'Gevotet ✓' : 'Vote'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Create a temporary container and append all suggestions
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = suggestionsHTML;

        // Append all suggestion cards to the list
        Array.from(tempContainer.children).forEach(child => {
            suggestionsList.appendChild(child);
        });
    }

    selectApp(appId, appName) {
        this.currentApp = { id: appId, name: appName };
        document.getElementById('currentAppName').textContent = appName;
        this.showSuggestions();
        this.loadSuggestions(appId);
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;

        // Show toast
        toast.classList.add('show');

        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    getVotedSuggestions() {
        try {
            return JSON.parse(localStorage.getItem('votedSuggestions') || '[]');
        } catch {
            return [];
        }
    }

    saveVotedSuggestions() {
        try {
            localStorage.setItem('votedSuggestions', JSON.stringify([...this.votedSuggestions]));
        } catch (error) {
            console.error('Error saving voted suggestions:', error);
        }
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Unbekannt';
        try {
            let date;

            // Handle Firestore timestamp object
            if (timestamp._seconds !== undefined) {
                date = new Date(timestamp._seconds * 1000);
            } else if (timestamp.seconds !== undefined) {
                date = new Date(timestamp.seconds * 1000);
            } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
                date = new Date(timestamp);
            } else {
                return 'Unbekannt';
            }

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Unbekannt';
            }

            return date.toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Unbekannt';
        }
    }

    showSuccessOverlay() {
        const overlay = document.getElementById('successOverlay');
        overlay.style.display = 'flex';
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    closeSuccessOverlay() {
        const overlay = document.getElementById('successOverlay');
        overlay.style.display = 'none';
        // Restore body scroll
        document.body.style.overflow = '';
        // Navigate back to suggestions
        this.showSuggestions();
    }

    async toggleComments(suggestionId) {
        const commentsDiv = document.getElementById(`comments-${suggestionId}`);

        if (commentsDiv.style.display === 'none') {
            commentsDiv.style.display = 'block';
            await this.loadComments(suggestionId);
        } else {
            commentsDiv.style.display = 'none';
        }
    }

    async loadComments(suggestionId) {
        const commentsDiv = document.getElementById(`comments-${suggestionId}`);

        try {
            const response = await fetch(`/api/suggestions/${suggestionId}/comments`);
            const comments = await response.json();

            if (response.ok) {
                this.renderComments(suggestionId, comments);
            } else {
                throw new Error(comments.error);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            commentsDiv.innerHTML = '<div style="color: var(--danger-color); padding: 8px; font-size: 0.9rem;">Fehler beim Laden der Kommentare</div>';
        }
    }

    renderComments(suggestionId, comments) {
        const commentsDiv = document.getElementById(`comments-${suggestionId}`);

        if (comments.length === 0) {
            commentsDiv.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem; font-style: italic;">Noch keine Kommentare vorhanden.</p>';
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';

        comments.forEach((comment, commentIdx) => {
            html += `
                <div style="background: var(--border-light); border-radius: 8px; padding: 12px;">
                    <div style="display: flex; align-items: start; gap: 8px; margin-bottom: 4px;">
                        <span style="background: var(--primary-color); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">ADMIN</span>
                        <span style="color: var(--text-secondary); font-size: 0.8rem;">
                            ${this.formatDate(comment.createdAt)}
                        </span>
                    </div>
                    <p style="margin: 8px 0 0 0; white-space: pre-wrap; font-size: 0.9rem; line-height: 1.5; color: var(--text-primary);">${this.escapeHtml(comment.text)}</p>
                    ${comment.screenshots && comment.screenshots.length > 0 ? `
                        <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                            ${comment.screenshots.map((screenshot, idx) => `
                                <img
                                    src="${screenshot}"
                                    alt="Screenshot ${idx + 1}"
                                    data-screenshot-index="${commentIdx}-${idx}"
                                    onclick="app.showImageModal(this.src)"
                                    style="max-width: 200px; max-height: 200px; border-radius: 8px; cursor: pointer; border: 2px solid var(--border); object-fit: cover; box-shadow: var(--shadow); transition: transform 0.2s;"
                                    onmouseover="this.style.transform='scale(1.05)'"
                                    onmouseout="this.style.transform='scale(1)'"
                                >
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += '</div>';
        commentsDiv.innerHTML = html;
    }

    showImageModal(imageSrc) {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        modalImage.src = imageSrc;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeImageModal() {
        const modal = document.getElementById('imageModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Initialize the app
const app = new VotingApp();