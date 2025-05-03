import { StoreCore, createStore } from "@priolo/jon"


const setup = {

	state: {
		token: <string>null,
		user: null,
	},

	getters: {
	},

	actions: {
		current: (_: void, store?: AuthStore) => {

			fetch('/api/auth/current', {
				method: 'GET',
				credentials: 'include', // Includi i cookie nella richiesta
			})
				.then(response => response.json())
				.then(data => store.setUser(data?.user))
				.catch(error => console.error('Error:', error));
		},
		createSession: (token: string, store?: AuthStore) => {
			// Invia il token al tuo server per la verifica e creazione della sessione
			fetch('/api/auth/google', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ token }),
			})
				.then(res => res.json())
				.then(data => {
					// Gestisci i dati dell'utente nel client
					console.log('User data:', data);
					authSo.setUser(data)
				})
				.catch(error => console.error('Error:', error));

		},
		logout: (_: void, store?: AuthStore) => {
			fetch('/auth/logout', {
				method: 'POST',
				credentials: 'include',
			})
				.then(() => store.setUser(null))
				.catch(error => console.error('Error:', error));
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
