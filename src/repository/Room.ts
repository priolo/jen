import type { Relation } from 'typeorm';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChatMessage } from '../types/commons/RoomActions.js';
import { AgentRepo } from './Agent.js';
import { AccountAssets } from './AccountAssets.js';


/**
 * E' uno spazio dotato di HISTORY dove i CLIENT possono comunicare
 */
@Entity('rooms')
export class RoomRepo extends AccountAssets {

    /** Unique identifier for the room */
    @PrimaryGeneratedColumn("uuid")
    id: string;

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
    parentRoomId?: string | null;

    /** ID of the chat this room belongs to */
    @Column({ type: 'uuid' })
    chatId?: string | null;

    //#endregion


    

}
