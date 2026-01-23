/**
 * Activity Feed Manager
 * Handles loading, displaying, and managing user activity feed
 */

class ActivityFeedManager {
  constructor() {
    this.currentPage = 1;
    this.isLoading = false;
    this.container = null;
    this.init();
  }

  init() {
    this.container = document.getElementById('activity-feed-container');
    if (this.container) {
      this.loadFeed(1);
      this.setupPagination();
      this.setupAutoRefresh();
    }
  }

  async loadFeed(page = 1) {
    if (this.isLoading) return;

    this.isLoading = true;
    try {
      const response = await fetch(`/api/activity/feed?page=${page}`);
      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          this.container.innerHTML = '';
        }
        this.renderActivities(data.activities);
        this.currentPage = page;
        this.updatePagination(data.pagination);
      } else {
        console.error('Error loading feed:', data.error);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      this.isLoading = false;
    }
  }

  renderActivities(activities) {
    if (activities.length === 0 && this.currentPage === 1) {
      this.container.innerHTML = '<p class="text-center text-gray-500">No activities yet. Follow users to see their activities!</p>';
      return;
    }

    activities.forEach(activity => {
      const activityEl = this.createActivityElement(activity);
      this.container.appendChild(activityEl);
    });
  }

  createActivityElement(activity) {
    const { userId, type, metadata, createdAt } = activity;
    const timeAgo = this.formatTimeAgo(new Date(createdAt));

    let activityText = '';
    let icon = '';

    switch (type) {
      case 'follow':
        icon = '👤';
        activityText = `followed ${metadata.userName}`;
        break;
      case 'comment':
        icon = '💬';
        activityText = `commented on "${metadata.articleTitle}"`;
        break;
      case 'favorite':
        icon = '❤️';
        activityText = `favorited "${metadata.articleTitle}"`;
        break;
      case 'article_created':
        icon = '📝';
        activityText = `published "${metadata.articleTitle}"`;
        break;
      case 'badge_earned':
        icon = '🏆';
        activityText = `earned ${metadata.badgeIcon} ${metadata.badgeName} badge`;
        break;
      default:
        icon = '📌';
        activityText = 'had activity';
    }

    const div = document.createElement('div');
    div.className = 'activity-item';
    div.innerHTML = `
      <div class="activity-content">
        <div class="activity-header">
          <img src="${metadata.userAvatar || '/images/default-avatar.png'}"
               alt="${metadata.userName}"
               class="activity-avatar">
          <div class="activity-text">
            <strong>${metadata.userName || 'User'}</strong> ${activityText}
            <span class="activity-time">${timeAgo}</span>
          </div>
        </div>
        <div class="activity-icon">${icon}</div>
      </div>
    `;

    return div;
  }

  formatTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString();
  }

  setupPagination() {
    const paginationEl = document.getElementById('activity-pagination');
    if (paginationEl) {
      paginationEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-button')) {
          const page = parseInt(e.target.dataset.page);
          this.loadFeed(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  updatePagination(pagination) {
    const paginationEl = document.getElementById('activity-pagination');
    if (!paginationEl) return;

    paginationEl.innerHTML = '';

    if (pagination.current > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'page-button';
      prevBtn.dataset.page = pagination.current - 1;
      prevBtn.textContent = '← Previous';
      paginationEl.appendChild(prevBtn);
    }

    for (let i = 1; i <= pagination.total; i++) {
      const btn = document.createElement('button');
      btn.className = `page-button ${i === pagination.current ? 'active' : ''}`;
      btn.dataset.page = i;
      btn.textContent = i;
      paginationEl.appendChild(btn);
    }

    if (pagination.current < pagination.total) {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'page-button';
      nextBtn.dataset.page = pagination.current + 1;
      nextBtn.textContent = 'Next →';
      paginationEl.appendChild(nextBtn);
    }
  }

  setupAutoRefresh() {
    // Refresh feed every 30 seconds
    setInterval(() => {
      this.loadFeed(1);
    }, 30000);
  }

  // Static method to log activity
  static async logActivity(userId, type, targetId, targetType, targetUser, metadata) {
    try {
      await fetch('/api/activity/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          type,
          targetId,
          targetType,
          targetUser,
          metadata,
          isPublic: true
        })
      });
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('activity-feed-container')) {
    window.activityFeed = new ActivityFeedManager();
  }
});
