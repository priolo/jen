import { LlmRepo } from "@/repository/Provider.js";
import { LLM_MODELS } from "@/types/commons/LlmProviders.js";
import { getModel } from "@/services/agents/utils/vercel.js";
import { generateText } from "ai";

/**
 * Simple test to verify Ollama integration works
 */
async function testOllamaIntegration() {
    console.log("Testing Ollama integration...");
    
    // Create a mock LlmRepo for Ollama
    const mockLlmRepo: LlmRepo = {
        id: "test-ollama",
        code: LLM_MODELS.OLLAMA_LLAMA_3_2_3B,
        key: null, // Ollama doesn't need an API key
    } as LlmRepo;

    try {
        // Get the model
        const model = getModel(mockLlmRepo);
        console.log("Model created successfully");

        // Test a simple generation
        const result = await generateText({
            model: model,
            prompt: "What is 2 + 2? Just answer with the number.",
            temperature: 0,
        });

        console.log("Ollama Response:", result.text);
        console.log("✅ Ollama integration working!");
        
    } catch (error) {
        console.error("❌ Error testing Ollama:", error);
        console.log("\nTroubleshooting:");
        console.log("1. Make sure Ollama is running locally");
        console.log("2. Make sure you have pulled the model: ollama pull llama3.2:3b");
        console.log("3. Check if Ollama is accessible at http://localhost:11434");
    }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testOllamaIntegration();
}

export { testOllamaIntegration };
