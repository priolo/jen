import userApi from "@/api/user"
import { findInRoot } from "@/stores/docs/utils/manage"
import { MESSAGE_TYPE } from "@/stores/log/utils"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { StoreCore, mixStores } from "@priolo/jon"
import { UsersState, UsersStore } from "."
import { User } from "../../../types/User"
import { loadBaseSetup, LoadBaseState, LoadBaseStore, VIEW_SIZE } from "@priolo/jack"
import docApi from "../../../api/doc"



/** USERS DETAIL */
const setup = {

	state: {
		/** USER of CARD */
		user: <User>null,

		editState: EDIT_STATE.READ,

		//#region VIEWBASE
		width: 230,
		//#endregion
	},

	getters: {

		//#region VIEWBASE

		getTitle: (_: void, store?: ViewStore) => "USER",
		getSubTitle: (_: void, store?: ViewStore) => "a user",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as UserState
			return {
				...viewSetup.getters.getSerialization(null, store),
				// [II] non va bene... usare solo l'id
				user: state.user,
			}
		},
		//#endregion

		// [II] TODO
		getParentList: (_: void, store?: UserStore): UsersStore => findInRoot(store.state.group.state.all, {
			type: DOC_TYPE.USERS,
		} as Partial<UsersState>) as UsersStore,

	},

	actions: {

		//#region OVERWRITE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as UserState
			state.user = data.user
			state.editState = data.editState
		},

		async fetch(_: void, store?: LoadBaseStore) {

			const docs = docApi.index()
			console.log(docs)

			// const s = <UserStore>store
			// const id = s.state.user.id
			// const user = await userApi.get( id, { store, manageAbort: true })
			// s.setUser(user)
			// await loadBaseSetup.actions.fetch(_, store)
		},
		//#endregion

		/** load all ENTITY */
		async fetchIfVoid(_: void, store?: UserStore) {

			// eventualmente aggiorno i dati
			if (store.state.editState != EDIT_STATE.NEW && !store.state.user) {
				await store.fetch()
			}
			
			// riprstino link precedente
			// // qua e non su "onLinked" per essere sicuro di avere i dati
			// if (!store.state.linked) {
			// 	const options = docSo.state.cardOptions[store.state.type]
			// 	store.state.docAniDisabled = true
			// 	if (options == DOC_TYPE.CONSUMERS) {
			// 		store.openConsumers()
			// 	} else if (options == DOC_TYPE.STREAM_MESSAGES) {
			// 		store.openMessages()
			// 	}
			// 	store.state.docAniDisabled = false
			// }
		},
		/** save USER*/
		async save(_: void, store?: UserStore) {
			let userSaved: User = null
			if (store.state.editState == EDIT_STATE.NEW) {
				userSaved = await userApi.create(store.state.user, { store })
			} else {
				userSaved = await userApi.update(store.state.user, { store })
			}
			store.setUser(userSaved)
			// store.getParentList()?.update(userSaved)
			// store.getParentList()?.setSelect(userSaved.config.name)
			store.setEditState(EDIT_STATE.READ)
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "SAVED",
				body: "you can find it in the STREAMS list",
			})
		},
		/** reset ENTITY */
		restore: (_: void, store?: UserStore) => {
			store.fetch()
			store.setEditState(EDIT_STATE.READ)
		},

	},

	mutators: {
		setUser: (stream: User) => ({ stream }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
	},
}

export type UserState = typeof setup.state & ViewState & LoadBaseState
export type UserGetters = typeof setup.getters
export type UserActions = typeof setup.actions
export type UserMutators = typeof setup.mutators
export interface UserStore extends ViewStore, LoadBaseStore, UserGetters, UserActions, UserMutators {
	state: UserState
}
const userSetup = mixStores(viewSetup, loadBaseSetup, setup)
export default userSetup
