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
        return await processWithGoogle(config.systemPrompt, fullPrompt, config.maxTokens);
      
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

async function processWithGoogle(systemPrompt, message, maxTokens) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `${systemPrompt}\n\nUser: ${message}`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  return response.text();
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
