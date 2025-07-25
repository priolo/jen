import { wsConnection } from "@/plugins/session"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { Room } from "@/types/Room"
import { AppendMessageS2C, BaseS2C, CHAT_ACTION_C2S, CHAT_ACTION_S2C, NewRoomS2C, UserEnterC2S, UserEnteredS2C, UserLeaveC2S, UserLeaveS2C, UserMessageC2S } from "@/types/RoomActions"
import { mixStores } from "@priolo/jon"
import { EditorState } from "../../editorBase"
import { ROOM_STATE } from "../types"
import { buildRoomDetail } from "../factory"
import { VIEW_SIZE } from "@priolo/jack"
import mockHistory1 from "./mockHistory1"



const setup = {

	state: {

		chatId: <string>null,
		room: <Partial<Room>>null,
		chatState: ROOM_STATE.OFFLINE,

		prompt: "",

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
			// se sono nella ROOT invio il messaggio di ENTER
			if ( !!roomSo.state.room?.parentRoomId ) return
			const message: UserEnterC2S = {
				action: CHAT_ACTION_C2S.ENTER,
				// se è nuova sara' null
				chatId: roomSo.state.chatId,
				// se è nuova sara' null
				roomId: roomSo.state.room?.id,
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

		sendPrompt: async (_: void, store?: RoomDetailStore) => {
			const prompt = store.state.prompt?.trim()
			if (!prompt || prompt.length == 0) return
			const message: UserMessageC2S = {
				action: CHAT_ACTION_C2S.USER_MESSAGE,
				chatId: store.state.chatId,
				text: prompt,
				complete: true,
			}
			// cancella la text
			store.setPrompt("")
			// invio il messaggio al server
			wsConnection.send(JSON.stringify(message))
		},

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
						//history: mockHistory1,
						history: [],
						//agentId: msg.agentId ?? store.state.room.agentId,
					})
					store.setChatState(ROOM_STATE.ONLINE)
					break
				}

				case CHAT_ACTION_S2C.LEAVE: {
					const msg = message as UserLeaveS2C
					// ???
					break
				}

				case CHAT_ACTION_S2C.APPEND_MESSAGE: {
					const msg: AppendMessageS2C = message as AppendMessageS2C
					if (store.state.room?.id != msg.roomId) return
					if (!store.state.room.history) store.state.room.history = []
					store.state.room.history.push(...msg.content)
					store.setRoom({ ...store.state.room })
					break
				}

				case CHAT_ACTION_S2C.NEW_ROOM: {
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
		},

	},

	mutators: {
		setChatId: (chatId: string) => ({ chatId }),
		setChatState: (chatState: ROOM_STATE) => ({ chatState }),
		setRoom: (room: Partial<Room>) => ({ room }),
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

