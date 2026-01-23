class ArticleModal {
  constructor() {
    this.articles = [];
    this.currentIndex = -1;
    this.isAuthenticated = false;
    this.init();
  }

  init() {
    this.createModalHTML();
    this.attachEventListeners();
    this.checkAuthentication();
    this.loadArticles();
  }

  createModalHTML() {
    const modalHTML = `
      <div id="modalOverlay" class="modal-overlay">
        <div class="modal-container" id="modalContainer">
          <div class="modal-side-left" id="modalSideLeft"></div>
          <div class="modal-content" id="modalContent">
            <div class="modal-header">
              <div class="modal-title">
                <h2 id="articleTitle"></h2>
              </div>
              <button class="modal-close" id="modalCloseBtn">×</button>
            </div>
            <div id="articleMeta" class="modal-meta"></div>
            <img id="articleImage" class="modal-image" alt="Article image">
            <div class="modal-body" id="articleBody"></div>
            <div class="modal-share-buttons">
              <button class="share-btn share-twitter" id="shareTwitterBtn" title="Share on Twitter">
                <span>𝕏</span>
              </button>
              <button class="share-btn share-facebook" id="shareFacebookBtn" title="Share on Facebook">
                <span>f</span>
              </button>
              <button class="share-btn share-linkedin" id="shareLinkedInBtn" title="Share on LinkedIn">
                <span>in</span>
              </button>
              <button class="share-btn share-email" id="shareEmailBtn" title="Share via Email">
                <span>✉</span>
              </button>
              <button class="share-btn share-copy" id="shareCopyBtn" title="Copy link">
                <span>🔗</span>
              </button>
            </div>
            <div class="modal-footer">
              <button class="modal-favorite-btn" id="favoriteBtn"></button>
            </div>
          </div>
          <div class="modal-side-right" id="modalSideRight"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  attachEventListeners() {
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('modalCloseBtn');
    const sideLeft = document.getElementById('modalSideLeft');
    const sideRight = document.getElementById('modalSideRight');
    const favoriteBtn = document.getElementById('favoriteBtn');

    // Share buttons
    const shareTwitterBtn = document.getElementById('shareTwitterBtn');
    const shareFacebookBtn = document.getElementById('shareFacebookBtn');
    const shareLinkedInBtn = document.getElementById('shareLinkedInBtn');
    const shareEmailBtn = document.getElementById('shareEmailBtn');
    const shareCopyBtn = document.getElementById('shareCopyBtn');

    closeBtn.addEventListener('click', () => this.closeModal());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal();
    });

    sideLeft.addEventListener('click', () => this.previousArticle());
    sideRight.addEventListener('click', () => this.nextArticle());

    favoriteBtn.addEventListener('click', () => this.toggleFavorite());

    shareTwitterBtn.addEventListener('click', () => this.shareOnTwitter());
    shareFacebookBtn.addEventListener('click', () => this.shareOnFacebook());
    shareLinkedInBtn.addEventListener('click', () => this.shareOnLinkedIn());
    shareEmailBtn.addEventListener('click', () => this.shareViaEmail());
    shareCopyBtn.addEventListener('click', () => this.copyShareLink());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') this.closeModal();
      if (e.key === 'ArrowLeft') this.previousArticle();
      if (e.key === 'ArrowRight') this.nextArticle();
    });
  }

  checkAuthentication() {
    this.isAuthenticated = !!document.querySelector('[data-user-id]');
  }

  async loadArticles() {
    try {
      const response = await fetch('/api/articles');
      if (!response.ok) throw new Error('Failed to load articles');
      this.articles = await response.json();
    } catch (error) {
      console.error('Error loading articles:', error);
      showNotification('Failed to load articles', 'error');
    }
  }

  openArticle(articleId) {
    const index = this.articles.findIndex(a => a._id === articleId);
    if (index === -1) return;

    this.currentIndex = index;
    this.displayArticle();
    this.openModal();
  }

  displayArticle() {
    if (this.currentIndex < 0 || this.currentIndex >= this.articles.length) return;

    const article = this.articles[this.currentIndex];

    document.getElementById('articleTitle').textContent = article.title;
    document.getElementById('articleImage').src = article.image || 'https://via.placeholder.com/800x400?text=RS+News';
    document.getElementById('articleImage').alt = article.title;

    const metaHTML = `
      <div class="modal-meta-item">
        <span>${new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
      <div class="modal-meta-item">
        <span class="modal-meta-badge">${article.category}</span>
      </div>
      <div class="modal-meta-item">
        <span>${article.readTime} min read</span>
      </div>
      <div class="modal-meta-item">
        <span>By ${article.author}</span>
      </div>
    `;
    document.getElementById('articleMeta').innerHTML = metaHTML;

    const bodyHTML = `
      <p>${article.description}</p>
      ${article.content.split('\n\n').map(para => `<p>${para}</p>`).join('')}
    `;
    document.getElementById('articleBody').innerHTML = bodyHTML;

    this.updateNavigationButtons();
    this.updateFavoriteButton(article._id);
  }

  updateNavigationButtons() {
    const container = document.getElementById('modalContainer');
    const isFirstArticle = this.currentIndex === 0;
    const isLastArticle = this.currentIndex === this.articles.length - 1;

    const sideLeft = document.getElementById('modalSideLeft');
    const sideRight = document.getElementById('modalSideRight');

    sideLeft.style.opacity = isFirstArticle ? '0.3' : '1';
    sideLeft.style.pointerEvents = isFirstArticle ? 'none' : 'auto';
    sideRight.style.opacity = isLastArticle ? '0.3' : '1';
    sideRight.style.pointerEvents = isLastArticle ? 'none' : 'auto';
  }

  async updateFavoriteButton(articleId) {
    const btn = document.getElementById('favoriteBtn');
    btn.textContent = 'Add to Favorites';
    btn.classList.remove('favorited');

    if (!this.isAuthenticated) {
      btn.disabled = true;
      btn.textContent = 'Login to Favorite';
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      return;
    }

    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';

    try {
      const response = await fetch(`/api/articles/${articleId}/is-favorited`);
      if (!response.ok) throw new Error('Failed to check favorite status');
      const data = await response.json();

      if (data.isFavorited) {
        btn.classList.add('favorited');
        btn.textContent = 'Remove from Favorites';
      } else {
        btn.textContent = 'Add to Favorites';
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }

  async toggleFavorite() {
    if (!this.isAuthenticated) {
      showNotification('Please login to favorite articles', 'info');
      window.location.href = '/auth/login';
      return;
    }

    const article = this.articles[this.currentIndex];
    const btn = document.getElementById('favoriteBtn');

    try {
      const response = await fetch(`/api/articles/${article._id}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to update favorite');
      const data = await response.json();

      btn.classList.toggle('favorited');
      btn.textContent = data.isFavorited ? 'Remove from Favorites' : 'Add to Favorites';
      showNotification(data.message, 'success');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showNotification('Failed to update favorite', 'error');
    }
  }

  nextArticle() {
    if (this.currentIndex < this.articles.length - 1) {
      this.currentIndex++;
      this.displayArticle();
    }
  }

  previousArticle() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.displayArticle();
    }
  }

  getShareUrl() {
    if (this.currentIndex < 0 || this.currentIndex >= this.articles.length) return '';
    const article = this.articles[this.currentIndex];
    return `${window.location.origin}/articles/${article._id}`;
  }

  trackShare(platform) {
    const article = this.articles[this.currentIndex];
    fetch(`/api/articles/${article._id}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform })
    }).catch(err => console.error('Error tracking share:', err));
  }

  shareOnTwitter() {
    const article = this.articles[this.currentIndex];
    const url = this.getShareUrl();
    const text = `Check out: "${article.title}" on RS News - ${article.description}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=shipping,parcel,mail`;
    this.trackShare('twitter');
    window.open(twitterUrl, 'twitter-share', 'width=550,height=420');
  }

  shareOnFacebook() {
    const url = this.getShareUrl();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    this.trackShare('facebook');
    window.open(facebookUrl, 'facebook-share', 'width=550,height=420');
  }

  shareOnLinkedIn() {
    const article = this.articles[this.currentIndex];
    const url = this.getShareUrl();
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    this.trackShare('linkedin');
    window.open(linkedinUrl, 'linkedin-share', 'width=550,height=420');
  }

  shareViaEmail() {
    const article = this.articles[this.currentIndex];
    const url = this.getShareUrl();
    const subject = `Check out this article: ${article.title}`;
    const body = `Hi,\n\nI thought you might be interested in this article on RS News:\n\n${article.title}\n${article.description}\n\nRead more: ${url}\n\nBest regards`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    this.trackShare('email');
    window.location.href = mailtoUrl;
  }

  copyShareLink() {
    const url = this.getShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      this.trackShare('copy');
      showNotification('Link copied to clipboard!', 'success');
    }).catch(() => {
      showNotification('Failed to copy link', 'error');
    });
  }

  openModal() {
    const overlay = document.getElementById('modalOverlay');
    const container = document.getElementById('modalContainer');
    overlay.classList.add('active');
    container.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    const overlay = document.getElementById('modalOverlay');
    const container = document.getElementById('modalContainer');
    const content = document.getElementById('modalContent');

    content.classList.add('exit');

    setTimeout(() => {
      overlay.classList.remove('active');
      container.classList.remove('active');
      content.classList.remove('exit');
      document.body.style.overflow = 'auto';
      this.currentIndex = -1;
    }, 300);
  }
}

// Initialize modal when DOM is ready
let articleModal;
document.addEventListener('DOMContentLoaded', () => {
  articleModal = new ArticleModal();
});

// Function to open article from click event
function openArticleModal(articleId) {
  if (articleModal) {
    articleModal.openArticle(articleId);
  }
}
