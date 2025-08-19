const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;
  }

  async analyzeSymptoms(symptoms, additionalInfo = '') {
    if (!this.openai) {
      return this.getMockSymptomAnalysis(symptoms);
    }

    try {
      const prompt = `As a medical AI assistant, analyze these symptoms and provide recommendations:
      
      Symptoms: ${symptoms.join(', ')}
      Additional info: ${additionalInfo}
      
      Please provide:
      1. Possible conditions (general, not diagnostic)
      2. Recommended medical specialties
      3. Urgency level (low, medium, high)
      4. General advice
      
      Format as JSON with keys: possibleConditions, recommendedSpecialties, urgencyLevel, advice`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful medical AI assistant. Provide general health information only, not specific medical diagnoses."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getMockSymptomAnalysis(symptoms);
    }
  }

  getMockSymptomAnalysis(symptoms) {
    const specialtyMap = {
      'chest pain': { specialties: ['Cardiology', 'Internal Medicine'], urgency: 'high' },
      'headache': { specialties: ['Neurology', 'Internal Medicine'], urgency: 'medium' },
      'fever': { specialties: ['Internal Medicine', 'Family Medicine'], urgency: 'medium' },
      'cough': { specialties: ['Pulmonology', 'Internal Medicine'], urgency: 'low' },
      'abdominal pain': { specialties: ['Gastroenterology', 'Internal Medicine'], urgency: 'medium' },
      'joint pain': { specialties: ['Rheumatology', 'Orthopedics'], urgency: 'low' },
      'skin rash': { specialties: ['Dermatology'], urgency: 'low' },
      'anxiety': { specialties: ['Psychiatry', 'Psychology'], urgency: 'medium' },
      'depression': { specialties: ['Psychiatry', 'Psychology'], urgency: 'medium' }
    };

    let recommendedSpecialties = new Set();
    let maxUrgency = 'low';

    symptoms.forEach(symptom => {
      const mapping = specialtyMap[symptom.toLowerCase()];
      if (mapping) {
        mapping.specialties.forEach(spec => recommendedSpecialties.add(spec));
        if (mapping.urgency === 'high') maxUrgency = 'high';
        else if (mapping.urgency === 'medium' && maxUrgency !== 'high') maxUrgency = 'medium';
      }
    });

    return {
      possibleConditions: symptoms.length > 0 ? ['Requires medical evaluation'] : [],
      recommendedSpecialties: Array.from(recommendedSpecialties),
      urgencyLevel: maxUrgency,
      advice: 'Please consult with a healthcare professional for proper evaluation and treatment.'
    };
  }

  async generateChatResponse(messages, context) {
    if (!this.openai) {
      return this.getMockChatResponse(messages, context);
    }

    try {
      const systemPrompt = `You are a helpful AI assistant for a healthcare appointment booking system. 
      Help patients book appointments by:
      1. Understanding their symptoms
      2. Asking relevant follow-up questions
      3. Recommending appropriate specialists
      4. Guiding them through the booking process
      
      Current context: ${JSON.stringify(context)}
      
      Be empathetic, professional, and helpful. Do not provide medical diagnoses.`;

      const chatMessages = [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10).map(msg => ({
          role: msg.senderType === 'ai-assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      ];

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: chatMessages,
        max_tokens: 300,
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI chat error:', error);
      return this.getMockChatResponse(messages, context);
    }
  }

  getMockChatResponse(messages, context) {
    const { symptoms, urgency, bookingProgress } = context;
    
    const responses = {
      initial: "Hello! I'm your AI healthcare assistant. I'll help you find the right doctor and book an appointment. Can you tell me what symptoms you're experiencing?",
      'symptoms-collected': `I understand you're experiencing ${symptoms.join(', ')}. Based on these symptoms, I recommend consulting with a specialist. Could you please share your preferred location?`,
      'preferences-set': "Great! I've found several highly-rated doctors in your area who can help with your condition. Let me show you the best matches.",
      'doctors-recommended': "Perfect! I can help you book an appointment with your selected doctor. Would you like to proceed with booking?",
      'appointment-booked': "Excellent! Your appointment has been successfully booked. You'll receive a confirmation email shortly with all the details."
    };

    if (urgency === 'high') {
      return "Your symptoms suggest this might need urgent attention. I'm prioritizing doctors who are available for immediate consultation. Let me find the best options for you right away.";
    }

    return responses[bookingProgress] || responses.initial;
  }
}

module.exports = new AIService();
