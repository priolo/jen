import roomApi from "@/api/room"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { EDIT_STATE } from "@/types"
import { Room } from "@/types/Room"
import { DragDoc, MESSAGE_TYPE } from "@priolo/jack"
import { LISTENER_CHANGE, mixStores } from "@priolo/jon"
import { createEditor } from "slate"
import { withHistory } from 'slate-history'
import { withReact } from "slate-react"
import { EditorState } from "../../editorBase"
import { NodeType, PROMPT_ROLES } from "./slate/types"
import { SugarEditor, withSugar } from "./slate/withSugar"
import { wsConnection } from "@/plugins/session"
import { AppendMessageS2C, ROOM_ACTION_C2S, ROOM_ACTION_S2C, UserEnterC2S, UserEnteredS2C, UserMessageC2S } from "@/types/WSMessages"
import { ROOM_STATE } from "../types"



const setup = {

	state: {

		room: <Partial<Room>>null,
		editState: EDIT_STATE.READ,
		roomState: ROOM_STATE.OFFLINE,

		prompt: "",

		/** SLATE editor */
		editor: <SugarEditor>null,

		/** testo iniziale */
		initValue: <NodeType[]>[
			{
				type: PROMPT_ROLES.SYSTEM,
				children: [
					{ text: "# primo2" },
					{ text: "\nsecondo **ciccio** 56" },
					{ text: "\nterzo *pippo*" },
				]
			},
			{
				type: PROMPT_ROLES.SYSTEM,
				children: [
					{ text: "# primo2\nsecondo **ciccio** 56\nterzo *pippo*" },
				]
			},
			{
				type: PROMPT_ROLES.SYSTEM,
				children: [
					{ text: "# primo2" },
					{ text: "\nsecondo **ciccio** 56" },
					{ text: "\nterzo *pippo*" },
				]
			}

		],

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

		onDrop: (data: DragDoc, store?: ViewStore) => {
			const editorSo = store as RoomDetailStore
			const editor = editorSo.state.editor
			if (!data.source?.view) return

			// se è uno spostamento al'interno dello stesso documento...
			if (data.source.view == data.destination?.view) {
				editor.moveNodes({ at: [data.source.index], to: [data.destination.index] })

				// si trata di uno spostamento da CARD esterna
			} else {
				// è un NODE di una CARD esterna
				if (data.source.index) {
					const sourceEditor = (<RoomDetailStore>data.source.view).state.editor
					if (!sourceEditor) return
					const [node] = sourceEditor.node([data.source.index])
					editor.insertNode(node, { at: [data.destination.index] })
					// è tutta la CARD
				} else {
					// cotruisco un NODE da una VIEW
					// const node = {
					// 	type: PROMPT_ROLES.CARD, // This was causing an error
					// 	data: data.source.view.getSerialization(),
					// 	subtitle: data.source.view.getSubTitle(),
					// 	children: [{ text: data.source.view.getTitle() }],
					// }
					// editor.insertNode(node, { at: [data.destination.index] })
				}
			}
		},

		/** chiamata dalla build dello stesso store */
		onCreated: async (_: void, store?: ViewStore) => {
			const roomSo = store as RoomDetailStore

			// creo l'editor SLATE
			const editor: SugarEditor = withSugar(withHistory(withReact(createEditor())))
			editor.store = roomSo
			//editor.children = editorSo.state.initValue ?? [{ type: PROMPT_TYPES.SYSTEM, children: [{ text: "" }] }] as NodeType[]
			roomSo.state.editor = editor

			// mi unisco alla stanza
			const message: UserEnterC2S = {
				action: ROOM_ACTION_C2S.ENTER,
				roomId: null,
			}
			const enteredMsgStr: string = await wsConnection.sendAndWait(
				JSON.stringify(message),
				(data: any) => {
					return JSON.parse(data).action == ROOM_ACTION_S2C.ENTERED
				},
				5000
			)
			const enteredMsg: UserEnteredS2C = JSON.parse(enteredMsgStr)
			roomSo.setRoomState(ROOM_STATE.ONLINE)
			roomSo.setRoom({ ...roomSo.state.room, id: enteredMsg.roomId })
		},

		onMessage: (data: any, store?: RoomDetailStore) => {
			const editor: SugarEditor = store.state.editor
			const message: AppendMessageS2C = JSON.parse(data.payload)

			if (message.action == ROOM_ACTION_S2C.APPEND_MESSAGE && message.roomId == store.state.room.id) {
				// aggiungo il messaggio all'editor
				const newNode: NodeType = {
					type: PROMPT_ROLES.USER,
					children: [{ text: message.text }],
				}
				const insertPosition = [editor.children.length];
				editor.insertNode(newNode, { at: insertPosition })
				editor.select(insertPosition);
			}
		},


		//#endregion

		async fetch(_: void, store?: RoomDetailStore) {
			if (!store.state.room?.id) return
			const prompt = await roomApi.get(store.state.room.id, { store, manageAbort: true })
			store.setRoom(prompt)
		},

		async fetchIfVoid(_: void, store?: RoomDetailStore) {
			if (!!store.state.room?.name) return
			await store.fetch()
		},

		async save(_: void, store?: RoomDetailStore) {
			let roomSaved: Room = null
			if (store.state.editState == EDIT_STATE.NEW) {
				roomSaved = await roomApi.create(store.state.room, { store })
			} else {
				roomSaved = await roomApi.update(store.state.room, { store })
			}
			store.setRoom(roomSaved)
			store.setEditState(EDIT_STATE.READ)
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "SAVED",
				body: "Prompt saved successfully",
			})
		},

		restore: (_: void, store?: RoomDetailStore) => {
			store.fetch()
			store.setEditState(EDIT_STATE.READ)
		},

		execute: async (_: void, store?: RoomDetailStore) => {
			// creo e invio il messaggio
			const message: UserMessageC2S = {
				action: ROOM_ACTION_C2S.USER_MESSAGE,
				roomId: store.state.room.id,
				text: store.state.prompt,
			}
			// cancella la text
			store.setPrompt("")
			// invio il messaggio al server
			wsConnection.send(JSON.stringify(message))
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

	onListenerChange: (store: RoomDetailStore, type: LISTENER_CHANGE) => {
		if (store._listeners.size == 1 && type == LISTENER_CHANGE.ADD) {
			wsConnection.emitter.on("message", store.onMessage)
		} else if (store._listeners.size == 0) {
			wsConnection.emitter.off("message", store.onMessage)
			//store["fetchAbort"]?.()
		}
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

