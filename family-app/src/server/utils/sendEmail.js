// פונקציה לשליחת אימיילים

import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // יצירת טרנספורטר SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  // הגדרת תוכן האימייל
  const message = {
    from: `${process.env.FROM_NAME || 'אפליקציית משפחה'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // שליחת האימייל
  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

export default sendEmail; 