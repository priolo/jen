import { AgentLlm } from "@/types/Agent"
import { createStore, StoreCore } from "@priolo/jon"
import { Chat } from "./types"



const setup = {

	state: {
		all: <Chat[]>null,
	},

	getters: {
		
	},

	actions: {

	},

	mutators: {
		setAll: (all: AgentLlm[]) => ({ all }),
	},
}

export type ChatState = typeof setup.state
export type ChatGetters = typeof setup.getters
export type ChatActions = typeof setup.actions
export type ChatMutators = typeof setup.mutators
export interface ChatStore extends StoreCore<ChatState>, ChatGetters, ChatActions, ChatMutators {
	state: ChatState
}

const chatSo = createStore<ChatState>(setup)
export default chatSo as ChatStore