const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendAppointmentConfirmation(appointment, patient, doctor) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patient.email,
      subject: 'Appointment Confirmation - HealthAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Appointment Confirmed</h2>
          <p>Dear ${patient.firstName} ${patient.lastName},</p>
          <p>Your appointment has been confirmed with the following details:</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #065f46;">Appointment Details</h3>
            <p><strong>Doctor:</strong> Dr. ${doctor.firstName} ${doctor.lastName}</p>
            <p><strong>Specialization:</strong> ${doctor.specialization}</p>
            <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.appointmentTime.start} - ${appointment.appointmentTime.end}</p>
            <p><strong>Type:</strong> ${appointment.mode === 'telemedicine' ? 'Video Consultation' : 'In-Person Visit'}</p>
            <p><strong>Location:</strong> ${doctor.currentHospital}, ${doctor.currentCity}</p>
          </div>
          
          <p>Please arrive 15 minutes early for in-person appointments or ensure you have a stable internet connection for video consultations.</p>
          
          <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
          
          <p>Best regards,<br>HealthAI Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Appointment confirmation email sent to:', patient.email);
    } catch (error) {
      console.error('Email sending error:', error);
    }
  }

  async sendAppointmentReminder(appointment, patient, doctor) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patient.email,
      subject: 'Appointment Reminder - HealthAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Appointment Reminder</h2>
          <p>Dear ${patient.firstName} ${patient.lastName},</p>
          <p>This is a reminder for your upcoming appointment:</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #92400e;">Tomorrow's Appointment</h3>
            <p><strong>Doctor:</strong> Dr. ${doctor.firstName} ${doctor.lastName}</p>
            <p><strong>Time:</strong> ${appointment.appointmentTime.start}</p>
            <p><strong>Type:</strong> ${appointment.mode === 'telemedicine' ? 'Video Consultation' : 'In-Person Visit'}</p>
          </div>
          
          <p>Please be prepared and on time for your appointment.</p>
          
          <p>Best regards,<br>HealthAI Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Appointment reminder email sent to:', patient.email);
    } catch (error) {
      console.error('Email sending error:', error);
    }
  }

  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Welcome to HealthAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Welcome to HealthAI!</h2>
          <p>Dear ${user.firstName} ${user.lastName},</p>
          <p>Welcome to HealthAI, your intelligent healthcare companion!</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #065f46;">Getting Started</h3>
            ${user.role === 'patient' ? `
              <p>As a patient, you can:</p>
              <ul>
                <li>Book appointments with AI assistance</li>
                <li>Find doctors near you</li>
                <li>Manage your medical history</li>
                <li>Join video consultations</li>
              </ul>
            ` : `
              <p>As a doctor, you can:</p>
              <ul>
                <li>Manage your appointments</li>
                <li>Update your location and availability</li>
                <li>Conduct video consultations</li>
                <li>View patient records</li>
              </ul>
            `}
          </div>
          
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>HealthAI Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent to:', user.email);
    } catch (error) {
      console.error('Email sending error:', error);
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request - HealthAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Password Reset Request</h2>
          <p>Dear ${user.firstName} ${user.lastName},</p>
          <p>You have requested to reset your password for your HealthAI account.</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #991b1b;">Security Notice</h3>
            <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          
          <p>This link will expire in 10 minutes for security reasons.</p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
          
          <p>Best regards,<br>HealthAI Security Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent to:', user.email);
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }

  async sendAppointmentCancellation(appointment, patient, doctor, reason) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patient.email,
      subject: 'Appointment Cancelled - HealthAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Appointment Cancelled</h2>
          <p>Dear ${patient.firstName} ${patient.lastName},</p>
          <p>Your appointment has been cancelled:</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #991b1b;">Cancelled Appointment</h3>
            <p><strong>Doctor:</strong> Dr. ${doctor.firstName} ${doctor.lastName}</p>
            <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.appointmentTime.start} - ${appointment.appointmentTime.end}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>
          
          <p>We apologize for any inconvenience. You can book a new appointment through our platform.</p>
          
          <p>Best regards,<br>HealthAI Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Appointment cancellation email sent to:', patient.email);
    } catch (error) {
      console.error('Email sending error:', error);
    }
  }

  async sendDoctorNotification(doctor, title, message, data = {}) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: doctor.email,
      subject: `${title} - HealthAI`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">${title}</h2>
          <p>Dear Dr. ${doctor.firstName} ${doctor.lastName},</p>
          <p>${message}</p>
          
          ${data.actionUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.actionUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Details</a>
            </div>
          ` : ''}
          
          <p>Best regards,<br>HealthAI Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Doctor notification email sent to:', doctor.email);
    } catch (error) {
      console.error('Email sending error:', error);
    }
  }
}

module.exports = new EmailService();
