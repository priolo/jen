import { randomUUID } from "crypto";
import { AgentRepo } from "../../repository/Agent.js";
import { RoomRepo } from "../../repository/Room.js";
import { MessageUpdate, UPDATE_TYPE } from "../../types/commons/RoomActions.js";



class RoomTurnBase {

	constructor(
		/** ROOM POCO di riferimento */
		public room: RoomRepo,
		// [II] in room dovrebbero poterci essere dei TOOLS e dei CONTEXT condivisi per tutti gli AGENTS che partecipano
	) {
		if (!this.room.history) this.room.history = [];
	}

	/**
	 * Crea una MAIN-ROOM con gli AGENTs specificati
	 */
	static Build(chatId: string, agentsRepo: AgentRepo[] = [], accountId?: string, parentRoomId?: string): RoomTurnBase {
		const roomRepo: RoomRepo = {
			id: randomUUID() as string,
			chatId,
			parentRoomId,
			accountId,

			history: [],
			agents: agentsRepo ?? [],
		}
		const room = new RoomTurnBase(roomRepo)
		return room
	}

	/** aggiorno la HISTORY con una serie di MessageUpdate */
	updateHistory(updates: MessageUpdate[] | MessageUpdate): void {
		if (!updates) return;
		if (!Array.isArray(updates)) updates = [updates];
		if (updates.length == 0) return;

		const history = [...this.room.history]
		for (const update of updates) {
			if (update.type === UPDATE_TYPE.APPEND) {
				history.push(update.content)
				continue;
			}
			const index = history.findIndex(m => m.id == update.refId)
			switch (update.type) {
				case UPDATE_TYPE.ADD: {
					if (index == -1) {
						history.unshift(update.content)
					} else {
						history.splice(index + 1, 0, update.content)
					}
					break
				}
				case UPDATE_TYPE.DELETE: {
					if (index != -1) history.splice(index, 1)
					break
				}
				case UPDATE_TYPE.REPLACE: {
					if (index != -1) history[index] = update.content
					break
				}
			}
		}
		this.room.history = history
	}

}

export default RoomTurnBase

