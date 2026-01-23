/**
 * Admin Dashboard Manager
 * Handles all dashboard metrics, charts, and real-time updates
 */

class DashboardManager {
  constructor() {
    this.charts = {};
    this.refreshInterval = 30000; // 30 seconds
    this.init();
  }

  async init() {
    await this.loadMetrics();
    await this.loadCharts();
    await this.loadTopItems();
    await this.loadRealtimeActivity();

    this.setupEventListeners();
    this.startAutoRefresh();
  }

  setupEventListeners() {
    const refreshBtn = document.getElementById('refreshBtn');
    const exportBtn = document.getElementById('exportBtn');
    const dateRangeSelect = document.getElementById('dateRange');

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refresh());
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportData());
    }

    if (dateRangeSelect) {
      dateRangeSelect.addEventListener('change', (e) => this.handleDateRangeChange(e));
    }
  }

  async loadMetrics() {
    try {
      const response = await fetch('/api/analytics/dashboard/metrics');
      const data = await response.json();

      if (data.success) {
        this.displayMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  }

  displayMetrics(metrics) {
    document.getElementById('totalUsers').textContent = this.formatNumber(metrics.totalUsers);
    document.getElementById('newUsers').textContent = `+${metrics.newUsers} this month`;

    document.getElementById('totalArticles').textContent = this.formatNumber(metrics.totalArticles);
    document.getElementById('newArticles').textContent = `+${metrics.newArticles} published`;

    document.getElementById('totalComments').textContent = this.formatNumber(metrics.totalComments);
    document.getElementById('newComments').textContent = `+${metrics.newComments} this month`;

    document.getElementById('totalViews').textContent = this.formatNumber(metrics.totalViews);
    document.getElementById('activeUsers').textContent = `${metrics.activeUsers} active users`;

    document.getElementById('totalShares').textContent = this.formatNumber(metrics.totalShares);
    document.getElementById('totalFavorites').textContent = this.formatNumber(metrics.totalFavorites);

    document.getElementById('engagementRate').textContent = `${metrics.engagementRate}%`;
    document.getElementById('activeUserCount').textContent = this.formatNumber(metrics.activeUsers);
  }

  async loadCharts() {
    await this.loadUserGrowthChart();
    await this.loadEngagementChart();
  }

  async loadUserGrowthChart() {
    try {
      const response = await fetch('/api/analytics/charts/user-growth?days=30');
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const dates = data.data.map(d => d._id);
        const counts = data.data.map(d => d.count);

        const ctx = document.getElementById('userGrowthChart');
        if (ctx) {
          this.charts.userGrowth = new Chart(ctx, {
            type: 'line',
            data: {
              labels: dates,
              datasets: [{
                label: 'New Users',
                data: counts,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  display: true,
                  position: 'top'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return value;
                    }
                  }
                }
              }
            }
          });
        }
      }
    } catch (err) {
      console.error('Error loading user growth chart:', err);
    }
  }

  async loadEngagementChart() {
    try {
      const response = await fetch('/api/analytics/charts/engagement?days=30');
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const grouped = this.groupByDate(data.data);
        const dates = Object.keys(grouped).sort();

        const eventTypes = ['article_view', 'comment', 'favorite', 'share', 'follow'];
        const datasets = eventTypes.map((type, index) => ({
          label: this.formatEventType(type),
          data: dates.map(d => {
            const item = grouped[d].find(g => g._id.type === type);
            return item ? item.count : 0;
          }),
          borderColor: this.getColorForEventType(type),
          backgroundColor: this.getColorForEventType(type, 0.1),
          borderWidth: 2,
          fill: false,
          tension: 0.4
        }));

        const ctx = document.getElementById('engagementChart');
        if (ctx) {
          this.charts.engagement = new Chart(ctx, {
            type: 'line',
            data: {
              labels: dates,
              datasets: datasets
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  display: true,
                  position: 'top'
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        }
      }
    } catch (err) {
      console.error('Error loading engagement chart:', err);
    }
  }

  async loadTopItems() {
    await this.loadTopArticles();
    await this.loadTopAuthors();
    await this.loadTopCategories();
  }

  async loadTopArticles() {
    try {
      const response = await fetch('/api/analytics/top-articles?limit=5&days=30');
      const data = await response.json();

      if (data.success) {
        const html = data.articles.map(article => `
          <div class="item">
            <div class="item-title">${article.title}</div>
            <div class="item-stats">
              <span class="item-stat">👁️ ${this.formatNumber(article.views)} views</span>
              <span class="item-stat">📤 ${this.formatNumber(article.shares)} shares</span>
              <span class="item-stat">❤️ ${this.formatNumber(article.favorites)} favorites</span>
            </div>
          </div>
        `).join('');

        document.getElementById('topArticlesList').innerHTML = html || '<p class="loading">No articles yet</p>';
      }
    } catch (err) {
      console.error('Error loading top articles:', err);
    }
  }

  async loadTopAuthors() {
    try {
      const response = await fetch('/api/analytics/top-authors?limit=5');
      const data = await response.json();

      if (data.success) {
        const html = data.authors.map(author => `
          <div class="item">
            <div class="item-title">✍️ ${author.username}</div>
            <div class="item-stats">
              <span class="item-stat">📝 ${author.articleCount} articles</span>
              <span class="item-stat">👁️ ${this.formatNumber(author.totalViews)} views</span>
            </div>
          </div>
        `).join('');

        document.getElementById('topAuthorsList').innerHTML = html || '<p class="loading">No authors yet</p>';
      }
    } catch (err) {
      console.error('Error loading top authors:', err);
    }
  }

  async loadTopCategories() {
    try {
      const response = await fetch('/api/analytics/top-categories');
      const data = await response.json();

      if (data.success) {
        const html = data.categories.map(cat => `
          <div class="item">
            <div class="item-title">${cat.category}</div>
            <div class="item-stats">
              <span class="item-stat">📰 ${cat.count} articles</span>
              <span class="item-stat">👁️ ${this.formatNumber(cat.totalViews)} views</span>
            </div>
          </div>
        `).join('');

        document.getElementById('topCategoriesList').innerHTML = html || '<p class="loading">No categories yet</p>';
      }
    } catch (err) {
      console.error('Error loading top categories:', err);
    }
  }

  async loadRealtimeActivity() {
    try {
      const response = await fetch('/api/analytics/real-time?limit=20');
      const data = await response.json();

      if (data.success) {
        const html = data.activity.slice(0, 10).map(activity => `
          <div class="activity-item">
            <span class="activity-timestamp">${this.formatTime(activity.createdAt)}</span>
            <span class="activity-description">
              ${this.getActivityEmoji(activity.eventType)}
              ${this.formatEventType(activity.eventType)} event logged
            </span>
          </div>
        `).join('');

        document.getElementById('realtimeActivity').innerHTML = html || '<p class="loading">No activity yet</p>';
      }
    } catch (err) {
      console.error('Error loading real-time activity:', err);
    }
  }

  async refresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.disabled = true;
    refreshBtn.textContent = '⏳ Refreshing...';

    await this.loadMetrics();
    await this.loadCharts();
    await this.loadTopItems();
    await this.loadRealtimeActivity();

    refreshBtn.disabled = false;
    refreshBtn.textContent = '🔄 Refresh';
  }

  async handleDateRangeChange(e) {
    const range = e.target.value;
    // TODO: Implement date range filtering
    console.log('Date range changed to:', range);
    await this.refresh();
  }

  async exportData() {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv' })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  }

  startAutoRefresh() {
    setInterval(() => {
      this.loadRealtimeActivity();
    }, this.refreshInterval);
  }

  formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }

  formatEventType(type) {
    const types = {
      'page_view': 'Page View',
      'article_view': 'Article View',
      'comment': 'Comment',
      'favorite': 'Favorite',
      'share': 'Share',
      'follow': 'Follow',
      'login': 'Login',
      'registration': 'Registration',
      'badge_earned': 'Badge Earned'
    };
    return types[type] || type;
  }

  getActivityEmoji(type) {
    const emojis = {
      'page_view': '👁️',
      'article_view': '📰',
      'comment': '💬',
      'favorite': '❤️',
      'share': '📤',
      'follow': '👥',
      'login': '🔐',
      'registration': '✨',
      'badge_earned': '🏆'
    };
    return emojis[type] || '📌';
  }

  getColorForEventType(type, opacity) {
    const colors = {
      'article_view': 'rgb(102, 126, 234)',
      'comment': 'rgb(118, 75, 162)',
      'favorite': 'rgb(237, 100, 166)',
      'share': 'rgb(255, 159, 64)',
      'follow': 'rgb(75, 192, 192)'
    };

    const color = colors[type] || 'rgb(200, 200, 200)';

    if (opacity !== undefined) {
      return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }

    return color;
  }

  groupByDate(data) {
    return data.reduce((acc, item) => {
      const date = item._id.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.dashboardManager = new DashboardManager();
});
