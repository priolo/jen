import { RootService } from "@priolo/julian";
import axios, { AxiosInstance } from "axios";
import WebSocket from "ws";
import buildNodeConfig from "../config";


/**
 * REFUSO!!!!
 */
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

})
