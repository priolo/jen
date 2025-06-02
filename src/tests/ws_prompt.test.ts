import { RootService } from "@priolo/julian";
import buildNodeConfig, { PORT } from "../config";
import WebSocket from "ws"
import axios, { AxiosInstance } from "axios";
import { PROMPT_ACTIONS, WSPromptCreateMessage, WSPromptAddMessageMessage } from "../routers/PromptWSRoute.js";

describe("Test WSPromptService WebSocket", () => {
	let axiosIstance: AxiosInstance;
	let root: RootService;

	beforeAll(async () => {
		axiosIstance = axios.create({
			baseURL: `http://localhost:${3010}`,
			withCredentials: true,
		});

		const cnf = buildNodeConfig();
		root = await RootService.Start(cnf);
	});

	afterAll(async () => {
		await RootService.Stop(root);
	});

	test("WebSocket client can connect to WSPromptService", async () => {
		let result: string[] = []

		// creo il client ws e sull'apertura mando dei dati
		const ws = new WebSocket(`ws://localhost:${3010}/`)

		ws.on('open', () => {
			ws.send("only string")
			ws.send(JSON.stringify({
				path: "room1/pos2", action: "message",
				payload: { message: "<room1-pos2>" },
			}))
			ws.send(JSON.stringify({
				path: "command", action: "message",
				payload: { message: "<command>" },
			}))
		})

		// se ricevo una risposta la memorizzo
		ws.on('message', (message: string) => {
			result.push(message.toString())
			if (result.length == 5) ws.close()
		})

		// aspetto che il socket si chiuda
		await new Promise<void>((res, rej) => ws.on('close', res))
		expect(result).toEqual([
			`root::receive:only string`,
			`command::receive:only string`,
			`room1/pos2::receive:only string`,
			`room1/pos2::receive:{\"path\":\"room1/pos2\",\"action\":\"message\",\"payload\":{\"message\":\"<room1-pos2>\"}}`,
			`command::receive:{\"path\":\"command\",\"action\":\"message\",\"payload\":{\"message\":\"<command>\"}}`,
		])
	})

	test("Can create prompt and participate in chat room", async () => {
		return new Promise<void>((resolve, reject) => {
			let promptId: string;
			const client1 = new WebSocket(`ws://localhost:${3010}/`);
			const client2 = new WebSocket(`ws://localhost:${3010}/`);
			let client1Messages: any[] = [];
			let client2Messages: any[] = [];

			// Setup message handlers
			client1.on('message', (message: string) => {
				const msg = JSON.parse(message);
				client1Messages.push(msg);
				console.log('Client1 received:', msg);

				// Handle responses for client1
				if (msg.action === PROMPT_ACTIONS.CREATE && msg.success) {
					promptId = msg.promptId;
					// Client 1 enters the prompt
					client1.send(JSON.stringify({
						id: promptId,
						action: PROMPT_ACTIONS.ENTER
					}));
				} else if (msg.action === PROMPT_ACTIONS.ENTER && msg.success) {
					// Client 2 joins the prompt
					client2.send(JSON.stringify({
						id: promptId,
						action: PROMPT_ACTIONS.ENTER
					}));
				}
			});

			client2.on('message', (message: string) => {
				const msg = JSON.parse(message);
				client2Messages.push(msg);
				console.log('Client2 received:', msg);

				// Handle responses for client2
				if (msg.action === PROMPT_ACTIONS.ENTER && msg.success) {
					// Client 1 sends a message
					const messageData: WSPromptAddMessageMessage = {
						id: promptId,
						action: PROMPT_ACTIONS.ADD_MESSAGE,
						role: "user",
						text: "Hello from client 1!"
					};
					client1.send(JSON.stringify(messageData));
				} else if (msg.action === PROMPT_ACTIONS.MESSAGE_ADDED) {
					// Client 2 responds with a message
					const messageData: WSPromptAddMessageMessage = {
						id: promptId,
						action: PROMPT_ACTIONS.ADD_MESSAGE,
						role: "user", 
						text: "Hello back from client 2!"
					};
					client2.send(JSON.stringify(messageData));
				}
			});

			// Handle when both clients have received the second message
			let messageCount = 0;
			const checkForCompletion = () => {
				messageCount++;
				if (messageCount >= 2) { // Both clients received the second message
					// Cleanup
					client1.close();
					client2.close();
					
					// Verify test results
					expect(client1Messages.some(m => m.action === PROMPT_ACTIONS.CREATE && m.success)).toBe(true);
					expect(client1Messages.some(m => m.action === PROMPT_ACTIONS.MESSAGE_ADDED && m.message.text.includes("client 2"))).toBe(true);
					expect(client2Messages.some(m => m.action === PROMPT_ACTIONS.MESSAGE_ADDED && m.message.text.includes("client 1"))).toBe(true);
					
					resolve();
				}
			};

			client1.on('message', (message: string) => {
				const msg = JSON.parse(message);
				if (msg.action === PROMPT_ACTIONS.MESSAGE_ADDED && msg.message.text.includes("client 2")) {
					checkForCompletion();
				}
			});

			client2.on('message', (message: string) => {
				const msg = JSON.parse(message);
				if (msg.action === PROMPT_ACTIONS.MESSAGE_ADDED && msg.message.text.includes("client 1")) {
					checkForCompletion();
				}
			});

			// Start the test by creating a prompt
			client1.on('open', () => {
				const createMessage: WSPromptCreateMessage = {
					id: "temp-id",
					action: PROMPT_ACTIONS.CREATE,
					name: "Test Chat Room"
				};
				client1.send(JSON.stringify(createMessage));
			});

			client2.on('open', () => {
				// Client 2 waits for client 1 to create the prompt
			});

			// Handle errors
			client1.on('error', reject);
			client2.on('error', reject);

			// Timeout protection
			setTimeout(() => {
				client1.close();
				client2.close();
				reject(new Error('Test timeout'));
			}, 10000);
		});
	});
})
