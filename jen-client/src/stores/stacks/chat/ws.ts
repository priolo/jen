import chatApi from "@/api/chat"
import { wsConnection } from "@/plugins/session/wsConnection"
import { SS_EVENT } from "@/plugins/SocketService/types"
import { DOC_TYPE } from "@/types"
import { deepMerge } from "@/utils/object"
import { docsSo, utils, ViewStore } from "@priolo/jack"
import { createStore, StoreCore } from "@priolo/jon"
import { CHAT_ACTION_C2S, ChatUpdateC2S, RoomAgentsUpdateC2S, RoomHistoryUpdateC2S, UserEnterC2S, UserLeaveC2S } from "@shared/types/ChatActionsClient"
import { BaseS2C, CHAT_ACTION_S2C, ChatUpdateS2C2, ClientEnteredS2C, ClientLeaveS2C, RoomHistoryUpdateS2C, RoomNewS2C } from "@shared/types/ChatActionsServer"
import { UPDATE_TYPE } from "@shared/types/ChatMessage"
import { RoomDTO } from "@shared/types/RoomDTO"
import { applyJsonCommand, JsonCommand } from "@shared/update"
import authSo from "../auth/repo"
import { buildRoomDetail } from "../room/factory"
import chatRepoSo from "./repo"



const setup = {

	state: {
		/** la lista delle CHAT-ID che ho aperto sul FE */
		all: <string[]>[],
		/** indica se è connesso al server WS */
		online: <boolean>false,
	},

	getters: {

		isOnline(id: string, store?: ChatWSStore): boolean {
			if (!id) return false
			return store.state.all.includes(id)
		},

	},

	actions: {

		//#region MESSAGE TO SERVER

		/** 
		 * entro in una CHAT 
		 */
		async enter(chatId: string, store?: ChatWSStore) {
			// se c'e' gia' la CHAT non faccio nulla
			if (!chatId || store.state.all.includes(chatId)) return

			// invio il messaggio di ENTER
			const msgSend: UserEnterC2S = {
				action: CHAT_ACTION_C2S.USER_ENTER,
				chatId,
			}
			wsConnection.send(JSON.stringify(msgSend))
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
		},

		/**
		 * Invito uno USER ad una CHAT
		 */
		// inviteUser: async (props: { chatId: string, accountId: string }, store?: ChatWSStore) => {
		// 	const { chatId, accountId } = props
		// 	if (!chatId || !accountId) return
		// 	const message: UserInviteC2S = {
		// 		action: CHAT_ACTION_C2S.USER_INVITE,
		// 		chatId,
		// 		userId: accountId,
		// 	}
		// 	wsConnection.send(JSON.stringify(message))
		// },

		/**
		 * Rimuovo un USER da una CHAT
		 */
		// removeUser: async (props: { chatId: string, userId: string }, store?: ChatWSStore) => {
		// 	const { chatId, userId } = props
		// 	if (!chatId || !userId) return
		// 	const message: UserRemoveC2S = {
		// 		action: CHAT_ACTION_C2S.USER_REMOVE,
		// 		chatId,
		// 		userId,
		// 	}
		// 	wsConnection.send(JSON.stringify(message))
		// },


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

		updateChat: (props: { chatId: string, commands: JsonCommand[] }, store?: ChatWSStore) => {
			const { chatId, commands } = props
			const message: ChatUpdateC2S = {
				action: CHAT_ACTION_C2S.CHAT_UPDATE,
				chatId: chatId,
				commands: commands,
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
				// case CHAT_ACTION_S2C.CHAT_UPDATE: {
				// 	const msg = message as ChatUpdateS2C
				// 	const chatOld = chatRepoSo.getById(msg.chatId)
				// 	if (!!chatOld) {
				// 		deepMerge(chatOld, msg.chat)
				// 		chatRepoSo.setAll([...chatRepoSo.state.all])
				// 	} else {
				// 		chatRepoSo.setAll([...chatRepoSo.state.all, msg.chat as ChatDTO])
				// 	}

				// 	break
				// }


				// agghiorno la CHAT
				case CHAT_ACTION_S2C.CHAT_UPDATE2: {
					const msg = message as ChatUpdateS2C2
					const chat = chatRepoSo.getById(msg.chatId)
					if (!chat) break
					for (const command of msg.commands) {
						applyJsonCommand(chat, command)
					}
					chatRepoSo.setAll([...chatRepoSo.state.all])
					break
				}

				case CHAT_ACTION_S2C.CLIENT_ENTERED: {
					const msg = message as ClientEnteredS2C
					const chat = chatRepoSo.getById(msg.chatId)
					if (!chat) break
					// aggiungo agli user ONLINE
					chat.onlineUserIds = [...(chat.onlineUserIds ?? []), msg.user.id]
					chatRepoSo.setAll([...chatRepoSo.state.all])

					if ( msg.user.id == authSo.state.user.id) {
						ChatInline(msg.chatId)
					}
					
					break
				}

				case CHAT_ACTION_S2C.CLIENT_LEAVE: {
					const msg = message as ClientLeaveS2C
					const chat = chatRepoSo.getById(msg.chatId)
					if (!chat) break
					// elimino degli user ONLINE
					chat.onlineUserIds = chat.onlineUserIds?.filter(id => id != msg.userId)
					chatRepoSo.setAll([...chatRepoSo.state.all])

					// sono io che esco dalla chat
					if (msg.userId == authSo.state.user.id) {
						ChatOffline(msg.chatId)
					}

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
					const chat = chatRepoSo.getById(msg.chatId)
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


async function ChatInline(chatId: string) {
	// carico i dati della CHAT
	const chat = await chatApi.get(chatId)//, { store: chatWSSo, manageAbort: true })

	// inserisco la CHAT nelle CHAT ONLINE
	chatWSSo.setAll([...chatWSSo.state.all, chatId])

	// agiorno le CHATS-PROXY
	const chatOld = chatRepoSo.getById(chatId)
	if (!!chatOld) {
		deepMerge(chatOld, chat)
		chatRepoSo.setAll([...chatRepoSo.state.all])
	} else {
		chatRepoSo.setAll([...chatRepoSo.state.all, chat])
	}
}

async function ChatOffline(chatId: string) {
	// elimino dalle CHAT ONLINE
	chatWSSo.setAll(chatWSSo.state.all.filter(c => c != chatId))

	const chat = chatRepoSo.getById(chatId)
	if ( !chat) return
	// eimino i dati non necessari nella CHAT-PROXY
	chat.onlineUserIds = null
	chat.rooms = null
	chatRepoSo.setAll([...chatRepoSo.state.all])

	// elimino le CARD
	const views = utils
		.findAll(docsSo.getAllCards(), { type: DOC_TYPE.ROOM_DETAIL, chatId })
	views
		.forEach((view: ViewStore) => view.onRemoveFromDeck())
}