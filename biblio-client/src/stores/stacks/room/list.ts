import roomApi from "@/api/room"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { Room } from "@/types/Room.js"
import { focusSo, loadBaseSetup, LoadBaseStore, MESSAGE_TYPE, VIEW_SIZE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { RoomDetailStore } from "./detail/detail.js"
import { buildRoomDetail, buildRoomDetailNew } from "./factory.js"



const setup = {

	state: {

		all: <Room[]>null,

		//#region VIEWBASE
		width: 370,
		widthMax: 1000,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "ROOMS",
		getSubTitle: (_: void, store?: ViewStore) => "Rooms list",
		//#endregion
	},

	actions: {

		//#region OVERRIDE VIEWBASE
		//#endregion

		//#region OVERRIDE LOADBASE

		async fetch(_: void, store?: LoadBaseStore) {
			const prompts = await roomApi.index({ store });
			(store as PromptListStore).setAll(prompts)
		},

		//#endregion

		async fetchIfVoid(_: void, store?: PromptListStore) {
			if (!!store.state.all) return
			await store.fetch()
		},

		/** apro/chiudo la CARD del dettaglio */
		select(promptId: string, store?: PromptListStore) {
			const detached = focusSo.state.shiftKey
			const oldId = (store.state.linked as RoomDetailStore)?.state?.room?.id
			const newId = (promptId && oldId !== promptId) ? promptId : null

			if (detached) {
				const view = buildRoomDetail({ room: { id: promptId }, size: VIEW_SIZE.NORMAL })
				store.state.group.add({ view, index: store.state.group.getIndexByView(store) + 1 })
			} else {
				const view = newId ? buildRoomDetail({ room: { id: promptId } }) : null
				//store.setSelect(newId)
				store.state.group.addLink({ view, parent: store, anim: !oldId || !newId })
			}
		},

		create(_: void, store?: PromptListStore) {
			const view = buildRoomDetailNew()
			store.state.group.addLink({ view, parent: store, anim: true })
		},

		async delete(promptId: string, store?: PromptListStore) {
			if (!await store.alertOpen({
				title: "PROMPT DELETION",
				body: "This action is irreversible.\nAre you sure you want to delete the CONSUMER?",
			})) return
			store.delete(promptId)
			store.state.group.addLink({ view: null, parent: store, anim: true })
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "DELETED",
				body: "it is gone forever",
			})
		},

	},

	mutators: {
		setAll: (all: Room[]) => ({ all }),
	},
}

export type PromptListState = typeof setup.state & ViewState
export type PromptListGetters = typeof setup.getters
export type PromptListActions = typeof setup.actions
export type PromptListMutators = typeof setup.mutators
export interface PromptListStore extends LoadBaseStore, ViewStore, PromptListGetters, PromptListActions, PromptListMutators {
	state: PromptListState
}
const promptListSetup = mixStores(viewSetup, loadBaseSetup, setup)
export default promptListSetup

