$(document).ready(function() {
  // Tab navigation
  $('.account-nav .nav-link').on('click', function(e) {
    e.preventDefault();
    const tabName = $(this).attr('data-tab');

    // Remove active class from all links and content
    $('.account-nav .nav-link').removeClass('active');
    $('.tab-content').removeClass('active');

    // Add active class to clicked link and corresponding content
    $(this).addClass('active');
    $('#' + tabName).addClass('active');
  });

  // Profile image upload
  $('#profileImageInput').on('change', function() {
    const file = this.files[0];
    if (!file) return;

    // Check file size (5MB max)
    if (file.size > 5242880) {
      showNotification('File size must be less than 5MB', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    $.ajax({
      url: '/api/users/profile-image',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(response) {
        // Update the preview image
        $('#profileImagePreview').html(`<img src="${response.profileImage}?t=${Date.now()}" alt="Profile">`);
        showNotification('Profile image updated successfully', 'success');
      },
      error: function(xhr) {
        const message = xhr.responseJSON?.message || 'Failed to upload image';
        showNotification(message, 'error');
      }
    });
  });

  // Profile form submission
  $('#profileForm').on('submit', function(e) {
    e.preventDefault();

    const data = {
      firstName: $('#firstName').val(),
      lastName: $('#lastName').val(),
      bio: $('#bio').val(),
      birthDate: $('#birthDate').val(),
      country: $('#country').val(),
      state: $('#state').val()
    };

    $.ajax({
      url: '/api/users/profile',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function(response) {
        showNotification('Profile updated successfully', 'success');
      },
      error: function(xhr) {
        const message = xhr.responseJSON?.message || 'Failed to update profile';
        showNotification(message, 'error');
      }
    });
  });

  // Store form submission
  $('#storeForm').on('submit', function(e) {
    e.preventDefault();

    const data = {
      storeName: $('#storeName').val(),
      city: $('#city').val()
    };

    $.ajax({
      url: '/api/users/profile',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function(response) {
        showNotification('Store information updated successfully', 'success');
      },
      error: function(xhr) {
        const message = xhr.responseJSON?.message || 'Failed to update store info';
        showNotification(message, 'error');
      }
    });
  });

  // Change password form submission
  $('#changePasswordForm').on('submit', function(e) {
    e.preventDefault();

    const currentPassword = $('#currentPassword').val();
    const newPassword = $('#newPassword').val();
    const confirmNewPassword = $('#confirmNewPassword').val();

    if (newPassword !== confirmNewPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    $.ajax({
      url: '/api/users/change-password',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword: confirmNewPassword
      }),
      success: function(response) {
        showNotification('Password changed successfully', 'success');
        $('#changePasswordForm')[0].reset();
      },
      error: function(xhr) {
        const message = xhr.responseJSON?.message || 'Failed to change password';
        showNotification(message, 'error');
      }
    });
  });

  // Set active tab on page load based on hash
  if (window.location.hash) {
    const tabName = window.location.hash.substring(1);
    $(`[data-tab="${tabName}"]`).click();
  } else {
    $('[data-tab="profile"]').addClass('active');
  }
});
