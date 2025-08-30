import { wsConnection } from "@/plugins/session"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { BaseS2C, CHAT_ACTION_C2S, CHAT_ACTION_S2C, MessageS2C, RoomNewS2C, UserCreateEnterC2S, UserEnteredS2C, UserLeaveC2S, UserLeaveS2C, UserMessageC2S } from "@/types/commons/RoomActions.js"
import { VIEW_SIZE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { EditorState } from "../../editorBase"
import { buildRoomDetail } from "../factory"
import { ChatRoom } from "@/types/commons/RoomActions"



const setup = {

	state: {

		chatId: <string>null,
		room: <Partial<ChatRoom>>null,

		prompt: `Don't answer directly, but use the tools available to you.
What is 2+2? Just write the answer number.`,

		/** indica che la dialog ROLE è aperto */
		roleDialogOpen: false,
		/** indica che la dialog TOOLS è aperto */
		toolsDialogOpen: false,
		/** indica che la dialog LLM è aperto */
		llmDialogOpen: false,

		//#region VIEWBASE
		width: 370,
		widthMax: 1000,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "ROOM",
		getSubTitle: (_: void, store?: ViewStore) => "room detail",
		//#endregion
	},

	actions: {

		//#region VIEWBASE

		/** chiamata quando la CARD è stata costruita (vedere la build) */
		onCreated: async (_: void, store?: ViewStore) => {
			const roomSo = store as RoomDetailStore
			// mi metto in scolto sui messaggi della stanza
			wsConnection.emitter.on("message", roomSo.onMessage)
			// se NON sono nella ROOT NON invio il messaggio di ENTER
			if ( !!roomSo.state.room?.parentRoomId ) return
			const message: UserCreateEnterC2S = {
				action: CHAT_ACTION_C2S.CREATE_ENTER,
				// se è nuova sara' null
				chatId: roomSo.state.chatId,
				// nel caso sia una nuova CHAT devo indicare l'agent
				agentId: roomSo.state.room?.agentId,
			}
			wsConnection.send(JSON.stringify(message))
		},

		onRemoval(_: void, store?: ViewStore) {
			const roomSo = store as RoomDetailStore
			wsConnection.emitter.off("message", roomSo.onMessage)
			// se sono nella ROOT invio il messaggio di LEAVE
			if ( !!roomSo.state.room?.parentRoomId ) return
			const message: UserLeaveC2S = {
				action: CHAT_ACTION_C2S.LEAVE,
				chatId: roomSo.state.chatId,
			}
			wsConnection.send(JSON.stringify(message))
		},

		//#endregion

		/** arriva un messaggio dal WS */
		onMessage: (data: any, store?: RoomDetailStore) => {
			const message: BaseS2C = JSON.parse(data.payload)
			if (!message 
				|| (message.action != CHAT_ACTION_S2C.ENTERED && message.chatId != store.state.chatId)
			) return

			switch (message.action) {

				case CHAT_ACTION_S2C.ENTERED: {
					const msg = message as UserEnteredS2C
					store.setChatId(msg.chatId)
					store.setRoom({
						...store.state.room,
						id: msg.roomId,
						history: [],
						//agentId: msg.agentId ?? store.state.room.agentId,
					})
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
					const msg = message as RoomNewS2C
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
		},
		
		/** invio un messaggio scritto dall'utente */
		sendPrompt: async (_: void, store?: RoomDetailStore) => {
			const prompt = store.state.prompt?.trim()
			if (!prompt || prompt.length == 0) return
			const message: UserMessageC2S = {
				action: CHAT_ACTION_C2S.USER_MESSAGE,
				chatId: store.state.chatId,
				roomId: store.state.room.id,
				text: prompt,
			}
			// cancella la text
			store.setPrompt("")
			// invio il messaggio al server
			wsConnection.send(JSON.stringify(message))
		},

	},

	mutators: {
		setChatId: (chatId: string) => ({ chatId }),
		setRoom: (room: Partial<ChatRoom>) => ({ room }),
		setPrompt: (prompt: string) => ({ prompt }),

		setRoleDialogOpen: (roleDialogOpen: boolean) => ({ roleDialogOpen }),
		setToolsDialogOpen: (toolsDialogOpen: boolean) => ({ toolsDialogOpen }),
		setLlmDialogOpen: (llmDialogOpen: boolean) => ({ llmDialogOpen }),
	},

}

export type RoomDetailState = typeof setup.state & ViewState & EditorState
export type RoomDetailGetters = typeof setup.getters
export type RoomDetailActions = typeof setup.actions
export type RoomDetailMutators = typeof setup.mutators
export interface RoomDetailStore extends ViewStore, RoomDetailGetters, RoomDetailActions, RoomDetailMutators {
	state: RoomDetailState
	onCreated: (_: void, store?: ViewStore) => Promise<void>;
}
const roomDetailSetup = mixStores(viewSetup, setup)
export default roomDetailSetup

