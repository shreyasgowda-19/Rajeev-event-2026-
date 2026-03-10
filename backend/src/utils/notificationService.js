const { messaging } = require('../config/firebase');

// Send push notification
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  try {
    if (!fcmToken) {
      console.log('No FCM token provided');
      return;
    }

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      token: fcmToken
    };

    const response = await messaging.send(message);
    console.log('Push notification sent:', response);
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    // Don't throw error - notifications shouldn't break the app
  }
};

// Appointment notifications
const sendAppointmentNotification = async (user, type, details) => {
  if (!user.fcmToken) return;

  const notifications = {
    booked: {
      title: '📅 New Appointment Request',
      body: `Patient ${details.patientName} has requested an appointment`
    },
    confirmed: {
      title: '✅ Appointment Confirmed',
      body: `Your appointment with Dr. ${details.doctorName} is confirmed`
    },
    cancelled: {
      title: '❌ Appointment Cancelled',
      body: 'Your appointment has been cancelled'
    },
    prescription: {
      title: '💊 New Prescription Available',
      body: 'Your doctor has uploaded a new prescription'
    },
    reminder: {
      title: '⏰ Appointment Reminder',
      body: 'You have an appointment in 1 hour'
    }
  };

  const notif = notifications[type];
  if (notif) {
    await sendPushNotification(user.fcmToken, notif.title, notif.body, {
      type,
      appointmentId: details.id || '',
      screen: type === 'prescription' ? 'Prescriptions' : 'Appointments'
    });
  }
};

module.exports = { 
  sendPushNotification, 
  sendAppointmentNotification 
};
