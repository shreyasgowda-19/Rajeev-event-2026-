const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email function
const sendEmail = async (options) => {
  try {
    const message = {
      from: `MediLink <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(message);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

// Appointment confirmation email
const sendAppointmentConfirmation = async (user, appointment, doctor) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
        <h1 style="margin: 0;">MediLink</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">Appointment Confirmed!</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Hello ${user.name},</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Your appointment has been confirmed with <strong>Dr. ${doctor.name}</strong>.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p style="margin: 5px 0; color: #374151;"><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin: 5px 0; color: #374151;"><strong>Time:</strong> ${appointment.timeSlot.start} - ${appointment.timeSlot.end}</p>
          <p style="margin: 5px 0; color: #374151;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Confirmed</span></p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Please arrive 15 minutes before your scheduled time. If you need to cancel or reschedule, please do so at least 24 hours in advance.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
        <p>© 2026 MediLink. All rights reserved.</p>
        <p>This is an automated email, please do not reply.</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: '✅ Appointment Confirmed - MediLink',
    html
  });
};

// Welcome email
const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Welcome to MediLink!</h1>
      <p>Hello ${user.name},</p>
      <p>Thank you for joining MediLink. Your health journey starts here.</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Your account details:</strong></p>
        <p>Email: ${user.email}</p>
        <p>Role: ${user.role}</p>
      </div>
      <p>Best regards,<br>MediLink Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Welcome to MediLink',
    html
  });
};

module.exports = { 
  sendEmail, 
  sendAppointmentConfirmation, 
  sendWelcomeEmail 
};
