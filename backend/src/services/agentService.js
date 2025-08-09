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
    model: 'gemini-pro'
  },
  'imagen-agent': {
    systemPrompt: `You are an AI image generation assistant powered by Google's Imagen model. Your role is to:
1. Generate high-quality images based on text descriptions
2. Help users craft effective image prompts
3. Provide suggestions for improving image descriptions
4. Explain image generation best practices
5. Create diverse styles including photorealistic, artistic, and conceptual images

When users request images, provide helpful guidance on prompt crafting and generate images that match their vision.`,
    maxTokens: 1000,
    model: 'imagen-3.0',
    type: 'image-generation'
  }
};

// Process interaction with the appropriate AI provider
async function processInteraction(agent, message, context = '') {
  const agentId = agent.id;
  const provider = agent.provider;
  const config = agentConfigs[agentId] || {
    systemPrompt: agent.description || 'You are a helpful AI assistant.',
    maxTokens: 1000
  };

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
  // Note: Google Imagen API is not yet publicly available for direct API access
  // This is a placeholder implementation that would be replaced with actual Imagen API calls
  // For now, we'll return a descriptive response about what image would be generated
  
  const imageDescription = `🎨 **Image Generation Request Received**

**Prompt:** ${prompt}

**Generated Image Description:**
Based on your prompt, I would generate a high-quality image featuring: ${prompt}

*Note: This is a placeholder response. In production, this would integrate with Google's Imagen API to generate actual images. The generated image would be returned as a URL or base64 encoded data.*

**Image Specifications:**
- Resolution: 1024x1024 pixels
- Style: Photorealistic with artistic enhancement
- Quality: High-definition
- Format: PNG with transparency support

To implement actual image generation, you would need:
1. Access to Google's Imagen API (currently in limited preview)
2. Proper authentication and billing setup
3. Image storage solution (Cloud Storage, etc.)`;

  return imageDescription;
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
