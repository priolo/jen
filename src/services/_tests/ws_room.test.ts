import { RootService } from "@priolo/julian"
import axios, { AxiosInstance } from "axios"
import { WebSocket } from "ws"
import buildNodeConfig, { PORT, WS_PORT } from "../../config.js"
import { AgentRepo } from "../../repository/Agent.js"
import { seeding } from "../../seeding.js"
import { ContentCompleted, LLM_RESPONSE_TYPE, LlmResponse } from "../../types/commons/LlmResponse.js"
import { BaseS2C, CHAT_ACTION_C2S, CHAT_ACTION_S2C, ChatMessage, RoomMessageS2C, RoomNewS2C, UserCreateEnterC2S, UserEnteredS2C, UserMessageC2S } from "../../types/commons/RoomActions.js"



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

		let mainRoomId: string
		let chatId: string

		const userId = `id-user`
		const ws = new WebSocket(`ws://localhost:${WS_PORT}?id=${userId}`)
		const result = await new Promise<string>((res, rej) => {

			// Wait for the WebSocket to open
			ws.on('open', function open() {
				// creo e entro nella CHAT (nella MAIN-ROOM)
				ws.send(JSON.stringify(<UserCreateEnterC2S>{
					action: CHAT_ACTION_C2S.CREATE_ENTER,
					agentId: agentLeader?.id
				}))
			})

			let result: string = ""

			// Listen for messages from the server
			ws.on('message', (data: ArrayBuffer) => {
				const msg = JSON.parse(data.toString()) as BaseS2C

				switch (msg.action) {

					// I have entered in a room
					case CHAT_ACTION_S2C.USER_ENTERED: {

						mainRoomId = (msg as UserEnteredS2C).rooms![0].id
						chatId = msg.chatId

						// send a prompt to agent
						const toSend: UserMessageC2S = {
							action: CHAT_ACTION_C2S.USER_MESSAGE,
							chatId: chatId,
							// oppure null per indicare la MAIN-ROOM
							roomId: mainRoomId,
							text: `Don't answer directly, but use the tools available to you.
What is 2+2? Just write the answer number.`,
						}
						ws.send(JSON.stringify(toSend))
						break
					}

					// receive a message from agent
					case CHAT_ACTION_S2C.ROOM_MESSAGE:
						const agentWsMsg = msg as RoomMessageS2C
						const chatMessage: ChatMessage = agentWsMsg.content
						if (chatMessage.role == "user") break;
						const llmResponse = <LlmResponse>chatMessage.content
						if (llmResponse.type == LLM_RESPONSE_TYPE.COMPLETED && chatMessage.clientId == agentLeader?.id) {
							result = (<ContentCompleted>llmResponse.content).answer
							ws.close()
						}
						break

					// receive a new room created
					case CHAT_ACTION_S2C.ROOM_NEW:
						const newRoomMsg = msg as RoomNewS2C
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


