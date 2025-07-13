import { wsConnection } from "@/plugins/session"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { EDIT_STATE } from "@/types"
import { Room } from "@/types/Room"
import { AppendMessageS2C, BaseS2C, CHAT_ACTION_C2S, CHAT_ACTION_S2C, NewRoomS2C, UserEnterC2S, UserEnteredS2C, UserLeaveC2S, UserLeaveS2C, UserMessageC2S } from "@/types/RoomActions"
import { mixStores } from "@priolo/jon"
import { EditorState } from "../../editorBase"
import { ROOM_STATE } from "../types"



const setup = {

	state: {

		chatId: <string>null,
		room: <Partial<Room>>null,
		editState: EDIT_STATE.READ,
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
			// se NON è una ROOT-ROOM mando il segnale di entrare in CHAT
			if (!!roomSo.state.room?.parentRoomId) return
			// se è una ROOT-ROOM invio il messaggio di enter
			const message: UserEnterC2S = {
				action: CHAT_ACTION_C2S.ENTER,
				chatId: roomSo.state.chatId,
				agentId: roomSo.state.room?.agentId,
			}
			wsConnection.send(JSON.stringify(message))
		},

		onRemoval(_: void, store?: ViewStore) {
			const roomSo = store as RoomDetailStore
			wsConnection.emitter.off("message", roomSo.onMessage)
			// invio il messaggio di leave
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
			if (message.chatId != store.state.chatId) return

			switch (message?.action) {

				case CHAT_ACTION_S2C.ENTERED: {
					const msg = message as UserEnteredS2C
					store.setRoom({
						...store.state.room,
						id: msg.roomId,
						agentId: msg.agentId ?? store.state.room.agentId,
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

		setEditState: (editState: EDIT_STATE) => ({ editState }),

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

