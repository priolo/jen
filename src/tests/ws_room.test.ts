import { RootService } from "@priolo/julian"
import axios, { AxiosInstance } from "axios"
import { WebSocket } from "ws"
import buildNodeConfig, { PORT, PORT_WS } from "../config.js"
import { Agent } from "../repository/Agent.js"
import { seeding } from "../seeding.js"
import { AppendMessageS2C, BaseS2C, CHAT_ACTION_C2S, CHAT_ACTION_S2C, NewRoomS2C, UserEnterC2S, UserMessageC2S } from "../types/RoomActions.js"


describe("Test on WS ROOT", () => {

	let axiosIstance: AxiosInstance
	let root: RootService

	beforeAll(async () => {
		axiosIstance = axios.create({
			baseURL: `http://localhost:${PORT}`,
			withCredentials: true
		})
		const cnf = buildNodeConfig()
		root = await RootService.Start(cnf)
		await seeding(root)
	}, 100000)

	afterAll(async () => {
		await RootService.Stop(root)
	})



	test("client connect/send/close", async () => {

		expect(root).toBeDefined()
		const allAgents = (await axiosIstance.get(`/api/agents`))?.data as Agent[]
		expect(allAgents).toHaveLength(2)
		const agentLeader = allAgents.find(a => a.name == "LEADER")
		expect(agentLeader).toBeDefined()

		const ws = new WebSocket(`ws://localhost:${PORT_WS}/`)
		const result = await new Promise<string>((res, rej) => {
			let result: string = ""

			// Wait for the WebSocket to open
			ws.on('open', function open() {
				// Enter in room
				ws.send(JSON.stringify(<UserEnterC2S>{
					action: CHAT_ACTION_C2S.ENTER,
					agentId: agentLeader?.id
				}))
			})


			// Listen for messages from the server
			ws.on('message', (data: ArrayBuffer) => {
				const msg = JSON.parse(data.toString()) as BaseS2C

				switch (msg.action) {
					
					// I have entered in a room
					case CHAT_ACTION_S2C.ENTERED: {

						// send a prompt to agent
						const toSend: UserMessageC2S = {
							action: CHAT_ACTION_C2S.USER_MESSAGE,
							chatId: msg.chatId,
							text: "What is the result of adding 5 and 10, then multiplying by 2? Reply with the number only.",
							complete: true,
						}
						ws.send(JSON.stringify(toSend))
						break
					}

					// receive a message from agent
					case CHAT_ACTION_S2C.APPEND_MESSAGE:
						const appendMsg = msg as AppendMessageS2C
						console.log("Append message:", appendMsg.content)
						break

					// receive a new room created
					case CHAT_ACTION_S2C.NEW_ROOM:
						const newRoomMsg = msg as NewRoomS2C
						console.log("New room created:", newRoomMsg.roomId, "Parent:", newRoomMsg.parentRoomId)
						break

					default:
						console.log("Unknown message:", msg)
				}
			})

			ws.on('close', function close() {
				res(result)
			});
		})

		//expect(dateNow).toBe(result)

	}, 1000000)
})
