

class AgentBase {
	async complete( history: ChatMessage[], text: string ): Response{
		// This method should be implemented by subclasses
		throw new Error("Method 'complete' not implemented.");
	}
}

export default AgentBase;