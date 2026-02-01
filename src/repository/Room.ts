import type { Relation } from 'typeorm';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChatMessage } from "@shared/types/RoomActions.js";
import { AgentRepo } from './Agent.js';
import { ChatRepo } from './Chat.js';
import { AccountAssets } from './AccountAssets.js';
import { randomUUID } from 'crypto';
import { RoomDTO } from '@shared/types/RoomDTO.js';


/**
 * E' uno spazio dotato di HISTORY dove i CLIENT possono comunicare
 */
@Entity('rooms')
export class RoomRepo extends AccountAssets {

    /** Unique identifier for the room */
    @PrimaryGeneratedColumn("uuid")
    id?: string;

    /** ID of the chat this room belongs to */
    @Column({ type: 'uuid' })
    chatId: string;

    @ManyToOne(() => ChatRepo, (chat) => chat.rooms)
    @JoinColumn({ name: "chatId" })
    chat?: Relation<ChatRepo>;

    /** History of prompt conversation */
    @Column({ type: 'json', default: '[]' })
    history?: ChatMessage[] = [];

    //#region RELATIONSHIPS

    /** The agents associated with this room */
    @ManyToMany(() => AgentRepo, agent => agent.rooms)
    @JoinTable({
        name: "room_agents",
        joinColumn: {
            name: "roomId",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "agentId",
            referencedColumnName: "id"
        }
    })
    agents?: Relation<AgentRepo[]>;

    /** ID of the parent room, if this room is a sub-room */
    @Column({ type: 'uuid', nullable: true })
    parentRoomId?: string;

    //#endregion
}

/**
 * Restituisce una nuova istanza di ROOM-REPO
 */
export function BuildRoomRepo(chatId: string, agentsRepo: AgentRepo[] = [], accountId?: string, parentRoomId?: string): RoomRepo {
    const room: RoomRepo = {
        id: randomUUID() as string,
        chatId,
        parentRoomId,
        accountId,

        history: [],
        agents: agentsRepo ?? [],
    }
    return room
}



export function RoomDTOFromRoomRepo(room: RoomRepo): RoomDTO {
	if (!room) return null;
	return {
		id: room.id,
		chatId: room.chatId,
		parentRoomId: room.parentRoomId,
		accountId: room.accountId,
		history: room.history || [],
		agentsIds: null//room.agentsIds || [],
	};
}
