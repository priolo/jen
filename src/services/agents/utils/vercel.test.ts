import { ChatMessage } from "../../../types/commons/RoomActions.js";
import { getHistory } from "./vercel.js";



describe("Test getHistory function", () => {

	test("should convert string content messages to UserModelMessage", () => {
		// Act
		const result = getHistory(history);

		// Assert
		expect(result).toMatchObject(historyVercel);
	});

});

const history: ChatMessage[] = [
  {
    role: "user",
    content: "How much is 2+2? Just write the result.",
  },
  {
    role: "agent",
    content: {
      type: 3,
      continue: true,
      content: {
        toolName: "addition",
        toolId: undefined,
        args: {
          a: 2,
          b: 2,
        },
        result: 4,
      },
    },
  },
  {
    role: "agent",
    content: {
      type: 0,
      continue: false,
      content: {
        result: "4",
      },
    },
  },
]

const historyVercel = [
  {
    role: "user",
    content: "How much is 2+2? Just write the result.",
  },
  {
    role: "assistant",
    content: [
      {
        type: "tool-call",
		//toolCallId: "yu5a2fhoh",
        toolName: "addition",
        input: {a: 2,b: 2,},
      },
    ],
  },
  {
    role: "tool",
    content: [
      {
        type: "tool-result",
        //toolCallId: "yu5a2fhoh",
        toolName: "addition",
        output: {type: "text",value: "4",},
      },
    ],
  },
  {
    role: "assistant",
    content: [
      {
        type: "tool-call",
        //toolCallId: "xnqcv3od3",
        toolName: "final_answer",
        input: { answer: "4", },
      },
    ],
  },
  {
    role: "tool",
    content: [
      {
        type: "tool-result",
        //toolCallId: "xnqcv3od3",
        toolName: "final_answer",
        output: { type: "text", value: "4", },
      },
    ],
  },
]