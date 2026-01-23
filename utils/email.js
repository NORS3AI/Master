const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendPasswordResetEmail = async (email, resetToken, username) => {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:5000'}/auth/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@rsnews.com',
    to: email,
    subject: 'RS News - Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>Hello ${username},</p>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>This link expires in 30 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr>
      <p><small>RS News - Mail and Parcel Service News</small></p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

const sendUsernameResetEmail = async (email, resetToken, currentUsername) => {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:5000'}/auth/reset-username/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@rsnews.com',
    to: email,
    subject: 'RS News - Username Reset Request',
    html: `
      <h2>Username Reset Request</h2>
      <p>Hello,</p>
      <p>You requested to reset your username. Click the link below to proceed:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Reset Username
      </a>
      <p>This link expires in 30 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr>
      <p><small>RS News - Mail and Parcel Service News</small></p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendUsernameResetEmail
};
