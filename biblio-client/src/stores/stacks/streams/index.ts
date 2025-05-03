import { ViewState, ViewStore, default as docSetup, default as viewSetup } from "@/stores/stacks/viewBase"
import { User } from "@/types/User"
import { mixStores, StoreCore } from "@priolo/jon"
import userApi from "../../../api/user"
import { buildUser } from "./utils/factory"
import { loadBaseSetup, LoadBaseState, LoadBaseStore } from "@priolo/jack"



/** USERS COLLECTION */
const setup = {

	state: {
		/** id selected user */
		select: <string>null,
		all: <User[]>null,
		textSearch: <string>null,

		//#region VIEWBASE
		width: 310,
		widthMax: 800,
		//#endregion
	},

	getters: {

		//#region VIEWBASE

		getTitle: (_: void, store?: ViewStore) => "USERS",
		getSubTitle: (_: void, store?: ViewStore) => "all users",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as UsersState
			return {
				...viewSetup.getters.getSerialization(null, store),
				select: state.select,
			}
		},

		//#endregion

		/** gli USERS filtrati e da visualizzare in lista */
		getFiltered(_: void, store?: UsersStore) {
			const text = store.state.textSearch?.toLocaleLowerCase()?.trim()
			if (!text || text.trim().length == 0 || !store.state.all) return store.state.all
			return store.state.all.filter(user =>
				user.name.toLowerCase().includes(text)
			)
		},

		getById: (id: string, store?: UsersStore) => store.state.all.find(user => user.id == id),
	},

	actions: {

		//#region OVERWRITE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as UsersState
			state.select = data.select
		},
		async fetch(_: void, store?: LoadBaseStore) {
			const s = <UsersStore>store
			const users = await userApi.index({ store, manageAbort: true })
			s.setAll(users)
			await loadBaseSetup.actions.fetch(_, store)
		},
		//#endregion

		async fetchIfVoid(_: void, store?: UsersStore) {
			if (!!store.state.all) return
			await store.fetch()
		},

		/** visualizzo dettaglio di un USER */
		select(id: string, store?: UsersStore) {
			const idOld = store.state.select
			const idNew = (id && idOld !== id) ? id : null
			const view = idNew
				? buildUser(store.getById(idNew))
				: null
			store.setSelect(idNew)
			store.state.group.addLink({ view, parent: store, anim: !idOld || !idNew })
		},
	},

	mutators: {
		setAll: (all: User[]) => ({ all }),
		setSelect: (select: string) => ({ select }),
		setTextSearch: (textSearch: string) => ({ textSearch }),
	},
}

export type UsersState = typeof setup.state & ViewState & LoadBaseState
export type UsersGetters = typeof setup.getters
export type UsersActions = typeof setup.actions
export type UsersMutators = typeof setup.mutators
export interface UsersStore extends ViewStore, LoadBaseStore, UsersGetters, UsersActions, UsersMutators {
	state: UsersState
}
const usersSetup = mixStores(docSetup, loadBaseSetup, setup)
export default usersSetup
