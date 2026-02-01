import { wsConnection } from "@/plugins/session/wsConnection"
import { SS_EVENT } from "@/plugins/SocketService/types"
import { DOC_TYPE } from "@/types"
import { deepMerge } from "@/utils/object"
import { docsSo, utils, ViewStore } from "@priolo/jack"
import { createStore, StoreCore } from "@priolo/jon"
import { CHAT_ACTION_C2S, RoomAgentsUpdateC2S, RoomHistoryUpdateC2S, UserEnterC2S, UserInviteC2S, UserLeaveC2S, UserRemoveC2S } from "@shared/types/ChatActionsClient"
import { BaseS2C, CHAT_ACTION_S2C, ChatUpdateS2C, ClientEnteredS2C, ClientLeaveS2C, RoomHistoryUpdateS2C, RoomNewS2C } from "@shared/types/ChatActionsServer"
import { UPDATE_TYPE } from "@shared/types/ChatMessage"
import { RoomDTO } from "@shared/types/RoomDTO"
import authSo from "../auth/repo"
import { buildRoomDetail } from "../room/factory"
import chatRepoSo from "./repo"
import { ChatDTO } from "@shared/types/ChatDTO"



const setup = {

	state: {
		/** è praticamente un proxy delle CHAT presenti sul server */
		all: <string[]>[],
		/** indica se è connesso al server WS */
		online: <boolean>false,
	},

	getters: {

		getChatById(id: string, store?: ChatWSStore): ChatDTO {
			if (!id || !store.state.all.includes(id)) return null
			return chatRepoSo.getById(id)
		},

	},

	actions: {

		//#region MESSAGE TO SERVER

		/**
		 * chiedo creazione di una CHAT
		 * response CHAT_INFO
		 */
		// create: async (
		// 	props: { chatId: string, agentIds: string[] },
		// 	store?: ChatWSStore
		// ) => {
		// 	const { chatId, agentIds } = props
		// 	const msgSend: ChatCreateC2S = {
		// 		chatId: chatId,
		// 		action: CHAT_ACTION_C2S.CHAT_CREATE_AND_ENTER,
		// 		agentIds,
		// 	}
		// 	wsConnection.send(JSON.stringify(msgSend))
		// },

		/** 
		 * entro in una CHAT e ricevo CHAT-INFO
		 * response CHAT_INFO
		 */
		enter: (chatId: string, store?: ChatWSStore) => {
			// se c'e' gia' la CHAT non faccio nulla
			if (!chatId || store.state.all.includes(chatId)) return
			// invio il messaggio di ENTER
			const msgSend: UserEnterC2S = {
				action: CHAT_ACTION_C2S.USER_ENTER,
				chatId,
			}
			wsConnection.send(JSON.stringify(msgSend))
			store.setAll([...store.state.all, chatId])
		},

		/** 
		* Notifico lascio una CHAT
		*/
		leave: async (chatId: string, store?: ChatWSStore) => {
			// se non sono in chat allora non faccio nulla
			if (!chatId || !store.state.all.includes(chatId)) return
			// invio il messaggio di LEAVE
			const message: UserLeaveC2S = {
				action: CHAT_ACTION_C2S.USER_LEAVE,
				chatId: chatId,
			}
			wsConnection.send(JSON.stringify(message))
			// elimino la CHAT dall'ONLINE
			store.setAll(store.state.all.filter(c => c != chatId))
		},

		/**
		 * Invito uno USER ad una CHAT
		 */
		inviteUser: async (props: { chatId: string, accountId: string }, store?: ChatWSStore) => {
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
		 * Rimuovo un USER da una CHAT
		 */
		removeUser: async (props: { chatId: string, userId: string }, store?: ChatWSStore) => {
			const { chatId, userId } = props
			if (!chatId || !userId) return
			const message: UserRemoveC2S = {
				action: CHAT_ACTION_C2S.USER_REMOVE,
				chatId,
				userId,
			}
			wsConnection.send(JSON.stringify(message))
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
			const room = chatRepoSo.getRoom({ chatId, roomId })
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
		removeView: async ({ chatId, viewId }: { chatId: string, viewId?: string }, store?: ChatWSStore) => {
			const allViews = docsSo.getAllCards()
			const views = utils.findAll(allViews, { type: DOC_TYPE.ROOM_DETAIL, chatId })
				.concat(utils.findAll(allViews, { type: DOC_TYPE.CHAT_DETAIL, chatId }))
			const activeRooms = views.filter((r: any) => r.state.uuid != viewId)
			if (activeRooms.length > 0) return
			store.leave(chatId)
		},

		/**
		 * HANDLE MESSAGE FROM SERVER
		 */
		onMessage: (data: any, store?: ChatWSStore) => {
			const message: BaseS2C = JSON.parse(data.payload)

			switch (message.action) {

				// arrivate le INFO di una CHAT le integro nella store
				// potrebbe trattarsi anche di un INVITE
				case CHAT_ACTION_S2C.CHAT_UPDATE: {
					const msg = message as ChatUpdateS2C
					const chatOld = chatRepoSo.getById(msg.chatId)
					if (!!chatOld) {
						deepMerge(chatOld, msg.chat)
						chatRepoSo.setAll([...chatRepoSo.state.all])
					} else {
						chatRepoSo.setAll([...chatRepoSo.state.all, msg.chat as ChatDTO])
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
					const chat = chatRepoSo.getById(msg.chatId)
					if (!chat) break
					chat.clients.push(msg.user)
					chatRepoSo.setAll([...chatRepoSo.state.all])
					break
				}

				case CHAT_ACTION_S2C.CLIENT_LEAVE: {
					const msg = message as ClientLeaveS2C
					const chat = chatRepoSo.getById(msg.chatId)
					if (!chat) break
					// sono io che esco dalla chat
					if (msg.userId == authSo.state.user.id) {
						// elimino dalle CHAT ONLINE
						store.setAll(store.state.all.filter(c => c != msg.chatId))
						// elimino le CARD
						const views = utils
							.findAll(docsSo.getAllCards(), { type: DOC_TYPE.ROOM_DETAIL, chatId: msg.chatId })
						views
							.forEach((view: ViewStore) => view.onRemoveFromDeck())
						break
					}
					// elimino degli user ONLINE
					chat.clients = chat.clients.filter(c => c.id != msg.userId)
					chatRepoSo.setAll([...chatRepoSo.state.all])
					break
				}

				// aggiorno la HISTORY di una ROOM
				case CHAT_ACTION_S2C.ROOM_HISTORY_UPDATE: {
					const msg: RoomHistoryUpdateS2C = message as RoomHistoryUpdateS2C
					const room = chatRepoSo.getRoom({ chatId: msg.chatId, roomId: msg.roomId })
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
		setAll: (all: string[]) => ({ all }),
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


export function getMainRoom(rooms: RoomDTO[]): RoomDTO {
	if (rooms == null) return null
	for (const room of rooms) {
		if (!room.parentRoomId) return room
	}
	return null
}