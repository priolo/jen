import chatApi from "@/api/chat"
import { createStore, StoreCore } from "@priolo/jon"
import { Chat } from "../../../types/Chat"



const setup = {

	state: {
		/** tutte le chat di questo user */
		all: <Chat[]>[],
	},

	getters: {
		getIndexById(id: string, store?: ChatRepoStore) {
			if (!id) return -1
			return store.state.all?.findIndex(llm => llm.id == id)
		},
	},

	actions: {

		async fetch(_: void, store?: ChatRepoStore) {
			const chats = await chatApi.index({ store })
			store.setAll(chats)
		},

		async save(chat: Partial<Chat>, store?: ChatRepoStore): Promise<Chat> {
			let chatSaved: Chat = null
			if (!chat.id) {
				chatSaved = await chatApi.create(chat, { store })
			} else {
				chatSaved = await chatApi.update(chat as Chat, { store })
			}

			const all = [...store.state.all]
			const index = store.getIndexById(chat?.id)
			index == -1 ? all.push(chatSaved) : (all[index] = { ...all[index], ...chatSaved })
			store.setAll(all)

			return chatSaved
		},

		async delete(id: string, store?: ChatRepoStore) {
			await chatApi.remove(id, { store })
			store.setAll(store.state.all.filter(agent => agent.id != id))
		},

	},

	mutators: {
		setAll: (all: Chat[]) => ({ all }),
	},
}

export type ChatRepoState = typeof setup.state
export type ChatRepoGetters = typeof setup.getters
export type ChatRepoActions = typeof setup.actions
export type ChatRepoMutators = typeof setup.mutators

export interface ChatRepoStore extends StoreCore<ChatRepoState>, ChatRepoGetters, ChatRepoActions, ChatRepoMutators {
	state: ChatRepoState
}

const chatRepoSo = createStore<ChatRepoState>(setup) as ChatRepoStore
export default chatRepoSo;

