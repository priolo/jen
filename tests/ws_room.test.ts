import { RootService } from "@priolo/julian"
import axios, { AxiosInstance } from "axios"
import { WebSocket } from "ws"
import buildNodeConfig, { PORT, WS_PORT } from "../src/config.js"
import { AgentRepo } from "../src/repository/Agent.js"
import { seeding } from "../src/seeding.js"
import { AgentMessageS2C, BaseS2C, CHAT_ACTION_C2S, CHAT_ACTION_S2C, NewRoomS2C, UserEnterC2S, UserMessageC2S } from "../src/types/RoomActions.js"
import { LLM_RESPONSE_TYPE, LlmResponse, ContentCompleted } from "../src/services/agents/types.js"


describe("Test on WS ROOT", () => {

	let axiosIstance: AxiosInstance
	let root: RootService

	beforeAll(async () => {
		axiosIstance = axios.create({
			baseURL: `http://localhost:${PORT}`,
			withCredentials: true
		})
		const cnf = buildNodeConfig(false, true)
		root = await RootService.Start(cnf)
		await seeding(root)
	}, 100000)

	afterAll(async () => {
		await RootService.Stop(root)
	})



	test("simple question: 2+2", async () => {

		expect(root).toBeDefined()
		const allAgents = (await axiosIstance.get(`/api/agents`))?.data as AgentRepo[]
		expect(allAgents).toHaveLength(2)
		const agentLeader = allAgents.find(a => a.name == "LEADER")
		expect(agentLeader).toBeDefined()

		const ws = new WebSocket(`ws://localhost:${WS_PORT}/`)
		const result = await new Promise<string>((res, rej) => {

			// Wait for the WebSocket to open
			ws.on('open', function open() {
				// Enter in room
				ws.send(JSON.stringify(<UserEnterC2S>{
					action: CHAT_ACTION_C2S.ENTER,
					agentId: agentLeader?.id
				}))
			})

			let result: string = ""

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
							text: `Don't answer directly, but use the tools available to you.
What is 2+2? Just write the answer number.`,
							complete: true,
						}
						ws.send(JSON.stringify(toSend))
						break
					}

					// receive a message from agent
					case CHAT_ACTION_S2C.AGENT_MESSAGE:
						const agentMsg = msg as AgentMessageS2C
						const type = (<LlmResponse>agentMsg.content).type
						if (type == LLM_RESPONSE_TYPE.COMPLETED && agentMsg.agentId == agentLeader?.id) {
							result = (<ContentCompleted>(<LlmResponse>agentMsg.content).content).answer
							ws.close()
						}
						break

					// receive a new room created
					case CHAT_ACTION_S2C.NEW_ROOM:
						const newRoomMsg = msg as NewRoomS2C
						break

					default:
						console.log("Unknown message:", msg)
				}
			})

			ws.on('close', function close() {
				res(result)
			});
		})

		console.log(result)

		expect(result).toEqual("4")

	}, 1000000)
})


