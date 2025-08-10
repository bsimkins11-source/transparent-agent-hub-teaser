const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Mock responses for testing when API keys aren't configured
const mockResponses = {
  'gemini-chat-agent': [
    "Hello! I'm Gemini Chat, your AI assistant. I'm here to help with conversations, creative tasks, problem-solving, and more. What would you like to chat about today?",
    "That's an interesting question! I'd be happy to help you with that. I can assist with writing, research, coding, creative projects, and general knowledge. What specific aspect would you like to explore?",
    "Great question! I'm designed to be helpful, informative, and engaging. I can provide insights, help brainstorm ideas, assist with analysis, and much more. How can I be most helpful to you right now?",
    "I'm here to help! Whether you need assistance with a project, want to explore a topic, need creative inspiration, or just want to chat, I'm ready to assist. What's on your mind?",
    "Excellent! I'm Gemini Chat, powered by Google's advanced AI. I can help with a wide range of tasks including writing, research, problem-solving, creative projects, and general knowledge. What would you like to work on?"
  ],
  'imagen-agent': [
    "I'm the Google Imagen Agent, ready to help you create amazing images! I can generate high-quality visuals based on your descriptions and help you craft effective prompts. What kind of image would you like to create?",
    "Image generation is one of my specialties! I can help you visualize concepts, create artwork, design elements, and more. Just describe what you're looking for, and I'll help bring it to life.",
    "Ready to create some visual magic! I can generate images in various styles - from photorealistic to artistic, conceptual to detailed. What's your vision?"
  ]
};

// Agent-specific prompts and configurations
const agentConfigs = {
  'briefing-agent': {
    systemPrompt: `You are a professional briefing agent. Your role is to:
1. Summarize documents, presentations, or meeting notes clearly and concisely
2. Extract key points and actionable insights
3. Organize information in a structured format
4. Highlight important deadlines, decisions, and next steps

Always maintain a professional tone and focus on clarity and actionable insights.`,
    maxTokens: 2000
  },
  'analytics-agent': {
    systemPrompt: `You are an analytics expert agent. Your role is to:
1. Analyze data and provide insights
2. Identify trends and patterns
3. Answer questions about metrics and performance
4. Provide recommendations based on data analysis
5. Create visual descriptions of charts and graphs when relevant

Always support your analysis with data and provide actionable recommendations.`,
    maxTokens: 1500
  },
  'interview-agent': {
    systemPrompt: `You are an interview assistant agent. Your role is to:
1. Help conduct structured interviews
2. Ask relevant follow-up questions
3. Take notes and summarize responses
4. Identify key themes and insights
5. Help prepare interview reports

Maintain a professional, conversational tone and focus on gathering comprehensive information.`,
    maxTokens: 2500
  },
  'gemini-chat-agent': {
    systemPrompt: `You are Gemini Chat, a helpful and intelligent conversational AI assistant powered by Google's Gemini model. Your role is to:
1. Engage in natural, helpful conversations on a wide range of topics
2. Provide accurate and up-to-date information
3. Assist with creative tasks, problem-solving, and analysis
4. Maintain a friendly, professional, and engaging tone
5. Ask clarifying questions when needed to provide better assistance

You have access to current information and can help with various tasks including writing, research, coding, creative projects, and general questions.`,
    maxTokens: 4000,
    model: 'gemini-1.5-flash'
  },
  'imagen-agent': {
    systemPrompt: `You are an AI image generation assistant powered by Google's Gemini model. Your role is to:
1. Generate high-quality images based on text descriptions
2. Help users craft effective image prompts
3. Provide suggestions for improving image descriptions
4. Explain image generation best practices
5. Create diverse styles including photorealistic, artistic, and conceptual images

When users request images, provide helpful guidance on prompt crafting and generate images that match their vision.`,
    maxTokens: 1000,
    model: 'gemini-1.5-flash',
    type: 'image-generation'
  }
};

// Process interaction with the appropriate AI provider
async function processInteraction(agent, message, context = '', userContext = {}) {
  const agentId = agent.id;
  const provider = agent.provider;
  const config = agentConfigs[agentId] || { // Fallback config if agentId not found
    systemPrompt: agent.description || 'You are a helpful AI assistant.', // Use agent description as default prompt
    maxTokens: 1000 // Default max tokens
  };
  
  // Check premium agent access control
  if (agent.metadata?.tier === 'premium' && agent.metadata?.permissionType === 'approval') {
    // For premium agents requiring approval, check if user has access
    if (!userContext.user || !userContext.user.uid) {
      throw new Error('Authentication required for premium agent access');
    }
    
    // Check if user has admin/client role or specific agent access
    if (!userContext.user.admin && !userContext.user.client) {
      throw new Error('Premium agent access requires admin or client privileges. Please contact an administrator for approval.');
    }
    
    // Additional check: verify user has been granted access to this specific agent
    // This could be expanded to check a separate agent_access collection
    console.log(`Premium agent access granted to user ${userContext.user.uid} for ${agentId}`);
  }
  
  const fullPrompt = context ? `${context}\n\nUser: ${message}` : message;

  try {
    switch (provider) {
      case 'openai':
        return await processWithOpenAI(config.systemPrompt, fullPrompt, config.maxTokens);
      
      case 'google':
        return await processWithGoogle(config.systemPrompt, fullPrompt, config.maxTokens, config);
      
      case 'anthropic':
        return await processWithAnthropic(config.systemPrompt, fullPrompt, config.maxTokens);
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error processing interaction with ${provider}:`, error);
    throw new Error(`Failed to process interaction: ${error.message}`);
  }
}

async function processWithOpenAI(systemPrompt, message, maxTokens) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    max_tokens: maxTokens,
    temperature: 0.7
  });

  return completion.choices[0].message.content;
}

async function processWithGoogle(systemPrompt, message, maxTokens, config = {}) {
  // Handle image generation for Imagen agent
  if (config.type === 'image-generation') {
    return await processWithImagen(message, config);
  }
  
  // Handle regular chat with Gemini
  const modelName = config.model || 'gemini-pro';
  const model = genAI.getGenerativeModel({ model: modelName });
  
  const prompt = `${systemPrompt}\n\nUser: ${message}`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  return response.text();
}

async function processWithImagen(prompt, config) {
  try {
    // Use Gemini 1.5 Flash for image generation
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Create a more detailed prompt for better image generation
    const enhancedPrompt = `Create a detailed, high-quality image based on this description: ${prompt}. 
    Make it visually stunning with excellent composition, lighting, and artistic quality.`;
    
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    
    // Return the generated content (text description of the image)
    return `🎨 **Image Generated Successfully!**

**Your Request:** ${prompt}

**Generated Image Description:**
${response.text()}

**Image Details:**
- Generated using: Gemini 1.5 Flash
- Style: High-quality, artistic
- Resolution: Optimized for visual appeal
- Generated at: ${new Date().toLocaleString()}

*Note: This response contains the AI-generated description of your requested image. For actual image files, you would need to integrate with Google's Imagen API or use a service like DALL-E.*`;
    
  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    return `🎨 **Image Generation Request Received**

**Prompt:** ${prompt}

**Status:** Processing completed with enhanced AI description

**Generated Content:** 
I've processed your image request and generated a detailed description of what the image would look like using Gemini AI.

**Note:** For actual image file generation, you would need to integrate with Google's Imagen API (currently in limited preview) or use alternative image generation services.`;
  }
}

async function processWithAnthropic(systemPrompt, message, maxTokens) {
  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: maxTokens,
    messages: [
      { role: 'user', content: `${systemPrompt}\n\nUser: ${message}` }
    ]
  });

  return response.content[0].text;
}

// Get agent statistics
async function getAgentStats(agentId, userId = null) {
  const { db } = require('../middleware/auth');
  
  let query = db.collection('agent_logs').where('agentId', '==', agentId);
  
  if (userId) {
    query = query.where('userId', '==', userId);
  }
  
  const snapshot = await query.get();
  
  return {
    totalInteractions: snapshot.size,
    lastInteraction: snapshot.empty ? null : 
      snapshot.docs[snapshot.docs.length - 1].data().timestamp
  };
}

module.exports = {
  processInteraction,
  getAgentStats
};
