import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { focusSo, MESSAGE_TYPE, VIEW_SIZE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { LlmDetailStore } from "./detail"
import { buildLlmDetail, buildLlmDetailNew } from "./factory"
import llmSo from "./repo"
import { EDIT_STATE } from "@/types"
import { AgentDetailStore } from "../agent/detail"
import { LlmDTO } from "@shared/types/LlmDTO"



const setup = {

	state: {
		//#region VIEWBASE
		width: 270,
		widthMax: 1000,
		//#endregion

		//items: <LlmDTO[]>null,
		textSearch: "",
		/** callback chiamato quando seleziono un item */
		onSelected: <(view: LlmListStore, item: LlmDTO) => void>null,

	},

	getters: {

		//#region VIEWBASE

		getTitle: (_: void, store?: ViewStore) => "LLM",
		getSubTitle: (_: void, store?: ViewStore) => "llm list",

		//#endregion

		/** restituisce l'id del dettaglio selezionato nella lista */
		getSelected: (_: void, store?: LlmListStore): string => {
			return (store.state.linked as LlmDetailStore)?.state?.llmId
		},
		/** se c'e' una CARD per il dettaglio new */
		isNewOpen: (_: void, store?: LlmListStore): boolean => {
			return (store.state.linked as LlmDetailStore)?.state?.editState == EDIT_STATE.NEW
		},
		/** se c'e' un parent che richiede eventi */
		isSelectable: (_: void, store?: LlmListStore): boolean => {
			return !!(<AgentDetailStore>store.state.parent)?.onSelect
		},
		/** restituisce la lista dei tool da visualizzare, filtrata con textSearch */
		getList: (_: void, store?: LlmListStore): LlmDTO[] => {
			const textSearch = store.state.textSearch?.toLowerCase() ?? ""
			const all = llmSo.state.all ?? []
			if ( !store.state.textSearch ) return all
			return all
				.filter(llm => llm.code.toLowerCase().includes(textSearch))
		},

	},

	actions: {

		/** apro/chiudo la CARD del dettaglio */
		detail(llmId: string, store?: LlmListStore) {
			const oldId = (store.state.linked as LlmDetailStore)?.state?.llm?.id
			const newId = (llmId && oldId !== llmId) ? llmId : null
			const view = newId ? buildLlmDetail({ llmId }) : null
			store.state.group.addLink({ view, parent: store, anim: !oldId || !newId })
		},

		/** apro il dettaglio in modalità "crea nuovo" */
		create(_: void, store?: LlmListStore) {
			const view = buildLlmDetailNew()
			store.state.group.addLink({ view, parent: store, anim: true })
		},

		/** elimino l'elemento selezionato (se c'e') */
		async delete(_: void, store?: LlmListStore) {
			const llmId = store.getSelected()
			if (!llmId) return

			if (!await store.alertOpen({
				title: "CONSUMER DELETION",
				body: "This action is irreversible.\nAre you sure you want to delete the CONSUMER?",
			})) return

			await llmSo.delete(llmId)
			store.state.group.addLink({ view: null, parent: store, anim: true })

			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "DELETED",
				body: "it is gone forever",
			})
		},

		/** eseguo il select sull'eventuale parent */
		select(_: void, store?: LlmListStore) {
			const selectedId = store.getSelected()
			if (!selectedId || !store.state.onSelected) return
			const llm = llmSo.state.all.find(t => t.id == selectedId)
			store.state.onSelected(store, llm)
			store.onRemoveFromDeck()
		},

	},

	mutators: {
		setTextSearch: (textSearch: string) => ({ textSearch }),
		//setItems: (items: LlmDTO[]) => ({ items }),
	},
}

export type LlmListState = typeof setup.state & ViewState
export type LlmListGetters = typeof setup.getters
export type LlmListActions = typeof setup.actions
export type LlmListMutators = typeof setup.mutators
export interface LlmListStore extends ViewStore, LlmListGetters, LlmListActions, LlmListMutators {
	state: LlmListState
}
const llmListSetup = mixStores(viewSetup, setup)
export default llmListSetup

