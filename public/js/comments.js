class CommentsManager {
  constructor(articleId, isAuthenticated, userId) {
    this.articleId = articleId;
    this.isAuthenticated = isAuthenticated;
    this.userId = userId;
    this.init();
  }

  init() {
    this.loadComments();
    if (this.isAuthenticated) {
      this.setupFormHandler();
    }
  }

  async loadComments() {
    try {
      const response = await fetch(`/api/comments/article/${this.articleId}`);
      if (!response.ok) throw new Error('Failed to load comments');
      const comments = await response.json();
      this.displayComments(comments);
    } catch (error) {
      console.error('Error loading comments:', error);
      this.showError('Failed to load comments');
    }
  }

  displayComments(comments) {
    const container = document.getElementById('commentsList');
    if (!container) return;

    if (comments.length === 0) {
      container.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
      return;
    }

    container.innerHTML = comments.map(comment => this.createCommentHTML(comment)).join('');

    // Add event listeners
    comments.forEach(comment => {
      const likeBtn = container.querySelector(`[data-like-btn="${comment._id}"]`);
      const deleteBtn = container.querySelector(`[data-delete-btn="${comment._id}"]`);

      if (likeBtn) {
        likeBtn.addEventListener('click', () => this.likeComment(comment._id, likeBtn));
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => this.deleteComment(comment._id));
      }
    });
  }

  createCommentHTML(comment) {
    const userInitial = comment.username.charAt(0).toUpperCase();
    const timeDiff = this.getTimeAgo(new Date(comment.createdAt));
    const isOwner = this.userId === comment.userId;

    return `
      <div class="comment ${comment.isPinned ? 'pinned' : ''}">
        <div class="comment-header">
          <div class="comment-user-info">
            <div class="comment-avatar">
              ${comment.userImage ? `<img src="${comment.userImage}" alt="${comment.username}">` : userInitial}
            </div>
            <div class="comment-user">
              <span class="comment-username">${comment.username}</span>
              <span class="comment-time">${timeDiff}</span>
            </div>
          </div>
          ${comment.isPinned ? '<span class="comment-pinned-badge">📌 Pinned</span>' : ''}
        </div>

        <div class="comment-content">
          ${this.escapeHtml(comment.content)}
        </div>

        <div class="comment-actions">
          <button class="comment-action-btn" data-like-btn="${comment._id}" title="Like this comment">
            <span>${comment.likes}</span>
          </button>

          ${isOwner ? `
            <button class="comment-delete-btn" data-delete-btn="${comment._id}" title="Delete this comment">
              🗑️
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  setupFormHandler() {
    const form = document.getElementById('commentForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitComment();
    });
  }

  async submitComment() {
    const textarea = document.getElementById('commentContent');
    const content = textarea.value.trim();

    if (!content) {
      showNotification('Comment cannot be empty', 'error');
      return;
    }

    if (content.length > 1000) {
      showNotification('Comment is too long (max 1000 characters)', 'error');
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: this.articleId,
          content
        })
      });

      if (!response.ok) throw new Error('Failed to post comment');

      textarea.value = '';
      this.loadComments();
      showNotification('Comment posted successfully!', 'success');
    } catch (error) {
      console.error('Error posting comment:', error);
      showNotification('Failed to post comment', 'error');
    }
  }

  async likeComment(commentId, button) {
    if (!this.isAuthenticated) {
      showNotification('Please login to like comments', 'info');
      window.location.href = '/auth/login';
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to like comment');

      const data = await response.json();
      button.classList.toggle('liked');
      button.querySelector('span').textContent = data.likes;
    } catch (error) {
      console.error('Error liking comment:', error);
      showNotification('Failed to like comment', 'error');
    }
  }

  async deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to delete comment');

      this.loadComments();
      showNotification('Comment deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting comment:', error);
      showNotification('Failed to delete comment', 'error');
    }
  }

  getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString();
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  showError(message) {
    const container = document.getElementById('commentsList');
    if (container) {
      container.innerHTML = `<div class="no-comments" style="color: var(--danger-color);">${message}</div>`;
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  const articleId = document.body.getAttribute('data-article-id');
  const isAuthenticated = !!document.body.getAttribute('data-user-id');
  const userId = document.body.getAttribute('data-user-id');

  if (articleId) {
    window.commentsManager = new CommentsManager(articleId, isAuthenticated, userId);
  }
});
