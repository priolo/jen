import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { mixStores } from "@priolo/jon"
import chatSo from "../../chat/repo"
import { EditorState } from "../../editorBase"



const setup = {

	state: {

		// Id della CHAT. Settato in creazione
		chatId: <string>null,
		// Id della ROOM. Settato in creazione
		roomId: <string>null,

		// prompt della textbox in basso
		prompt: `Don't answer directly, but use the tools available to you.
What is 2+2? Just write the answer number.`,

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
		// onCreated: async (_: void, store?: ViewStore) => {
		// },

		// onRemoval(_: void, store?: ViewStore) {
		// 	const roomSo = store as RoomDetailStore
		// 	chatSo.removeChat(roomSo.state.chatId)
		// },

		//#endregion

		/** invio un messaggio scritto dall'utente */
		sendPrompt: async (_: void, store?: RoomDetailStore) => {
			chatSo.addMessageToRoom({ 
				chatId: store.state.chatId, 
				roomId: store.state.roomId, 
				text: store.state.prompt 
			})
			// cancella la text
			store.setPrompt("")
		},

	},

	mutators: {
		setPrompt: (prompt: string) => ({ prompt }),
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

