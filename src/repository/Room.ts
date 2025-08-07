import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Agent } from './Agent.js';
import { ChatMessage } from '@/types/RoomActions.js';



@Entity('rooms')
export class Room {

    /** Unique identifier for the room */
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /** History of prompt conversation */
    @Column({ type: 'json', default: '[]' })
    history: ChatMessage[];

    // RELATIONSHIPS

    /** ID of the agent that respone in this room */
    @Column({ type: 'uuid', nullable: true })
    agentId: string | null;

    /** The agent associated with this room */
    @ManyToOne(() => Agent, agent => agent.rooms, { nullable: true })
    @JoinColumn({ name: 'agentId' })
    agent?: Relation<Agent> | null;

    /** ID of the parent room, if this room is a sub-room */
    parentRoomId?: string | null;

}
