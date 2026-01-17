const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

async function checkModels() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Checking key ending in:", key.slice(-4));
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const res = await axios.get(url);
        let output = "--- Available Models ---\n";
        res.data.models.forEach(m => {
            if (m.supportedGenerationMethods.includes("generateContent")) {
                output += `Model: ${m.name}\n`;
            }
        });
        fs.writeFileSync(path.join(__dirname, 'models.txt'), output);
        console.log("Models written to models.txt");
    } catch (err) {
        console.error("List Error:", err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    }
}
checkModels();
