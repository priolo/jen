import chatApi from "@/api/chat"
import { createStore, StoreCore } from "@priolo/jon"
import { ChatDTO } from "@shared/types/ChatDTO"



const setup = {

	state: {
		/** tutte le chat di questo user */
		all: <ChatDTO[]>[],
	},

	getters: {
		getById(id: string, store?: ChatRepoStore): ChatDTO {
			if (!id) return null
			return store.state.all?.find(chat => chat.id == id)
		},
		getIndexById(id: string, store?: ChatRepoStore) {
			if (!id) return -1
			return store.state.all?.findIndex(llm => llm.id == id)
		},
		getRoom({ chatId, roomId }: { chatId: string, roomId: string }, store?: ChatRepoStore) {
			const chat = store.getById(chatId)
			if (!chat) return null
			roomId = roomId || chat.mainRoomId
			if (!roomId) return null
			const room = chat.rooms?.find(r => r.id == roomId) ?? null
			return room
		},
		getRoomById(roomId: string, store?: ChatRepoStore) {
			if (!roomId) return null
			for ( const chat of store.state.all ?? []) {
				const room = chat.rooms?.find(r => r.id == roomId)
				if (room) return room
			}
			return null
		},
		getByRoomId(roomId: string, store?: ChatRepoStore): ChatDTO {
			if (!roomId) return null
			return store.state.all?.find(chat => chat.rooms?.some(r => r.id == roomId))
		},
	},

	actions: {

		async fetch(_: void, store?: ChatRepoStore) {
			const chats = await chatApi.index({ store })
			store.setAll(chats)
		},

		/**
		 * Carica una CHAT. Se è già in memoria la restituisce, altrimenti la prende da API e la mette in memoria.
		 */
		async load(id: string, store?: ChatRepoStore): Promise<ChatDTO> {
			let chat = store.getById(id)
			if (!!chat) return chat
			chat = await chatApi.get(id, { store, manageAbort: true })
			//chat.onlineUserIds = []
			if (chat) store.setAll( [...store.state.all, chat])
			return chat
		},

		async save(chat: Partial<ChatDTO>, store?: ChatRepoStore): Promise<ChatDTO> {
			let chatSaved: ChatDTO = null
			if (!chat.id) {
				chatSaved = await chatApi.create(chat, { store })
			} else {
				chatSaved = await chatApi.update(chat as ChatDTO, { store })
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
		setAll: (all: ChatDTO[]) => ({ all }),
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

