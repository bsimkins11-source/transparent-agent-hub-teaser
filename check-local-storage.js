// Simple script to check localStorage and restore agents if needed
console.log('🔧 Checking localStorage for agent library...\n');

// Check if we're in a browser environment
if (typeof window === 'undefined') {
  console.log('❌ This script must be run in a browser console');
  console.log('💡 Open your browser console on the Global Library page and run this script there');
} else {
  // Get your user ID from the current user context
  const userId = window.currentUser?.uid;
  
  if (!userId) {
    console.log('❌ No user ID found. Please make sure you are logged in.');
    console.log('💡 Try refreshing the page and logging in again.');
  } else {
    console.log(`✅ User ID found: ${userId}`);
    
    // Check localStorage for your agent library
    const userLibraryKey = `userLibrary_${userId}`;
    const storedLibrary = localStorage.getItem(userLibraryKey);
    
    console.log(`\n🔍 Checking localStorage key: ${userLibraryKey}`);
    console.log(`📦 Stored library exists: ${!!storedLibrary}`);
    
    if (storedLibrary) {
      try {
        const libraryData = JSON.parse(storedLibrary);
        console.log('📚 Library data found:', libraryData);
        
        const agents = libraryData.agents || [];
        console.log(`\n📋 You have ${agents.length} agents in your library:`);
        
        if (agents.length > 0) {
          agents.forEach((agentId, index) => {
            console.log(`   ${index + 1}. ${agentId}`);
          });
        } else {
          console.log('   📭 No agents found');
        }
        
        // Check if Gemini agent is missing
        const hasGemini = agents.includes('gemini-chat-agent');
        console.log(`\n🤖 Gemini agent in library: ${hasGemini ? '✅ YES' : '❌ NO'}`);
        
        if (!hasGemini) {
          console.log('\n💡 To restore the Gemini agent, run this in the console:');
          console.log(`
// Add Gemini agent to your library
const userId = '${userId}';
const userLibraryKey = \`userLibrary_\${userId}\`;
const storedLibrary = localStorage.getItem(userLibraryKey);
let libraryData = storedLibrary ? JSON.parse(storedLibrary) : { agents: [], updatedAt: new Date().toISOString() };

if (!libraryData.agents.includes('gemini-chat-agent')) {
  libraryData.agents.push('gemini-chat-agent');
  libraryData.updatedAt = new Date().toISOString();
  localStorage.setItem(userLibraryKey, JSON.stringify(libraryData));
  console.log('✅ Gemini agent restored to your library!');
  console.log('💡 Now refresh the page to see it.');
} else {
  console.log('✅ Gemini agent already in library');
}
          `);
        }
        
      } catch (parseError) {
        console.error('❌ Error parsing stored library:', parseError);
        console.log('\n💡 Your library data might be corrupted. Try clearing it and starting fresh.');
      }
    } else {
      console.log('\n📭 No library found in localStorage');
      console.log('\n💡 To create a new library with the Gemini agent, run this in the console:');
      console.log(`
// Create new library with Gemini agent
const userId = '${userId}';
const userLibraryKey = \`userLibrary_\${userId}\`;
const libraryData = {
  agents: ['gemini-chat-agent'],
  updatedAt: new Date().toISOString()
};

localStorage.setItem(userLibraryKey, JSON.stringify(libraryData));
console.log('✅ New library created with Gemini agent!');
console.log('💡 Now refresh the page to see it.');
      `);
    }
    
    // Also check for any other localStorage keys
    console.log('\n🔍 Other localStorage keys:');
    const allKeys = Object.keys(localStorage);
    const userKeys = allKeys.filter(key => key.includes(userId));
    
    if (userKeys.length > 0) {
      userKeys.forEach(key => {
        if (key !== userLibraryKey) {
          console.log(`   📁 ${key}`);
        }
      });
    } else {
      console.log('   📭 No other user-specific keys found');
    }
  }
}

console.log('\n✨ Script completed!');
console.log('💡 If you need to restore agents, use the commands above.');
