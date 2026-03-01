import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { EDIT_STATE } from "@/types"
import { loadBaseSetup, LoadBaseStore, MESSAGE_TYPE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { ToolDTO } from "@shared/types/ToolDTO"
import { ToolDetailStore } from "./detail"
import { buildToolDetail, buildToolDetailNew, buildToolList } from "./factory"
import toolSo from "./repo"



const setup = {

	state: {
		//#region VIEWBASE
		width: 270,
		widthMax: 1000,
		//#endregion

		/** 
		 * TOOLS da visualizzare.
		 * se null, visualizzo toolSo.state.all (che contiene tutti i tool)
		 */
		tools: <ToolDTO[]>null,
		textSearch: "",
		/** callback chiamato quando seleziono un item */
		onSelected: <(view: ToolListStore, tool: ToolDTO) => void>null,
		onToolsChange: <(view: ToolListStore, tools: ToolDTO[]) => void>null,
		
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "TOOLS",
		getSubTitle: (_: void, store?: ViewStore) => "Tools list",
		//#endregion

		/** l'id dell'elemento selezionato. Sarebbe l'id della CARD DETTAGLI aperta */
		getSelected: (_: void, store?: ToolListStore): string => {
			return (store.state.linked as ToolDetailStore)?.state?.toolId
		},
		/** Se è aperto il dettaglio in NEW */
		isNewOpen: (_: void, store?: ToolListStore): boolean => {
			return (store.state.linked as ToolDetailStore)?.state?.editState == EDIT_STATE.NEW
		},
		isAddSelected: (_: void, store?: ToolListStore): boolean => {
			return !!(store.state.linked as ToolListStore)?.state?.onSelected
		},

		/** restituisce la lista dei tool da visualizzare, filtrata con textSearch */
		getList: (_: void, store?: ToolListStore): ToolDTO[] => {
			const textSearch = store.state.textSearch?.toLowerCase() ?? ""
			const all = store.state.tools ?? toolSo.state.all ?? []
			if ( !store.state.textSearch ) return all
			return all
				.filter(tool => tool.name.toLowerCase().includes(textSearch))
		},

		/**
		 * Se c'e' la lista dei TOOLS del proprio parent
		 * Servbe per vedere i "disabled" nella lista totale, per evitare di aggiungere doppioni
		 */
		getParentList: (_: void, store?: ToolListStore): ToolDTO[] => {
			return (<ToolListStore>store.state.parent)?.state.tools
		}
	},

	actions: {

		/** apro/chiudo la CARD del dettaglio */
		detail(toolId: string, store?: ToolListStore) {
			const oldId = (store.state.linked as ToolDetailStore)?.state?.tool?.id
			const newId = (toolId && oldId !== toolId) ? toolId : null
			const view = newId ? buildToolDetail({ toolId }) : null
			store.state.group.addLink({ view, parent: store, anim: !oldId || !newId })
		},

		create(_: void, store?: ToolListStore) {
			const view = buildToolDetailNew()
			store.state.group.addLink({ view, parent: store, anim: true })
		},

		async delete(_: void, store?: ToolListStore) {
			const toolId = store.getSelected()
			if (!toolId) return

			if (!await store.alertOpen({
				title: "CONSUMER DELETION",
				body: "This action is irreversible.\nAre you sure you want to delete the CONSUMER?",
			})) return

			toolSo.delete(toolId)
			store.state.group.addLink({ view: null, parent: store, anim: true })

			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "DELETED",
				body: "it is gone forever",
			})
		},




		remove(_: void, store?: ToolListStore) {
			const toolId = store.getSelected()
			if (!toolId) return
			store.state.onToolsChange(
				store,
				store.state.tools?.filter(t => t.id != toolId)
			)
		},

		/** eseguo il select sull'eventuale parent */
		select(_: void, store?: ToolListStore) {
			const selectedId = store.getSelected()
			if (!selectedId || !store.state.onSelected) return
			const tool = toolSo.state.all.find(t => t.id == selectedId)
			store.state.onSelected(store, tool)
			//store.onRemoveFromDeck()
		},

		add(_: void, store?: ToolListStore) {
			let view = null
			if (!store.isAddSelected()) {
				view = buildToolList({
					onSelected: (view, tool) => {
						store.state.onToolsChange(store, [...store.state.tools, tool])
					}
				})
			}
			store.state.group.addLink({ view, parent: store, anim: true })
		},

	},

	mutators: {
		setTextSearch: (textSearch: string) => ({ textSearch }),
		setTools: (tools: ToolDTO[]) => ({ tools }),
	},
}

export type ToolListState = typeof setup.state & ViewState
export type ToolListGetters = typeof setup.getters
export type ToolListActions = typeof setup.actions
export type ToolListMutators = typeof setup.mutators
export interface ToolListStore extends LoadBaseStore, ViewStore, ToolListGetters, ToolListActions, ToolListMutators {
	state: ToolListState
}
const toolListSetup = mixStores(viewSetup, loadBaseSetup, setup)
export default toolListSetup

