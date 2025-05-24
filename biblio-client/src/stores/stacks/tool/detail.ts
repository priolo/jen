import toolApi from "@/api/tool"
import viewSetup, { ViewMutators, ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { Tool } from "@/types/Tool"
import { MESSAGE_TYPE, utils } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { ToolListStore } from "./list"
import toolSo from "./repo"




const setup = {

	state: {

		/** tool visualizzato */
		tool: <Partial<Tool>>null,

		editState: EDIT_STATE.READ,

		//#region VIEWBASE
		width: 200,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "TOOL DETAIL",
		//#endregion

		getParentList: (_: void, store?: ToolDetailStore) => utils.findInRoot(store.state.group.state.all,
			{ type: DOC_TYPE.TOOL_DETAIL }
		) as ToolListStore,

	},

	actions: {

		//#region VIEWBASE
		//#endregion

		fetch: async (_: void, store?: ToolDetailStore) => {
			if (!store.state.tool?.id) return
			const tool = await toolApi.get(store.state.tool.id, { store, manageAbort: true })
			store.setTool(tool)
			//await loadBaseSetup.actions.fetch(_, store)
		},

		async fetchIfVoid(_: void, store?: ToolDetailStore) {
			if (!!store.state.tool.name) return
			await store.fetch()
		},

		/** crea un nuovo CONSUMER-INFO tramite CONSUMER-CONFIG */
		async save(_: void, store?: ToolDetailStore) {
			const toolSaved = await toolSo.save(store.state.tool)

			store.setTool(toolSaved)
			store.setEditState(EDIT_STATE.READ)
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "SAVED",
				body: "you can find it in the tools list",
			})
		},

		/** reset ENTITY */
		restore: (_: void, store?: ToolDetailStore) => {
			store.fetch()
			store.setEditState(EDIT_STATE.READ)
		},

	},

	mutators: {
		setTool: (tool: Partial<Tool>) => ({ tool }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
	},
}

export type ToolDetailState = typeof setup.state & ViewState
export type ToolDetailGetters = typeof setup.getters
export type ToolDetailActions = typeof setup.actions
export type ToolDetailMutators = typeof setup.mutators & ViewMutators
export interface ToolDetailStore extends ViewStore, ToolDetailGetters, ToolDetailActions, ToolDetailMutators {
	state: ToolDetailState
}
const toolDetailSetup = mixStores(viewSetup, setup) as typeof setup
export default toolDetailSetup
