import authApi from "@/api/auth";
import authEmailApi from "@/api/authEmail";
import { wsConnection } from "@/plugins/session/wsConnection";
import { AccountDTO } from "@/types/account";
import { StoreCore, createStore } from "@priolo/jon";



/**
 * Contiene le info dell'utente loggato
 * e gestisce il login/logout
 */
const setup = {

	state: {
		token: <string>null,
		/** USER correntemente loggato */
		user: <AccountDTO>null,
		userInEdit: <Partial<AccountDTO>>null,
	},

	getters: {
	},

	actions: {
		// createSession: async (token: string, store?: AuthStore) => {
		// 	let user: Account = null
		// 	try {
		// 		user = (await authApi.loginGoogle(token))?.user
		// 	} catch (error) {
		// 		console.error('Error fetching current user:', error);
		// 		return
		// 	}
		// 	console.log('User data:', user);
		// 	authSo.setUser(user)
		// },




		/**
		 * Chiamato allo startup dell'app
		 */
		current: async (_: void, store?: AuthStore) => {
			if (!!store.state.user) return
			let user: AccountDTO = (await authApi.current({ noError: true }))?.user
			store.login(user)
		},

		/**
		 * Aggiorna le info dell'account dell'utente loggato
		 */
		update: async (_: void, store?: AuthStore) => {
			if (!store.state.userInEdit?.name) return
			const newAccount: Partial<AccountDTO> = {
				name: store.state.userInEdit?.name,
				language: store.state.userInEdit?.language ?? undefined,
				notificationsEnabled: store.state.userInEdit?.notificationsEnabled ?? undefined,
				//preferredCurrency: store.state.userInEdit?.preferredCurrency ?? undefined,
			}
			const updateAccount = (await authApi.update(newAccount))?.account
			store.setUser({
				...store.state.user,
				...newAccount,
			})
		},

		/**
		 * effettua il logout dell'utente corrente
		 */
		logout: async (_: void, store?: AuthStore) => {
			store.login(null)
			await authApi.logout()
		},

		/** 
		 * chiamato quando c'e' un cambio di account 
		 */
		login: async (user: AccountDTO, store?: AuthStore) => {
			store.setUser(user)
			//if (user?.language) i18n.changeLanguage(user.language)
			if ( !user ) {
				wsConnection.disconnect()
			} else {
				wsConnection.connect()
			}
		},



		/**
		 * Invia il codice di verifica all'email specificata
		 */
		emailSendCode: async (email: string, store?: AuthStore) => {
			await authEmailApi.emailSendCode(email)
		},
		/**
		 * Verifica il codice di verifica ricevuto via email
		 */
		emailVerifyCode: async (code: string, store?: AuthStore) => {
			const user = (await authEmailApi.emailVerify(code))?.user
			store.login(user)
		},



		loginWithGithub: async (_: void, store?: AuthStore) => {
			const res = await authApi.githubLoginUrl()
			window.location.href = `${res.url}&prompt=select_account`
		},
		attachGithub: async (_: void, store?: AuthStore) => {
			const res = await authApi.githubAttachUrl()
			window.location.href = `${res.url}&prompt=select_account`
		},
		detachGithub: async (_: void, store?: AuthStore) => {
			const res = await authApi.githubDetach()
			store.setUser({
				...store.state.user,
				githubId: null,
			})
		},



		loginWithGoogle: async (token: string, store?: AuthStore) => {
			let user: AccountDTO = null
			try {
				user = (await authApi.loginGoogle(token))?.user
			} catch (error) {
				console.error('Error fetching current user:', error);
				return
			}
			authSo.login(user)
		},
		/** 
		 * attacca un account GOOGLE all'ACCOUNT attualmente loggato 
		 */
		attachGoogle: async (token: string, store?: AuthStore) => {
			const res = await authApi.googleAttach(token)
			const user = res.user as AccountDTO
			store.login(<AccountDTO>{
				...store.state.user,
				googleEmail: user.googleEmail,
			})
		},
		detachGoogle: async (_: void, store?: AuthStore) => {
			const res = await authApi.googleDetach()
			store.setUser({
				...store.state.user,
				googleEmail: null,
			})
		},
	},

	mutators: {
		setUser: (user: AccountDTO) => {
			//if (user?.language) i18n.changeLanguage(user.language)
			return { user }
		},
		setUserInEdit: (userInEdit: Partial<AccountDTO>) => ({ userInEdit }),
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
