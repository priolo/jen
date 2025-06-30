import { wsConnection } from "@/plugins/session"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { EDIT_STATE } from "@/types"
import { Room } from "@/types/Room"
import { AppendMessageS2C, BaseS2C, CompleteC2S, ROOM_ACTION_C2S, ROOM_ACTION_S2C, UserEnterC2S, UserEnteredS2C, UserLeaveC2S, UserMessageC2S } from "@/types/RoomActions"
import { MESSAGE_TYPE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { EditorState } from "../../editorBase"
import { ROOM_STATE } from "../types"



const setup = {

	state: {

		room: <Partial<Room>>null,
		editState: EDIT_STATE.READ,
		roomState: ROOM_STATE.OFFLINE,

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
			// entro in una stanza nuova
			roomSo.sendEnter()
		},

		onRemoval(_: void, store?: ViewStore) {
			const roomSo = store as RoomDetailStore
			wsConnection.emitter.off("message", roomSo.onMessage)
			// invio il messaggio di leave
			roomSo.sendLeave()
		},

		//#endregion

		sendEnter: async (roomId?: string, store?: RoomDetailStore) => {
			const message: UserEnterC2S = {
				action: ROOM_ACTION_C2S.ENTER,
				roomId,
			}
			wsConnection.send(JSON.stringify(message))
		},
		
		sendLeave: async (_: void, store?: RoomDetailStore) => {
			const message: UserLeaveC2S = {
				action: ROOM_ACTION_C2S.LEAVE,
				roomId: store.state.room.id,
			}
			wsConnection.send(JSON.stringify(message))
		},

		sendPrompt: async (_: void, store?: RoomDetailStore) => {
			const prompt = store.state.prompt?.trim()
			if ( !prompt || prompt.length == 0) return
			const message: UserMessageC2S = {
				action: ROOM_ACTION_C2S.USER_MESSAGE,
				roomId: store.state.room.id,
				text: prompt,
				complete: true,
			}
			// cancella la text
			store.setPrompt("")
			// invio il messaggio al server
			wsConnection.send(JSON.stringify(message))
		},

		sendComplete: async (_: void, store?: RoomDetailStore) => {
			const message: CompleteC2S = {
				action: ROOM_ACTION_C2S.COMPLETE,
				roomId: store.state.room.id,
			}
			wsConnection.send(JSON.stringify(message))
		},

		onMessage: (data: any, store?: RoomDetailStore) => {
			const message: BaseS2C = JSON.parse(data.payload)

			switch (message?.action) {

				case ROOM_ACTION_S2C.ENTERED: {
					const enteredMsg: UserEnteredS2C = message as UserEnteredS2C
					store.setRoom({ ...store.state.room, id: enteredMsg.roomId })
					store.setRoomState(ROOM_STATE.ONLINE)
					break
				}

				case ROOM_ACTION_S2C.APPEND_MESSAGE: {
					if ( message.roomId != store.state.room?.id) return

					const appendMsg: AppendMessageS2C = message as AppendMessageS2C
					if ( !store.state.room.history ) store.state.room.history = []
					store.state.room.history.push({
						role: "user",
						text: appendMsg.text,
					})
					store.setRoom({ ...store.state.room })
					break
				}
				
			}
		},

	},

	mutators: {
		setRoom: (room: Partial<Room>) => ({ room }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
		setRoleDialogOpen: (roleDialogOpen: boolean) => ({ roleDialogOpen }),
		setToolsDialogOpen: (toolsDialogOpen: boolean) => ({ toolsDialogOpen }),
		setLlmDialogOpen: (llmDialogOpen: boolean) => ({ llmDialogOpen }),

		setPrompt: (prompt: string) => ({ prompt }),
		setRoomState: (roomState: ROOM_STATE) => ({ roomState }),
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

