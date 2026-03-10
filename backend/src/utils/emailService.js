const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (options) => {
  const message = {
    from: `MediLink <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  };

  await transporter.sendMail(message);
};

const sendAppointmentConfirmation = async (user, appointment, doctor) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Appointment Confirmed!</h2>
      <p>Hello ${user.name},</p>
      <p>Your appointment has been confirmed with <strong>Dr. ${doctor.name}</strong>.</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${appointment.timeSlot.start}</p>
        <p><strong>Status:</strong> Confirmed</p>
      </div>
      <p>Please arrive 15 minutes before your scheduled time.</p>
      <p>Best regards,<br>MediLink Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Appointment Confirmation - MediLink',
    html
  });
};

module.exports = { sendEmail, sendAppointmentConfirmation };
