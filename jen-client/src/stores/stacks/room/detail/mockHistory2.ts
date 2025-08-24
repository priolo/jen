const mockHistory2: ModelMessage[] = [
	{
		role: "user",
		content: `


## Please solve the following problem using MAIN PROCESS:
What is 5 + 5?`,
	},
	{
		role: "assistant",
		content: [
			{
				type: "tool-call",
				toolCallId: "QM3YL3T4WXIA0nRP",
				toolName: "get_reasoning",
				args: {
					thought: "The problem is a simple addition of two numbers.",
				},
			},
		],
		id: "msg-4FyS5z5ckAJntwWtzORlM1vs",
	},
	{
		role: "tool",
		id: "msg-3LskCrgCGHSmKb1Zwhtn6q3D",
		content: [
			{
				type: "tool-result",
				toolCallId: "QM3YL3T4WXIA0nRP",
				toolName: "get_reasoning",
				result: "The problem is a simple addition of two numbers.",
			},
		],
	},
	{
		role: "assistant",
		content: [
			{
				type: "tool-call",
				toolCallId: "GMeGzN26S7wilY4C",
				toolName: "add",
				args: {
					b: 5,
					a: 5,
				},
			},
		],
		id: "msg-Iw8EDTt8GgbDWPiibSxAH6uQ",
	},
	{
		role: "tool",
		id: "msg-JtGE7KIt2F8PH42X33YypK7z",
		content: [
			{
				type: "tool-result",
				toolCallId: "GMeGzN26S7wilY4C",
				toolName: "add",
				result: 10,
			},
		],
	},
	{
		role: "assistant",
		content: [
			{
				type: "tool-call",
				toolCallId: "cIcAGpoteUlDLKtr",
				toolName: "get_reasoning",
				args: {
					thought: "I have the answer to the question.",
				},
			},
		],
		id: "msg-BVrMOkFHjjNHbVA1I9GynZss",
	},
	{
		role: "tool",
		id: "msg-JM2cCqwNnff9rP8ysolIYFrO",
		content: [
			{
				type: "tool-result",
				toolCallId: "cIcAGpoteUlDLKtr",
				toolName: "get_reasoning",
				result: "I have the answer to the question.",
			},
		],
	},
	{
		role: "assistant",
		content: [
			{
				type: "tool-call",
				toolCallId: "GoWGVzJRJqRGxpm6",
				toolName: "final_answer",
				args: {
					answer: "10",
				},
			},
		],
		id: "msg-s1myDx2L2BRheRJQcTM3Wc80",
	},
	{
		role: "tool",
		id: "msg-WOaXxTkdrfEScfQ3153gLowG",
		content: [
			{
				type: "tool-result",
				toolCallId: "GoWGVzJRJqRGxpm6",
				toolName: "final_answer",
				result: "10",
			},
		],
	},
]

export default mockHistory2