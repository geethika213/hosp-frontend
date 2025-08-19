const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, appointmentParticipant } = require('../middleware/auth');

const router = express.Router();

// Mock OpenAI integration (replace with actual OpenAI API)
const generateAIResponse = async (messages, context) => {
  // This is a mock implementation. In production, integrate with OpenAI API
  const { symptoms, urgency } = context;
  
  const responses = {
    greeting: "Hello! I'm your AI healthcare assistant. I'll help you find the right doctor and book an appointment. Can you tell me what symptoms you're experiencing?",
    symptoms_analysis: `Based on your symptoms (${symptoms.join(', ')}), I recommend seeing a specialist. Let me help you find the best doctors in your area.`,
    location_request: "To find doctors near you, could you please share your preferred location or city?",
    recommendations: "Great! I've found several highly-rated doctors who can help with your condition. Here are my top recommendations based on your symptoms and location.",
    booking_confirmation: "Perfect! I'll help you book an appointment with your selected doctor. Let me check their availability.",
    emergency: "Your symptoms indicate this might need urgent attention. I'm prioritizing doctors who are available for immediate consultation."
  };

  // Simple logic to determine response type
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) return responses.greeting;
  
  const content = lastMessage.content.toLowerCase();
  
  if (urgency === 'high') return responses.emergency;
  if (symptoms.length > 0 && content.includes('doctor')) return responses.recommendations;
  if (symptoms.length > 0) return responses.symptoms_analysis;
  if (content.includes('location') || content.includes('city')) return responses.location_request;
  
  return responses.greeting;
};

// @desc    Start AI chat for appointment booking
// @route   POST /api/chat/start
// @access  Private
router.post('/start', protect, [
  body('symptoms').optional().isArray(),
  body('urgency').optional().isIn(['low', 'medium', 'high']),
  body('preferredLocation').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { symptoms = [], urgency = 'medium', preferredLocation } = req.body;

    // Create a temporary appointment for the chat session
    const tempAppointment = await Appointment.create({
      patient: req.user._id,
      doctor: req.user._id, // Temporary - will be updated when doctor is selected
      appointmentDate: new Date(),
      appointmentTime: { start: '09:00 AM', end: '09:30 AM' },
      type: 'consultation',
      chiefComplaint: 'AI-assisted booking in progress',
      status: 'scheduled',
      priority: urgency,
      symptoms,
      preferredLocation: preferredLocation ? { city: preferredLocation } : undefined
    });

    // Create chat session
    const chat = await Chat.create({
      appointment: tempAppointment._id,
      participants: [
        {
          user: req.user._id,
          role: 'patient'
        }
      ],
      aiContext: {
        symptoms,
        urgency,
        bookingProgress: 'initial'
      }
    });

    // Generate initial AI response
    const aiResponse = await generateAIResponse([], { symptoms, urgency });
    
    chat.messages.push({
      senderType: 'ai-assistant',
      content: aiResponse,
      messageType: 'ai-response'
    });

    await chat.save();

    res.status(201).json({
      success: true,
      message: 'Chat session started',
      chatId: chat._id,
      appointmentId: tempAppointment._id,
      initialMessage: aiResponse
    });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error starting chat session'
    });
  }
});

// @desc    Send message in chat
// @route   POST /api/chat/:chatId/message
// @access  Private
router.post('/:chatId/message', protect, [
  body('content').trim().isLength({ min: 1 }),
  body('messageType').optional().isIn(['text', 'image', 'file'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, messageType = 'text' } = req.body;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(p => p.user.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat session'
      });
    }

    // Add user message
    chat.messages.push({
      sender: req.user._id,
      senderType: 'user',
      content,
      messageType
    });

    // Generate AI response
    const aiResponse = await generateAIResponse(chat.messages, chat.aiContext);
    
    chat.messages.push({
      senderType: 'ai-assistant',
      content: aiResponse,
      messageType: 'ai-response'
    });

    // Update AI context based on message content
    const messageContent = content.toLowerCase();
    if (messageContent.includes('pain') || messageContent.includes('hurt')) {
      if (!chat.aiContext.symptoms.includes('pain')) {
        chat.aiContext.symptoms.push('pain');
      }
    }

    await chat.save();

    // Emit real-time message via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(chatId).emit('new-message', {
        chatId,
        messages: chat.messages.slice(-2) // Send last 2 messages (user + AI)
      });
    }

    res.json({
      success: true,
      message: 'Message sent successfully',
      aiResponse,
      chatId: chat._id
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
});

// @desc    Get chat messages
// @route   GET /api/chat/:chatId/messages
// @access  Private
router.get('/:chatId/messages', protect, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId)
      .populate('messages.sender', 'firstName lastName role');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(p => p.user.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat session'
      });
    }

    const skip = (page - 1) * limit;
    const messages = chat.messages
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      messages,
      chatContext: chat.aiContext,
      pagination: {
        current: parseInt(page),
        total: chat.messages.length
      }
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching messages'
    });
  }
});

// @desc    Update chat context (for AI booking progress)
// @route   PUT /api/chat/:chatId/context
// @access  Private
router.put('/:chatId/context', protect, [
  body('symptoms').optional().isArray(),
  body('urgency').optional().isIn(['low', 'medium', 'high']),
  body('bookingProgress').optional().isIn(['initial', 'symptoms-collected', 'preferences-set', 'doctors-recommended', 'appointment-booked'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { chatId } = req.params;
    const updates = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(p => p.user.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat session'
      });
    }

    // Update AI context
    Object.keys(updates).forEach(key => {
      if (chat.aiContext[key] !== undefined) {
        chat.aiContext[key] = updates[key];
      }
    });

    await chat.save();

    res.json({
      success: true,
      message: 'Chat context updated',
      aiContext: chat.aiContext
    });
  } catch (error) {
    console.error('Update chat context error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating chat context'
    });
  }
});

// @desc    Close chat session
// @route   PUT /api/chat/:chatId/close
// @access  Private
router.put('/:chatId/close', protect, async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(p => p.user.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat session'
      });
    }

    chat.status = 'closed';
    await chat.save();

    res.json({
      success: true,
      message: 'Chat session closed'
    });
  } catch (error) {
    console.error('Close chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error closing chat session'
    });
  }
});

module.exports = router;
