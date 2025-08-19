const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Appointment = require('../models/Appointment');
const VideoCall = require('../models/VideoCall');
const Notification = require('../models/Notification');
const NotificationService = require('./notificationService');
const logger = require('./logger');

class SocketHandlers {
  constructor(io) {
    this.io = io;
    this.notificationService = new NotificationService(io);
    this.connectedUsers = new Map();
    this.setupHandlers();
  }

  setupHandlers() {
    this.io.on('connection', (socket) => {
      logger.info('Socket connection established', { socketId: socket.id });

      // Authenticate socket connection
      socket.on('authenticate', async (data) => {
        try {
          const { token } = data;
          
          if (!token) {
            socket.emit('auth_error', { message: 'No token provided' });
            return;
          }

          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id).select('-password');

          if (!user || !user.isActive) {
            socket.emit('auth_error', { message: 'Invalid user' });
            return;
          }

          socket.userId = user._id.toString();
          socket.userRole = user.role;
          socket.join(`user_${user._id}`);

          this.connectedUsers.set(socket.id, {
            userId: user._id.toString(),
            role: user.role,
            connectedAt: new Date()
          });

          socket.emit('authenticated', {
            userId: user._id,
            role: user.role
          });

          logger.info('Socket authenticated', {
            socketId: socket.id,
            userId: user._id,
            role: user.role
          });

        } catch (error) {
          logger.logError(error, { component: 'socket-auth', socketId: socket.id });
          socket.emit('auth_error', { message: 'Authentication failed' });
        }
      });

      // Join specific rooms
      socket.on('join_room', (roomId) => {
        socket.join(roomId);
        logger.info('User joined room', {
          socketId: socket.id,
          userId: socket.userId,
          roomId
        });
      });

      // Leave specific rooms
      socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
        logger.info('User left room', {
          socketId: socket.id,
          userId: socket.userId,
          roomId
        });
      });

      // Handle chat messages
      socket.on('send_message', async (data) => {
        try {
          const { chatId, content, messageType = 'text' } = data;

          if (!socket.userId) {
            socket.emit('error', { message: 'Not authenticated' });
            return;
          }

          const chat = await Chat.findById(chatId);
          if (!chat) {
            socket.emit('error', { message: 'Chat not found' });
            return;
          }

          // Check if user is participant
          const isParticipant = chat.participants.some(
            p => p.user.toString() === socket.userId
          );

          if (!isParticipant) {
            socket.emit('error', { message: 'Access denied to this chat' });
            return;
          }

          // Add message to chat
          const message = {
            sender: socket.userId,
            content,
            messageType,
            timestamp: new Date()
          };

          chat.messages.push(message);
          await chat.save();

          // Emit to all participants
          chat.participants.forEach(participant => {
            this.io.to(`user_${participant.user}`).emit('new_message', {
              chatId,
              message: {
                ...message,
                sender: {
                  _id: socket.userId,
                  role: socket.userRole
                }
              }
            });
          });

          logger.info('Chat message sent', {
            chatId,
            senderId: socket.userId,
            messageType
          });

        } catch (error) {
          logger.logError(error, { component: 'chat-message', socketId: socket.id });
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle video call events
      socket.on('video_call_request', async (data) => {
        try {
          const { appointmentId } = data;

          if (!socket.userId) {
            socket.emit('error', { message: 'Not authenticated' });
            return;
          }

          const appointment = await Appointment.findById(appointmentId)
            .populate('patient doctor');

          if (!appointment) {
            socket.emit('error', { message: 'Appointment not found' });
            return;
          }

          // Only patient or doctor can initiate video call
          const isPatient = appointment.patient._id.toString() === socket.userId;
          const isDoctor = appointment.doctor._id.toString() === socket.userId;

          if (!isPatient && !isDoctor) {
            socket.emit('error', { message: 'Access denied' });
            return;
          }

          // Notify the other participant
          const targetUserId = isPatient ? appointment.doctor._id : appointment.patient._id;
          
          this.io.to(`user_${targetUserId}`).emit('incoming_video_call', {
            appointmentId,
            caller: {
              id: socket.userId,
              name: isPatient ? 
                `${appointment.patient.firstName} ${appointment.patient.lastName}` :
                `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
              role: socket.userRole
            }
          });

          // Send notification
          await this.notificationService.sendVideoCallRequest(
            appointment,
            appointment.patient,
            appointment.doctor
          );

          logger.info('Video call request sent', {
            appointmentId,
            callerId: socket.userId,
            targetUserId
          });

        } catch (error) {
          logger.logError(error, { component: 'video-call-request', socketId: socket.id });
          socket.emit('error', { message: 'Failed to send video call request' });
        }
      });

      socket.on('video_call_accept', async (data) => {
        try {
          const { appointmentId, roomId } = data;

          const videoCall = await VideoCall.findOne({ roomId });
          if (videoCall) {
            await videoCall.addParticipant(socket.userId, socket.userRole);
          }

          // Notify caller that call was accepted
          this.io.to(`appointment_${appointmentId}`).emit('video_call_accepted', {
            roomId,
            acceptedBy: socket.userId
          });

          logger.info('Video call accepted', {
            appointmentId,
            roomId,
            acceptedBy: socket.userId
          });

        } catch (error) {
          logger.logError(error, { component: 'video-call-accept', socketId: socket.id });
        }
      });

      socket.on('video_call_reject', async (data) => {
        try {
          const { appointmentId, reason } = data;

          this.io.to(`appointment_${appointmentId}`).emit('video_call_rejected', {
            rejectedBy: socket.userId,
            reason
          });

          logger.info('Video call rejected', {
            appointmentId,
            rejectedBy: socket.userId,
            reason
          });

        } catch (error) {
          logger.logError(error, { component: 'video-call-reject', socketId: socket.id });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { chatId } = data;
        socket.to(`chat_${chatId}`).emit('user_typing', {
          userId: socket.userId,
          userRole: socket.userRole
        });
      });

      socket.on('typing_stop', (data) => {
        const { chatId } = data;
        socket.to(`chat_${chatId}`).emit('user_stopped_typing', {
          userId: socket.userId
        });
      });

      // Handle online status updates
      socket.on('update_online_status', async (data) => {
        try {
          if (socket.userRole !== 'doctor') return;

          const { isOnline } = data;
          await User.findByIdAndUpdate(socket.userId, { isOnline });

          // Broadcast to all connected clients
          this.io.emit('doctor_status_updated', {
            doctorId: socket.userId,
            isOnline
          });

          logger.info('Doctor online status updated', {
            doctorId: socket.userId,
            isOnline
          });

        } catch (error) {
          logger.logError(error, { component: 'online-status-update', socketId: socket.id });
        }
      });

      // Handle disconnection
      socket.on('disconnect', async () => {
        try {
          const userInfo = this.connectedUsers.get(socket.id);
          
          if (userInfo) {
            // Update doctor offline status if they disconnect
            if (userInfo.role === 'doctor') {
              await User.findByIdAndUpdate(userInfo.userId, { isOnline: false });
              
              this.io.emit('doctor_status_updated', {
                doctorId: userInfo.userId,
                isOnline: false
              });
            }

            this.connectedUsers.delete(socket.id);

            logger.info('Socket disconnected', {
              socketId: socket.id,
              userId: userInfo.userId,
              role: userInfo.role,
              sessionDuration: Date.now() - userInfo.connectedAt.getTime()
            });
          }
        } catch (error) {
          logger.logError(error, { component: 'socket-disconnect', socketId: socket.id });
        }
      });

      // Error handling
      socket.on('error', (error) => {
        logger.logError(error, { component: 'socket-error', socketId: socket.id });
      });
    });
  }

  // Method to broadcast system announcements
  broadcastSystemAnnouncement(title, message, targetRoles = []) {
    const announcement = {
      type: 'system_announcement',
      title,
      message,
      timestamp: new Date()
    };

    if (targetRoles.length === 0) {
      this.io.emit('system_announcement', announcement);
    } else {
      this.connectedUsers.forEach((userInfo, socketId) => {
        if (targetRoles.includes(userInfo.role)) {
          this.io.to(socketId).emit('system_announcement', announcement);
        }
      });
    }

    logger.info('System announcement broadcasted', {
      title,
      targetRoles,
      connectedUsers: this.connectedUsers.size
    });
  }

  // Method to get connected users count
  getConnectedUsersCount() {
    const counts = {
      total: this.connectedUsers.size,
      doctors: 0,
      patients: 0,
      admins: 0
    };

    this.connectedUsers.forEach(userInfo => {
      counts[userInfo.role + 's']++;
    });

    return counts;
  }
}

module.exports = SocketHandlers;
