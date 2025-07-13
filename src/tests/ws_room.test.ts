import { RootService } from "@priolo/julian"
import axios, { AxiosInstance } from "axios"
import { WebSocket } from "ws"
import buildNodeConfig, { PORT } from "../config.js"
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

		const dateNow = Date.now().toString()
		const ws = new WebSocket(`ws://localhost:${3100}/`)
		const result = await new Promise<string>((res, rej) => {
			let result

			ws.on('open', function open() {
				ws.send(JSON.stringify(<UserEnterC2S>{
					action: CHAT_ACTION_C2S.ENTER,
					agentId: agentLeader?.id
				}))
			})

			ws.on('message', (data: ArrayBuffer) => {
				const msg = JSON.parse(data.toString()) as BaseS2C

				switch (msg.action) {
					
					case CHAT_ACTION_S2C.ENTERED: {
						const toSend: UserMessageC2S = {
							action: CHAT_ACTION_C2S.USER_MESSAGE,
							chatId: msg.chatId,
							text: "What is the result of adding 5 and 10, then multiplying by 2? Reply with the number only.",
							complete: true,
						}
						ws.send(JSON.stringify(toSend))
						break
					}

					case CHAT_ACTION_S2C.APPEND_MESSAGE:
						const appendMsg = msg as AppendMessageS2C
						console.log("Append message:", appendMsg.content)
						break

					case CHAT_ACTION_S2C.NEW_ROOM:
						const newRoomMsg = msg as NewRoomS2C
						console.log("New room created:", newRoomMsg.roomId, "Parent:", newRoomMsg.parentRoomId, "Message ID:", newRoomMsg.parentMessageId)
						break

					default:
						console.log("Unknown message:", msg)
				}
			})

			ws.on('close', function close() {
				res(result)
			});
		})

		expect(dateNow).toBe(result)

	}, 1000000)
})
