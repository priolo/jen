import { RoomRepo } from "../../repository/Room.js";
import { MessageUpdate, UPDATE_TYPE } from "@shared/types/RoomActions.js";



/** aggiorno la HISTORY con una serie di MessageUpdate */
export function RoomHistoryUpdate(room: RoomRepo, updates: MessageUpdate[] | MessageUpdate): void {
	if (!updates) return;
	if (!Array.isArray(updates)) updates = [updates];
	if (updates.length == 0) return;

	const history = [...room.history]
	for (const update of updates) {

		// se non c'e' l'uuid lo aggiungo in automatico
		if (!update.content.id) update.content.id = crypto.randomUUID()

		// applico l'update
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
	room.history = history
}
