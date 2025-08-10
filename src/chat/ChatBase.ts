import { RoomRepo } from "@/repository/Room.js";


class RoomShiftBased {
	constructor(
		public room: Partial<RoomRepo>,
	) {
	}


	public start() {
		// Inizializza la stanza, ad esempio impostando lo stato iniziale o caricando i dati necessari
		this.room.history = [];
	}
}

export default RoomShiftBased