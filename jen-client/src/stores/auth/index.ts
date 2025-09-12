import authApi from "@/api/auth";
import { User } from "@/types/User";
import { StoreCore, createStore } from "@priolo/jon";
import { buildLoginCard } from "../stacks/account/factory";
import { deckCardsSo } from "../docs/cards";



const setup = {

	state: {
		token: <string>null,
		user: <User>null,
	},

	getters: {
	},

	actions: {
		current: async (_: void, store?: AuthStore) => {

			let user: User = null
			try {
				user = (await authApi.current())?.user
			} catch (error) {
				console.error('Error fetching current user:', error);
			}
			store.setUser(user)
			if (!!user) return

			// se non c'e' USER apro la LOGIN CARD
			const view = buildLoginCard()
			deckCardsSo.add({ view, anim: true })
		},
		createSession: async (token: string, store?: AuthStore) => {
			let user: User = null
			try {
				user = (await authApi.loginGoogle(token))?.user
			} catch (error) {
				console.error('Error fetching current user:', error);
				return
			}
			console.log('User data:', user);
			authSo.setUser(user)
		},
		logout: async (_: void, store?: AuthStore) => {
			store.setUser(null)
			await authApi.logout()
		},
	},

	mutators: {
		setUser: (user) => ({ user }),
	},
}

export type AuthState = typeof setup.state
export type AuthGetters = typeof setup.getters
export type AuthActions = typeof setup.actions
export type AuthMutators = typeof setup.mutators
export interface AuthStore extends StoreCore<AuthState>, AuthGetters, AuthActions, AuthMutators {
	state: AuthState
}
const authSo = createStore(setup) as AuthStore
export default authSo
