const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Appointment = require('../models/Appointment');
const VideoCall = require('../models/VideoCall');
const Notification = require('../models/Notification');
const NotificationService = require('./notificationService');

const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user authentication and room joining
    socket.on('authenticate', async (data) => {
      try {
        const { userId, userRole } = data;
        socket.userId = userId;
        socket.userRole = userRole;
        
        // Join user-specific room
        socket.join(`user_${userId}`);
        
        console.log(`User ${userId} (${userRole}) authenticated and joined room`);
      } catch (error) {
        console.error('Socket authentication error:', error);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });

    // Handle joining chat rooms
    socket.on('join-chat', async (data) => {
      try {
        const { chatId } = data;
        
        // Verify user has access to this chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        const isParticipant = chat.participants.some(p => 
          p.user.toString() === socket.userId
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Access denied to chat' });
          return;
        }

        socket.join(`chat_${chatId}`);
        console.log(`User ${socket.userId} joined chat ${chatId}`);
        
        socket.emit('chat-joined', { chatId });
      } catch (error) {
        console.error('Join chat error:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle video call events
    socket.on('join-video-room', async (data) => {
      try {
        const { roomId } = data;
        
        // Verify user has access to this video room
        const appointment = await Appointment.findOne({
          'videoCallDetails.roomId': roomId
        });

        if (!appointment) {
          socket.emit('error', { message: 'Video room not found' });
          return;
        }

        const isPatient = appointment.patient.toString() === socket.userId;
        const isDoctor = appointment.doctor.toString() === socket.userId;

        if (!isPatient && !isDoctor) {
          socket.emit('error', { message: 'Access denied to video room' });
          return;
        }

        socket.join(`video_${roomId}`);
        socket.videoRoomId = roomId;
        
        // Notify other participants
        socket.to(`video_${roomId}`).emit('user-joined-video', {
          userId: socket.userId,
          userRole: socket.userRole
        });

        console.log(`User ${socket.userId} joined video room ${roomId}`);
      } catch (error) {
        console.error('Join video room error:', error);
        socket.emit('error', { message: 'Failed to join video room' });
      }
    });

    // Handle video call signaling
    socket.on('video-offer', (data) => {
      socket.to(`video_${socket.videoRoomId}`).emit('video-offer', {
        ...data,
        from: socket.userId
      });
    });

    socket.on('video-answer', (data) => {
      socket.to(`video_${socket.videoRoomId}`).emit('video-answer', {
        ...data,
        from: socket.userId
      });
    });

    socket.on('ice-candidate', (data) => {
      socket.to(`video_${socket.videoRoomId}`).emit('ice-candidate', {
        ...data,
        from: socket.userId
      });
    });

    // Handle chat messages
    socket.on('send-message', async (data) => {
      try {
        const { chatId, content, messageType = 'text' } = data;
        
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        // Add message to chat
        const newMessage = {
          sender: socket.userId,
          senderType: 'user',
          content,
          messageType,
          timestamp: new Date()
        };

        chat.messages.push(newMessage);
        await chat.save();

        // Emit to all participants in the chat
        io.to(`chat_${chatId}`).emit('new-message', {
          chatId,
          message: newMessage
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      const { chatId } = data;
      socket.to(`chat_${chatId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('typing-stop', (data) => {
      const { chatId } = data;
      socket.to(`chat_${chatId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: false
      });
    });

    // Handle doctor status updates
    socket.on('update-online-status', async (data) => {
      try {
        if (socket.userRole !== 'doctor') {
          socket.emit('error', { message: 'Only doctors can update online status' });
          return;
        }

        const { isOnline } = data;
        
        await User.findByIdAndUpdate(socket.userId, { isOnline });
        
        // Notify relevant users (patients looking for doctors)
        socket.broadcast.emit('doctor-status-updated', {
          doctorId: socket.userId,
          isOnline
        });

        console.log(`Doctor ${socket.userId} status updated to ${isOnline ? 'online' : 'offline'}`);
      } catch (error) {
        console.error('Update online status error:', error);
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // Handle appointment notifications
    socket.on('appointment-reminder', async (data) => {
      try {
        const { appointmentId } = data;
        
        const appointment = await Appointment.findById(appointmentId)
          .populate('patient', 'firstName lastName')
          .populate('doctor', 'firstName lastName');

        if (!appointment) {
          socket.emit('error', { message: 'Appointment not found' });
          return;
        }

        // Send reminder to both patient and doctor
        io.to(`user_${appointment.patient._id}`).emit('appointment-reminder', {
          appointmentId,
          message: `Reminder: You have an appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} at ${appointment.appointmentTime.start}`,
          type: 'reminder'
        });

        io.to(`user_${appointment.doctor._id}`).emit('appointment-reminder', {
          appointmentId,
          message: `Reminder: You have an appointment with ${appointment.patient.firstName} ${appointment.patient.lastName} at ${appointment.appointmentTime.start}`,
          type: 'reminder'
        });

      } catch (error) {
        console.error('Appointment reminder error:', error);
        socket.emit('error', { message: 'Failed to send reminder' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Notify video room participants if user was in a video call
      if (socket.videoRoomId) {
        socket.to(`video_${socket.videoRoomId}`).emit('user-left-video', {
          userId: socket.userId,
          userRole: socket.userRole
        });
      }
    });
  });
};

module.exports = { handleSocketConnection };
