import readlineSync from 'readline-sync';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the API with your API key
const genAI = new GoogleGenerativeAI("AIzaSyA-pq0dLIcYavuYfvCkGJtM2VjHa2-n3Lk");

// Get the model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Predefined Q&A with better formatting
const predefinedQA = {
  "women safety number": `🛡️ **Emergency Numbers:**

• **National Emergency:** 112
• **Women Helpline:** 1091
• **Police:** 100
• **Ambulance:** 108

Stay safe! 🤝`,

  "safety tips": `🛡️ **Essential Safety Tips:**

• **Trust your instincts:** If something feels wrong, leave immediately
• **Stay aware:** Keep your head up and observe your surroundings
• **Share location:** Tell trusted contacts where you're going
• **Avoid isolation:** Stay in well-lit, populated areas
• **Keep emergency numbers:** Have them easily accessible
• **Vary your routine:** Don't be predictable in your patterns

Need tips for a **specific situation**? 🤝`,

  "send sos": `🛡️ **SOS Methods:**

• **Emergency Call:** Dial 112 immediately
• **Phone Features:** Use emergency SOS (press power button 5 times)
• **Apps:** Use safety apps with panic buttons
• **Location Sharing:** Send live location to trusted contacts
• **Voice Commands:** "Hey Google/Siri, call emergency"

Your safety is **priority number one**! 🤝`,

  "emergency": `🛡️ **Emergency Response:**

• **Call 112:** India's universal emergency number
• **Stay visible:** Move to a public, well-lit area
• **Share location:** Send your location to trusted contacts
• **Stay calm:** Speak clearly to emergency services
• **Don't hang up:** Stay on the line until help arrives
• **Document:** If safe, record details for later

**Help is on the way!** 🤝`
};

// Function to check if input matches predefined questions
function checkPredefinedAnswer(input) {
  const lowerInput = input.toLowerCase();
  for (const [key, answer] of Object.entries(predefinedQA)) {
    if (lowerInput.includes(key)) {
      return answer;
    }
  }
  return null;
}

// Enhanced text formatting function
function formatResponseText(text) {
  // Remove existing emojis to avoid duplication
  text = text.replace(/🛡️|🤝/g, '').trim();
  
  // Split text into sentences
  let sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Convert sentences to bullet points
  let bulletPoints = sentences.map(sentence => {
    sentence = sentence.trim();
    if (sentence.length > 0) {
      // Make important safety keywords bold
      const importantWords = [
        'emergency', 'safety', 'help', 'call', 'police', 'trust', 'aware', 'avoid',
        'stay', 'keep', 'share', 'location', 'immediately', 'never', 'always',
        'important', 'remember', 'warning', 'danger', 'safe', 'secure', 'dial', 'number'
      ];
      
      importantWords.forEach(word => {
        const regex = new RegExp(`\\b(${word})\\b`, 'gi');
        sentence = sentence.replace(regex, (match) => `**${match}**`);
      });
      
      return `• ${sentence}`;
    }
    return '';
  }).filter(point => point.length > 0);
  
  // Join bullet points
  let formattedText = bulletPoints.join('\n');
  
  // Convert markdown bold to console bold
  // formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, (_, boldText) => `\x1b[1m${boldText}\x1b[0m`);
  
  // Add branding
  formattedText = '🛡️ ' + formattedText + '\n\nNeed more help? 🤝';
  // formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, (_, boldText) => `\x1b[1m${boldText}\x1b[0m`);
  
  return formattedText;
}

// Chat logic
async function Chatting(input) {
  // Check predefined answers first
  const predefinedAnswer = checkPredefinedAnswer(input);
  if (predefinedAnswer) {
    console.log(predefinedAnswer);
    return;
  }
     
  try {
    console.log("🤔 Thinking...");
    
    // Add context to make Gemini respond in point format
    const contextualInput = `You are a safety assistant. Please provide a helpful response to this question, keeping it informative but concise. Each main point should be a separate sentence. User question: ${input}`;
    
    // Generate content with proper error handling
    const result = await model.generateContent(contextualInput);
    const response = await result.response;
    let text = response.text();

    // Apply enhanced formatting
    const formattedText = formatResponseText(text);
    
    console.log(formattedText);
        
  } catch (error) {
    // Show the actual error for debugging
    console.log("❌ Error Message:", error.message);
         
    // Check for specific error types
    if (error.message.includes("API_KEY") || error.message.includes("401")) {
      console.log("🔑 API Key issue. Please check your API key.");
    } else if (error.message.includes("quota") || error.message.includes("429")) {
      console.log("📊 API quota exceeded. Please try again later.");
    } else if (error.message.includes("model") || error.message.includes("404")) {
      console.log("🤖 Model not found. Please check the model name.");
    } else if (error.message.includes("SAFETY")) {
      console.log("🛡️ Content filtered for safety reasons.");
    } else {
      console.log("⚠️ Gemini API Error. Please try again.");
    }
  }
}

// Main loop
async function main() {
  console.log("🤖 Hello! I'm Sathi, your personal safety assistant.");
  console.log("💬 I'm here to help you stay safe, provide support, and answer safety-related questions.");
  console.log("How can I assist you today? 💪🤝");
  console.log("Type 'exit' to quit.\n");
     
  while (true) {
    const input = readlineSync.question("Ask me anything--> ");
    if (input.toLowerCase() === "exit") {
      console.log("👋 Goodbye! Stay safe!");
      break;
    }
    await Chatting(input);
    console.log(); // Add spacing
  }
}

main();