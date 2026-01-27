import { ChatMessage } from "@shared/types/commons/RoomActions";



const mockHistory1: ChatMessage[] = [
	{
		role: "user",
		content: `
## Please solve the following problem using MAIN PROCESS:
quanto fa 5+5?`,
	},
	{
		role: "assistant",
		content: [
			{
				type: "tool-call",
				toolCallId: "M4AdpQw1lHHQp7fv",
				toolName: "get_reasoning",
				args: {
					thought: "The user is asking a simple addition question.",
				},
			},
		],
		id: "msg-RacqfNkU9bILfjcMma935Hsx",
	},
	{
		role: "tool",
		id: "msg-wzHBTirXHxATpPlUYNzB1qjG",
		content: [
			{
				type: "tool-result",
				toolCallId: "M4AdpQw1lHHQp7fv",
				toolName: "get_reasoning",
				result: "The user is asking a simple addition question.",
			},
		],
	},
	{
		role: "assistant",
		content: [
			{
				type: "tool-call",
				toolCallId: "F3AVQfG7yl1y3Ser",
				toolName: "chat_with_MATH",
				args: {
					question: "What is 5 + 5?",
				},
			},
		],
		id: "msg-g3e5rFEOLyhIUiqpvQ85lpxh",
	},
	{
		role: "tool",
		id: "msg-nvqbEdbGb99jDTxlv8zFfE20",
		content: [
			{
				type: "tool-result",
				toolCallId: "F3AVQfG7yl1y3Ser",
				toolName: "chat_with_MATH",
				result: "10",
			},
		],
	},
	{
		role: "assistant",
		content: [
			{
				type: "tool-call",
				toolCallId: "BUpxymgyYTh4LYTR",
				toolName: "get_reasoning",
				args: {
					thought: "I have the answer from the MATH agent.",
				},
			},
		],
		id: "msg-dXQGjDf3G8G3JgbKmOwZ52Zx",
	},
	{
		role: "tool",
		id: "msg-KmDoNNkVvPlZoWGoCBHjtdFi",
		content: [
			{
				type: "tool-result",
				toolCallId: "BUpxymgyYTh4LYTR",
				toolName: "get_reasoning",
				result: "I have the answer from the MATH agent.",
			},
		],
	},
	{
		role: "assistant",
		content: [
			{
				type: "tool-call",
				toolCallId: "NY1vKIoYBbGJ59pQ",
				toolName: "final_answer",
				args: {
					answer: "5 + 5 = 10",
				},
			},
		],
		id: "msg-p4iDDLE6R4SqUyTaq5CLryde",
	},
	{
		role: "tool",
		id: "msg-YkIFj570JbV7yplFRDUHc1eD",
		content: [
			{
				type: "tool-result",
				toolCallId: "NY1vKIoYBbGJ59pQ",
				toolName: "final_answer",
				result: "5 + 5 = 10",
			},
		],
	},
];

export default mockHistory1;