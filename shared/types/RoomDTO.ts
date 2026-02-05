import { ChatMessage } from './ChatMessage.js';


/**
 * E' uno spazio dotato di HISTORY dove gli USER possono comunicare con gli altri USER e con gli AGENTS
 */
export type RoomDTO = {
	id: string;
	/** autore della ROOM */
	accountId?: string;
	/** CHAT a cui appartiene questa ROOM */
	chatId: string;
	/** id della ROOM parent. NULL se è la MAIN ROOM */
	parentRoomId?: string;

	/** quallo che è stato "scritto" nella ROOM */
	history: ChatMessage[];
	/** gli agenti presenti in ROOM */
	agentsIds: string[];
};
