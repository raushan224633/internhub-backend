const nodemailer = require('nodemailer');

// Create reusable transporter
let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;

  // Email configuration from environment variables
  const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  // If no email credentials, use a test account (for development)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('⚠️  No email credentials found. Email notifications are disabled.');
    console.log('💡 To enable emails, add these to your .env file:');
    console.log('   EMAIL_HOST=smtp.gmail.com');
    console.log('   EMAIL_PORT=587');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASSWORD=your-app-password');
    return null;
  }

  transporter = nodemailer.createTransport(emailConfig);

  // Verify connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email service connection failed:', error.message);
      transporter = null;
    } else {
      console.log('✅ Email service is ready to send messages');
    }
  });

  return transporter;
};

/**
 * Send contact form email to admin
 */
const sendContactFormEmail = async ({ name, email, subject, message }) => {
  const emailTransporter = createTransporter();
  
  if (!emailTransporter) {
    console.log('📧 Contact form submission (email not sent - no credentials):', { name, email, subject });
    return { 
      success: false, 
      message: 'Email service not configured, but message saved to database' 
    };
  }

  const recipientEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'support@internshell.com';

  const mailOptions = {
    from: `"InternShell Contact Form" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    replyTo: email,
    subject: `Contact Form: ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; margin: 15px 0; 
                        border-left: 4px solid #667eea; border-radius: 4px; }
            .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .value { color: #333; }
            .message-box { background: white; padding: 20px; margin: 15px 0; 
                          border-radius: 4px; border: 1px solid #ddd; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">🔔 New Contact Form Submission</h2>
            </div>
            <div class="content">
              <p>You have received a new message from the InternShell contact form:</p>
              
              <div class="info-box">
                <div class="label">From:</div>
                <div class="value">${name}</div>
              </div>

              <div class="info-box">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>

              <div class="info-box">
                <div class="label">Subject:</div>
                <div class="value">${subject}</div>
              </div>

              <div class="message-box">
                <div class="label">Message:</div>
                <div class="value" style="white-space: pre-wrap; margin-top: 10px;">${message}</div>
              </div>

              <div class="footer">
                <p>This email was sent from InternShell Contact Form</p>
                <p>Received at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Contact Form Submission from InternShell

From: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Received at: ${new Date().toLocaleString()}
    `
  };

  try {
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Contact form email sent:', info.messageId);
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('❌ Error sending contact form email:', error.message);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to send email, but message saved to database'
    };
  }
};

/**
 * Send auto-reply email to contact form submitter
 */
const sendContactFormAutoReply = async ({ name, email, subject }) => {
  const emailTransporter = createTransporter();
  
  if (!emailTransporter) {
    return { success: false, message: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"InternShell Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Re: ${subject} - We received your message`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .message-box { background: white; padding: 20px; margin: 20px 0; 
                          border-radius: 8px; border: 1px solid #ddd; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; 
                     padding-top: 20px; border-top: 1px solid #ddd; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; 
                     color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Thank You for Contacting Us!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              
              <div class="message-box">
                <p>We have received your message regarding: <strong>"${subject}"</strong></p>
                <p>Our team will review your inquiry and get back to you within 24-48 business hours.</p>
              </div>

              <p><strong>What happens next?</strong></p>
              <ul>
                <li>Our support team will review your message</li>
                <li>We'll respond to your email address: ${email}</li>
                <li>Typical response time: 24-48 hours</li>
              </ul>

              <p style="margin-top: 20px;">In the meantime, feel free to explore:</p>
              <div style="text-align: center;">
                <a href="https://internshell.com" class="button">Visit Our Website</a>
              </div>

              <div class="footer">
                <p><strong>InternShell</strong> - Your Gateway tojobs Opportunities</p>
                <p>1-A Prem Nagar, Thana Sanganer, Jaipur - 302029</p>
                <p>Email: support@internshell.com | Phone: +91 8384935940</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${name},

Thank you for contacting InternShell!

We have received your message regarding: "${subject}"

Our team will review your inquiry and get back to you within 24-48 business hours at ${email}.

Best regards,
InternShell Team

---
InternShell - Your Gateway tojobs Opportunities
1-A Prem Nagar, Thana Sanganer, Jaipur - 302029
Email: support@internshell.com | Phone: +91 8384935940
    `
  };

  try {
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Auto-reply email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending auto-reply email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendContactFormEmail,
  sendContactFormAutoReply
};
