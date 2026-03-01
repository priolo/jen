import toolApi from "@/api/tool"
import viewSetup, { ViewMutators, ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { EDIT_STATE } from "@/types"
import { MESSAGE_TYPE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { ToolDTO } from "@shared/types/ToolDTO"
import toolSo from "./repo"



const setup = {

	state: {

		toolId: <string>null,
		tool: <Partial<ToolDTO>>null,
		editState: EDIT_STATE.READ,

		//#region VIEWBASE
		width: 200,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "TOOL DETAIL",
		getSubTitle: (_: void, store?: ViewStore) => "tool detail",
		//#endregion

		// getParentList: (_: void, store?: ToolDetailStore) => utils.findInRoot(store.state.group.state.all,
		// 	{ type: DOC_TYPE.TOOL_DETAIL }
		// ) as ToolListStore,

	},

	actions: {

		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as ToolDetailState
			state.toolId = data.toolId
		},
		//#endregion

		fetch: async (_: void, store?: ToolDetailStore) => {
			if (!store.state.toolId || store.state.editState == EDIT_STATE.NEW) return
			const tool = (await toolApi.get(store.state.toolId, { store, manageAbort: true }))?.tool
			store.setTool(tool)
			//await loadBaseSetup.actions.fetch(_, store)
		},
		async fetchIfVoid(_: void, store?: ToolDetailStore) {
			if (!!store.state.tool) return
			await store.fetch()
		},

		async save(_: void, store?: ToolDetailStore) {
			const toolSaved = await toolSo.save(store.state.tool)
			store.state.toolId = toolSaved.id
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
		setTool: (tool: Partial<ToolDTO>) => ({ tool }),
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
