require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    console.log("Testing API Key with gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("Success with gemini-1.5-flash:", result.response.text());
    
  } catch (error) {
    console.error("Error with gemini-1.5-flash:", error.message);
  }

  try {
        console.log("Testing API Key with gemini-pro...");
        const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result2 = await model2.generateContent("Hello");
        console.log("Success with gemini-pro:", result2.response.text());
  } catch (err2) {
        console.error("Error with gemini-pro:", err2.message);
  }
}

listModels();
