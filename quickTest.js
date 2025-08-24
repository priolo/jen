import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

async function quickOllamaTest() {
    console.log("Quick Ollama test using OpenAI-compatible API...");
    
    try {
        const ollama = createOpenAI({
            baseURL: 'http://127.0.0.1:11434/v1',
            apiKey: 'ollama', // Ollama doesn't require a real API key
        });
        
        console.log("Generating text...");
        
        const result = await generateText({
            model: ollama.chat('llama3.2:3b'),
            prompt: "What is 2 + 2? Answer with just the number.",
            temperature: 0,
        });

        console.log("✅ Success! Ollama response:", result.text.trim());
        
    } catch (error) {
        console.error("❌ Error:", error);
        console.error("Error message:", error.message);
        console.error("Stack:", error.stack);
    }
}

quickOllamaTest().then(() => {
    console.log("Test completed");
    process.exit(0);
}).catch(err => {
    console.error("Unhandled error:", err);
    process.exit(1);
});
