/**
 * Follow System Manager
 * Handles following/unfollowing users, blocking, and display logic
 */
class FollowManager {
  constructor() {
    this.initializeFollowButtons();
    this.initializeFollowModals();
  }

  // Initialize follow buttons
  initializeFollowButtons() {
    document.addEventListener('click', async (e) => {
      if (e.target.classList.contains('follow-btn')) {
        await this.handleFollowClick(e.target);
      }
      if (e.target.classList.contains('unfollow-btn')) {
        await this.handleUnfollowClick(e.target);
      }
      if (e.target.classList.contains('block-btn')) {
        await this.handleBlockClick(e.target);
      }
      if (e.target.classList.contains('unblock-btn')) {
        await this.handleUnblockClick(e.target);
      }
    });
  }

  // Initialize follow/followers modals
  initializeFollowModals() {
    document.addEventListener('click', async (e) => {
      if (e.target.classList.contains('view-followers-btn')) {
        const userId = e.target.dataset.userId;
        await this.showFollowersList(userId);
      }
      if (e.target.classList.contains('view-following-btn')) {
        const userId = e.target.dataset.userId;
        await this.showFollowingList(userId);
      }
    });
  }

  // Handle follow click
  async handleFollowClick(button) {
    const userId = button.dataset.userId;
    if (!userId) return;

    try {
      const response = await fetch(`/api/follows/${userId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        button.classList.remove('follow-btn');
        button.classList.add('unfollow-btn');
        button.textContent = 'Unfollow';
        this.showNotification('Successfully followed user!', 'success');
        this.updateFollowerCount(userId, data.followersCount);
      } else {
        this.showNotification(data.message || 'Failed to follow user', 'error');
      }
    } catch (error) {
      console.error('Error following user:', error);
      this.showNotification('An error occurred', 'error');
    }
  }

  // Handle unfollow click
  async handleUnfollowClick(button) {
    const userId = button.dataset.userId;
    if (!userId) return;

    if (!confirm('Are you sure you want to unfollow this user?')) return;

    try {
      const response = await fetch(`/api/follows/${userId}/unfollow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        button.classList.remove('unfollow-btn');
        button.classList.add('follow-btn');
        button.textContent = 'Follow';
        this.showNotification('Successfully unfollowed user', 'success');
        this.updateFollowerCount(userId, data.followersCount);
      } else {
        this.showNotification(data.message || 'Failed to unfollow user', 'error');
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      this.showNotification('An error occurred', 'error');
    }
  }

  // Handle block click
  async handleBlockClick(button) {
    const userId = button.dataset.userId;
    if (!userId) return;

    if (!confirm('Are you sure you want to block this user? They won\'t be able to see your activity.')) return;

    try {
      const response = await fetch(`/api/follows/${userId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        button.classList.remove('block-btn');
        button.classList.add('unblock-btn');
        button.textContent = 'Unblock';
        this.showNotification('User blocked successfully', 'success');
      } else {
        this.showNotification(data.message || 'Failed to block user', 'error');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      this.showNotification('An error occurred', 'error');
    }
  }

  // Handle unblock click
  async handleUnblockClick(button) {
    const userId = button.dataset.userId;
    if (!userId) return;

    try {
      const response = await fetch(`/api/follows/${userId}/unblock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        button.classList.remove('unblock-btn');
        button.classList.add('block-btn');
        button.textContent = 'Block';
        this.showNotification('User unblocked successfully', 'success');
      } else {
        this.showNotification(data.message || 'Failed to unblock user', 'error');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      this.showNotification('An error occurred', 'error');
    }
  }

  // Show followers list modal
  async showFollowersList(userId) {
    try {
      const response = await fetch(`/api/follows/${userId}/followers`);
      const data = await response.json();

      if (!response.ok) {
        this.showNotification(data.message || 'Cannot view followers', 'error');
        return;
      }

      this.showUserListModal('Followers', data.followers);
    } catch (error) {
      console.error('Error fetching followers:', error);
      this.showNotification('Failed to load followers', 'error');
    }
  }

  // Show following list modal
  async showFollowingList(userId) {
    try {
      const response = await fetch(`/api/follows/${userId}/following`);
      const data = await response.json();

      if (!response.ok) {
        this.showNotification(data.message || 'Cannot view following', 'error');
        return;
      }

      this.showUserListModal('Following', data.following);
    } catch (error) {
      console.error('Error fetching following list:', error);
      this.showNotification('Failed to load following list', 'error');
    }
  }

  // Show user list modal
  showUserListModal(title, users) {
    const modal = document.createElement('div');
    modal.className = 'user-list-modal-overlay';
    modal.innerHTML = `
      <div class="user-list-modal">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close" onclick="this.closest('.user-list-modal-overlay').remove()">×</button>
        </div>
        <div class="user-list-content">
          ${users.length === 0 ? `<p style="text-align: center; padding: 2rem;">No users found</p>` : ''}
          ${users.map(user => `
            <div class="user-list-item">
              <div class="user-info">
                <img src="${user.profileImage || '/images/default-avatar.png'}" alt="${user.username}" class="user-avatar">
                <div>
                  <h4>${user.firstName} ${user.lastName}</h4>
                  <p class="username">@${user.username}</p>
                  <p class="bio">${user.bio || ''}</p>
                </div>
              </div>
              <div class="user-stats">
                <span class="follower-count">${user.followersCount} followers</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // Update follower count display
  updateFollowerCount(userId, count) {
    const countElement = document.querySelector(`[data-follower-count="${userId}"]`);
    if (countElement) {
      countElement.textContent = `${count} follower${count !== 1 ? 's' : ''}`;
    }
  }

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FollowManager();
  });
} else {
  new FollowManager();
}
