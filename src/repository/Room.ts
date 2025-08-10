import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AgentRepo } from './Agent.js';
import { ChatMessage } from '@/types/RoomActions.js';



@Entity('rooms')
export class RoomRepo {

    /** Unique identifier for the room */
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /** History of prompt conversation */
    @Column({ type: 'json', default: '[]' })
    history: ChatMessage[];

    // RELATIONSHIPS

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
    agents?: Relation<AgentRepo>[];

    /** ID of the parent room, if this room is a sub-room */
    parentRoomId?: string | null;

}
