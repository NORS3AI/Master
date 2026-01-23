/**
 * Badge System Manager
 * Handles badge display, earning, and leaderboard
 */

class BadgeManager {
  constructor() {
    this.badges = [];
    this.userBadges = [];
    this.init();
  }

  async init() {
    await this.loadAllBadges();
    this.setupBadgeDisplay();
  }

  async loadAllBadges() {
    try {
      const response = await fetch('/api/badges');
      const data = await response.json();

      if (data.success) {
        this.badges = data.badges;
      }
    } catch (err) {
      console.error('Error loading badges:', err);
    }
  }

  async loadUserBadges(userId) {
    try {
      const response = await fetch(`/api/badges/${userId}`);
      const data = await response.json();

      if (data.success) {
        this.userBadges = data.badges;
        return data.badges;
      }
    } catch (err) {
      console.error('Error loading user badges:', err);
      return [];
    }
  }

  setupBadgeDisplay() {
    const badgeContainers = document.querySelectorAll('[data-badges-container]');
    badgeContainers.forEach(container => {
      const userId = container.dataset.userId;
      if (userId) {
        this.displayUserBadges(container, userId);
      }
    });
  }

  async displayUserBadges(container, userId) {
    const badges = await this.loadUserBadges(userId);

    if (badges.length === 0) {
      container.innerHTML = '<p class="text-sm text-gray-500">No badges earned yet</p>';
      return;
    }

    const badgesHTML = badges.map(badge => `
      <div class="badge-item" title="${badge.description}">
        <span class="badge-icon">${badge.icon}</span>
        <span class="badge-name">${badge.name}</span>
      </div>
    `).join('');

    container.innerHTML = badgesHTML;
  }

  async checkBadge(badgeId, userId) {
    try {
      const response = await fetch(`/api/badges/check/${badgeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      return data.awarded;
    } catch (err) {
      console.error('Error checking badge:', err);
      return false;
    }
  }

  async checkAllBadges(userId) {
    try {
      const response = await fetch(`/api/badges/check-all/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      return data.results;
    } catch (err) {
      console.error('Error checking all badges:', err);
      return [];
    }
  }

  getBadgeColor(rarity) {
    const colors = {
      common: '#A0A0A0',
      uncommon: '#1EFF00',
      rare: '#0070DD',
      legendary: '#FF8000'
    };
    return colors[rarity] || '#FFD700';
  }

  renderBadgeGrid(container, badges) {
    const html = badges.map(badge => {
      const color = this.getBadgeColor(badge.rarity);
      return `
        <div class="badge-card" style="border-color: ${color}">
          <div class="badge-display" style="color: ${color}">
            ${badge.icon}
          </div>
          <div class="badge-info">
            <h4>${badge.name}</h4>
            <p>${badge.description}</p>
            <span class="badge-rarity" style="background-color: ${color}">
              ${badge.rarity}
            </span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  static async notifyBadgeEarned(badge) {
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
      <div class="badge-notification-content">
        <span class="badge-notification-icon">${badge.icon}</span>
        <div class="badge-notification-text">
          <p class="badge-notification-title">Badge Earned!</p>
          <p class="badge-notification-name">${badge.name}</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Load leaderboard
async function loadBadgeLeaderboard() {
  const container = document.getElementById('badge-leaderboard');
  if (!container) return;

  try {
    const response = await fetch('/api/badges/leaderboard');
    const data = await response.json();

    if (data.success) {
      const html = data.leaderboard.map((item, index) => `
        <div class="leaderboard-row">
          <span class="leaderboard-rank">${index + 1}</span>
          <img src="${item.avatar || '/images/default-avatar.png'}"
               alt="${item.username}"
               class="leaderboard-avatar">
          <span class="leaderboard-name">${item.username}</span>
          <span class="leaderboard-count">${item.badgeCount} badges</span>
        </div>
      `).join('');

      container.innerHTML = html;
    }
  } catch (err) {
    console.error('Error loading badge leaderboard:', err);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.badgeManager = new BadgeManager();
  loadBadgeLeaderboard();
});
