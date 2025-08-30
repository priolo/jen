import { AgentLlm } from "@/types/Agent"
import { createStore, StoreCore } from "@priolo/jon"
import { randomUUID } from "crypto"
import { User } from "./types"



const setup = {

	state: {
		current: <User>{
			id: randomUUID(),
			name: "Ivano Iorio",
		},
	},

	getters: {

	},

	actions: {
	},

	mutators: {
		setCurrent: (current: AgentLlm[]) => ({ current }),
	},
}

export type UserState = typeof setup.state
export type UserGetters = typeof setup.getters
export type UserActions = typeof setup.actions
export type UserMutators = typeof setup.mutators
export interface UserStore extends StoreCore<UserState>, UserGetters, UserActions, UserMutators {
	state: UserState
}

const userSo = createStore<UserState>(setup)
export default userSo as UserStore
