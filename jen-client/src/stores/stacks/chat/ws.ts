import chatApi from "@/api/chat"
import { wsConnection } from "@/plugins/session/wsConnection"
import { SS_EVENT } from "@/plugins/SocketService/types"
import { deckCardsSo } from "@/stores/docs/cards"
import { DOC_TYPE } from "@/types"
import { BaseS2C, CHAT_ACTION_C2S, CHAT_ACTION_S2C, ChatCreateC2S, ChatGetC2S, ChatInfoS2C, ChatRoom, ClientEnteredS2C, ClientLeaveS2C, RoomAgentsUpdateC2S, RoomHistoryUpdateC2S, RoomHistoryUpdateS2C, RoomNewS2C, UPDATE_TYPE, UserInviteC2S, UserLeaveC2S } from "@/types/commons/RoomActions"
import { docsSo, utils } from "@priolo/jack"
import { createStore, StoreCore } from "@priolo/jon"
import { Chat } from "../../../types/Chat"
import { buildRoomDetail } from "../room/factory"



const setup = {

	state: {
		/** è praticamente un proxy delle CHAT presenti sul server */
		all: <Chat[]>[],

		online: <boolean>false,
	},

	getters: {
		getChatById(id: string, store?: ChatWSStore): Chat {
			if (!id) return null
			return store.state.all?.find(chat => chat.id == id) ?? null
		},
		getRoomById(id: string, store?: ChatWSStore) {
			if (!id) return null
			for (const chat of store.state.all) {
				const room = chat.rooms?.find(r => r.id == id) ?? null
				if (room) return room
			}
		}
	},

	actions: {

		//#region MESSAGE TO SERVER

		/**
		 * chiedo creazione di una CHAT
		 * response CHAT_INFO
		 */
		create: async (
			props: { chatId: string, agentIds: string[] },
			store?: ChatWSStore
		) => {
			const { chatId, agentIds } = props
			const msgSend: ChatCreateC2S = {
				chatId: chatId,
				action: CHAT_ACTION_C2S.CHAT_CREATE_AND_ENTER,
				agentIds,
			}
			wsConnection.send(JSON.stringify(msgSend))
		},

		/** 
		* Notifico che un USER lascia una CHAT
		*/
		leave: async (chatId: string, store?: ChatWSStore) => {
			const message: UserLeaveC2S = {
				action: CHAT_ACTION_C2S.USER_LEAVE,
				chatId: chatId,
			}
			wsConnection.send(JSON.stringify(message))
		},

		/**
		 * Invito uno USER ad una CHAT
		 */
		invite: async (props: { chatId: string, accountId: string }, store?: ChatWSStore) => {
			const { chatId, accountId } = props
			if (!chatId || !accountId) return
			const message: UserInviteC2S = {
				action: CHAT_ACTION_C2S.USER_INVITE,
				chatId,
				userId: accountId,
			}
			wsConnection.send(JSON.stringify(message))
		},

		/** 
		 * chiedo i dati di una CHAT
		 * response CHAT_INFO
		 */
		request: ( chatId: string, store?: ChatWSStore) => {
			// se non c'e' in locale la chiedo al server
			const chat = chatWSSo.getChatById(chatId)
			if (!!chat) return
			const msgSend: ChatGetC2S = {
				action: CHAT_ACTION_C2S.CHAT_LOAD_AND_ENTER,
				chatId,
			}
			wsConnection.send(JSON.stringify(msgSend))
		},

		/**
		 * Update the list of AGENTS in a ROOM 
		 */
		updateAgentsInRoom: (
			{ chatId, roomId, agentsIds }: { chatId: string, roomId: string, agentsIds: string[] },
			store?: ChatWSStore
		) => {
			const message: RoomAgentsUpdateC2S = {
				action: CHAT_ACTION_C2S.ROOM_AGENTS_UPDATE,
				chatId: chatId,
				roomId: roomId,
				agentsIds: agentsIds,
			}
			wsConnection.send(JSON.stringify(message))
		},

		/**
		 * Add a MESSAGE in the HISTORY of a ROOM
		 */
		appendMessage: (
			{ chatId, roomId, text }: { chatId: string, roomId: string, text: string },
			store?: ChatWSStore
		) => {
			const room = store.getRoomById(roomId)
			if (!room) return
			//const lastMessage = room.history[room.history.length - 1]
			const message: RoomHistoryUpdateC2S = {
				action: CHAT_ACTION_C2S.ROOM_HISTORY_UPDATE,
				chatId: chatId,
				roomId: roomId,
				updates: [{
					//refId: lastMessage?.id,
					type: UPDATE_TYPE.APPEND,
					content: { role: "user", content: text }
				}],
			}
			wsConnection.send(JSON.stringify(message))
		},

		//#endregion



		/**
		 * Chiamato quando una ROOM non è più visualizzata da nessuna CARD
		 */
		removeRoom: async ({ chatId, viewId }: { chatId: string, viewId?: string }, store?: ChatWSStore) => {
			const rooms = utils.findAll(docsSo.getAllCards(), { type: DOC_TYPE.ROOM_DETAIL, chatId: chatId })
			const activeRooms = rooms.filter((r: any) => r.state.uuid != viewId)
			if (activeRooms.length > 0) return
			store.leave(chatId)
			store.setAll(store.state.all.filter(c => c.id != chatId))
		},

		/**
		 * HANDLE MESSAGE FROM SERVER
		 */
		onMessage: (data: any, store?: ChatWSStore) => {
			const message: BaseS2C = JSON.parse(data.payload)

			switch (message.action) {

				// arrivate le INFO di una CHAT le integro nella store
				// potrebbe trattarsi anche di un INVITE
				case CHAT_ACTION_S2C.CHAT_INFO: {

					const msg: ChatInfoS2C = JSON.parse(data.payload)
					let chat: Chat = {
						id: msg.chatId,
						clients: msg.clients,
						rooms: msg.rooms,
					}
					const chatOld = store.getChatById(msg.chatId)
					if (!!chatOld) {
						chat = { ...chatOld, ...chat }
						store.setAll([...store.state.all])
					} else {
						store.setAll([...store.state.all, chat])
					}

					// // controllo se c'e' una VIEW aperta per questa CHAT
					// const views = utils.findAll(docsSo.getAllCards(), {
					// 	type: DOC_TYPE.ROOM_DETAIL,
					// 	chatId: msg.chatId,
					// })
					// if (views.length > 0) break
					// // non c'e': apro la VIEW della ROOM principale
					// const mainRoom = getMainRoom(chat.rooms)
					// if (!mainRoom) break
					// const view = buildRoomDetail({
					// 	chatId: msg.chatId,
					// 	roomId: mainRoom.id,
					// })
					// deckCardsSo.add({ view, anim: true })
					break
				}

				case CHAT_ACTION_S2C.CLIENT_ENTERED: {
					const msg = message as ClientEnteredS2C
					const chat = store.getChatById(msg.chatId)
					if (!chat) break
					chat.clients.push(msg.user)
					store._update()
					break
				}

				case CHAT_ACTION_S2C.CLIENT_LEAVE: {
					const msg = message as ClientLeaveS2C
					const chat = store.getChatById(msg.chatId)
					if (!chat) break
					chat.clients = chat.clients.filter(c => c.id != msg.userId)
					store._update()
					break
				}

				// aggiorno la HISTORY di una ROOM
				case CHAT_ACTION_S2C.ROOM_HISTORY_UPDATE: {
					const msg: RoomHistoryUpdateS2C = message as RoomHistoryUpdateS2C
					const room = store.getRoomById(msg.roomId)
					if (!room) break

					const history = [...room.history]
					for (const update of msg.updates) {
						if (update.type === UPDATE_TYPE.APPEND) {
							history.push(update.content)
							continue;
						}
						const index = history.findIndex(m => m.id == update.refId)
						switch (update.type) {
							case UPDATE_TYPE.ADD: {
								if (index == -1) {
									history.unshift(update.content)
								} else {
									history.splice(index + 1, 0, update.content)
								}
								break
							}
							case UPDATE_TYPE.DELETE: {
								if (index != -1) history.splice(index, 1)
								break
							}
							case UPDATE_TYPE.REPLACE: {
								if (index != -1) history[index] = update.content
								break
							}
						}
					}
					room.history = history
					store._update()
					break
				}

				// è stata creata una nuova ROOM in una CHAT esistente. Tipicamente quando c'e' il reasoning
				case CHAT_ACTION_S2C.ROOM_NEW: {
					const msg = message as RoomNewS2C
					const chat = store.getChatById(msg.chatId)
					chat.rooms.push({
						id: msg.roomId,
						chatId: msg.chatId,
						parentRoomId: msg.parentRoomId,
						agentsIds: msg.agentsIds,
						history: [],
					})
					store._update()

					const view = buildRoomDetail({
						chatId: msg.chatId,
						roomId: msg.roomId,
					})
					const roomStore = utils.findAll(docsSo.getAllCards(), {
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
		setOnline: (online: boolean) => ({ online }),
	},
}

export type ChatWSState = typeof setup.state
export type ChatWSGetters = typeof setup.getters
export type ChatWSActions = typeof setup.actions
export type ChatWSMutators = typeof setup.mutators

/**
 * Si occupa di mentenere i dati delle CHAT sul client comunicando con il server via WEBSOCKET
 */
export interface ChatWSStore extends StoreCore<ChatWSState>, ChatWSGetters, ChatWSActions, ChatWSMutators {
	state: ChatWSState
}

const chatWSSo = createStore<ChatWSState>(setup) as ChatWSStore
export default chatWSSo;


wsConnection.emitter.on(SS_EVENT.MESSAGE, chatWSSo.onMessage)
wsConnection.emitter.on(SS_EVENT.CONNECTION,
	({ payload }: { payload: number }) => chatWSSo.setOnline(payload == WebSocket.OPEN)
)


export function getMainRoom(rooms: ChatRoom[]): ChatRoom {
	if (rooms == null) return null
	for (const room of rooms) {
		if (!room.parentRoomId) return room
	}
	return null
}