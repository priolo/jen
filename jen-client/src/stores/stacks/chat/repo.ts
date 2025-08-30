import { AgentLlm } from "@/types/Agent"
import { createStore, StoreCore } from "@priolo/jon"
import { Chat, getRoomById } from "./types"
import { BaseS2C, CHAT_ACTION_S2C, UserEnteredS2C } from "@/types/commons/RoomActions"
import userSo from "../account/repo"



const setup = {

	state: {
		all: <Chat[]>null,
	},

	getters: {
		getChatById(id: string, store?: ChatStore): Chat {
			if (!id) return null
			return store.state.all?.find(chat => chat.id == id) ?? null
		}
	},

	actions: {
		onMessage: (data: any, store?: ChatStore) => {
			const message: BaseS2C = JSON.parse(data.payload)


			switch (message.action) {


				
				case CHAT_ACTION_S2C.ENTERED: {
					const msg = message as UserEnteredS2C
					let chat = store.getChatById(msg.chatId)
					if (!chat) {
						chat = {
							id: msg.chatId,
							clientsIds: userSo.state.current ? [userSo.state.current.id] : [],
							rooms: [],
						}
					}
					let room = getRoomById(chat, msg.roomId)
					if (!room) {
						room = {
							id: msg.roomId,
							parentRoomId: null,
							history: [],
						}
						chat.rooms.push(room)
					}
					break
				}

				case CHAT_ACTION_S2C.LEAVE: {
					const msg = message as UserLeaveS2C
					// ???
					break
				}

				case CHAT_ACTION_S2C.MESSAGE: {
					const msg: MessageS2C = message as MessageS2C
					if (store.state.room?.id != msg.roomId) return
					if (!store.state.room.history) store.state.room.history = []
					store.state.room.history.push(msg.content)
					store.setRoom({ ...store.state.room })
					break
				}

				case CHAT_ACTION_S2C.ROOM_NEW: {
					const msg = message as NewRoomS2C
					const view = buildRoomDetail({
						chatId: msg.chatId,
						room: {
							id: msg.roomId,
							agentId: msg.agentId,
							parentRoomId: msg.parentRoomId,
							history: [],
						},
						size: VIEW_SIZE.NORMAL
					})
					store.state.group.addLink({ view, parent: store, anim: true })
					break
				}

			}

		}

	},

	mutators: {
		setAll: (all: AgentLlm[]) => ({ all }),
	},
}

export type ChatState = typeof setup.state
export type ChatGetters = typeof setup.getters
export type ChatActions = typeof setup.actions
export type ChatMutators = typeof setup.mutators
export interface ChatStore extends StoreCore<ChatState>, ChatGetters, ChatActions, ChatMutators {
	state: ChatState
}

const chatSo = createStore<ChatState>(setup)
export default chatSo as ChatStore

wsConnection.emitter.on("message", chatSo.onMessage)