import { ChatMessage } from './ChatMessage.js';


/**
 * E' uno spazio dotato di HISTORY dove i CLIENT possono comunicare
 */

export type RoomDTO = {
	id: string;
	chatId: string;
	parentRoomId?: string;
	accountId?: string;

	history: ChatMessage[];
	agentsIds: string[];
};
