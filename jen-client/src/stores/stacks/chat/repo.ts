import { wsConnection } from "@/plugins/session/wsConnection"
import { deckCardsSo, GetAllCards } from "@/stores/docs/cards"
import { DOC_TYPE } from "@/types"
import { BaseS2C, CHAT_ACTION_C2S, CHAT_ACTION_S2C, ClientEnteredS2C, RoomMessageS2C, RoomNewS2C, UserCreateEnterC2S, UserEnteredS2C, UserLeaveC2S, UserMessageC2S } from "@/types/commons/RoomActions"
import { utils } from "@priolo/jack"
import { createStore, StoreCore } from "@priolo/jon"
import userSo from "../account/repo"
import { buildRoomDetail } from "../room/factory"
import { Chat, getRoomById } from "./types"



const setup = {

	state: {
		all: <Chat[]>[],
	},

	getters: {
		getChatById(id: string, store?: ChatStore): Chat {
			if (!id) return null
			return store.state.all?.find(chat => chat.id == id) ?? null
		},
		getRoomById(id: string, store?: ChatStore) {
			if (!id) return null
			for (const chat of store.state.all) {
				const room = getRoomById(chat, id)
				if (room) return room
			}
		}
	},

	actions: {

		createChat: async (agentId: string, store?: ChatStore) => {
			const msgSend: UserCreateEnterC2S = {
				action: CHAT_ACTION_C2S.CHAT_CREATE_ENTER,
				agentId: agentId,
			}
			wsConnection.send(JSON.stringify(msgSend))
		},

		removeChat: async (chatId: string, store?: ChatStore) => {
			const message: UserLeaveC2S = {
				action: CHAT_ACTION_C2S.USER_LEAVE,
				chatId: chatId,
				clientId: userSo.state.current?.id
			}
			wsConnection.send(JSON.stringify(message))
		},
		
		sendPrompt: async (
			{ chatId, roomId, text }: { chatId: string, roomId: string, text: string },
			store?: ChatStore
		) => {
			text = text?.trim()
			if (!text || text.length == 0) return
			const message: UserMessageC2S = {
				action: CHAT_ACTION_C2S.USER_MESSAGE,
				chatId: chatId,
				roomId: roomId,
				text: text,
			}
			wsConnection.send(JSON.stringify(message))
		},

		onMessage: (data: any, store?: ChatStore) => {
			const message: BaseS2C = JSON.parse(data.payload)

			switch (message.action) {

				case CHAT_ACTION_S2C.USER_ENTERED: {
					const msgEnter: UserEnteredS2C = JSON.parse(data.payload)
					let chat: Chat = {
						id: msgEnter.chatId,
						clientsIds: msgEnter.clientsIds,
						rooms: msgEnter.rooms,
					}
					store.setAll([...store.state.all, chat])

					const view = buildRoomDetail({
						chatId: msgEnter.chatId,
						roomId: msgEnter.rooms[0]?.id,
					})
					deckCardsSo.add({ view, anim: true })

					break
				}

				case CHAT_ACTION_S2C.CLIENT_ENTERED: {
					const msg = message as ClientEnteredS2C
					//*** */
					break
				}

				case CHAT_ACTION_S2C.CLIENT_LEAVE: {
					const msg = message as RoomMessageS2C
					//*** */
					break
				}

				case CHAT_ACTION_S2C.ROOM_MESSAGE: {
					const msg: RoomMessageS2C = message as RoomMessageS2C
					const room = store.getRoomById(msg.roomId)
					room?.history.push(msg.content)
					store._update()
					break
				}

				case CHAT_ACTION_S2C.ROOM_NEW: {
					const msg = message as RoomNewS2C
					const chat = store.getChatById(msg.chatId)
					chat.rooms.push({
						id: msg.roomId,
						parentRoomId: msg.parentRoomId,
						agentsIds: msg.agentsIds,
						history: [],
					})
					store._update()

					const view = buildRoomDetail({
						chatId: msg.chatId,
						roomId: msg.roomId,
					})
					const roomStore = utils.findAll(GetAllCards(), {
						type: DOC_TYPE.ROOM_DETAIL,
						roomId: msg.parentRoomId,
					})?.[0]
					roomStore.state.group.addLink({ view, parent: roomStore, anim: true })
					break
				}

			}

		}

	},

	mutators: {
		setAll: (all: Chat[]) => ({ all }),
	},
}

export type ChatState = typeof setup.state
export type ChatGetters = typeof setup.getters
export type ChatActions = typeof setup.actions
export type ChatMutators = typeof setup.mutators
export interface ChatStore extends StoreCore<ChatState>, ChatGetters, ChatActions, ChatMutators {
	state: ChatState
}

const chatSo = createStore<ChatState>(setup) as ChatStore
export default chatSo;



wsConnection.emitter.on("message", chatSo.onMessage)