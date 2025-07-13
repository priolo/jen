import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Agent } from './Agent.js';
import { CoreMessage } from 'ai';



@Entity('rooms')
export class Room {

    /** Unique identifier for the room */
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /**name of ROOM (maiby can are void) */
    @Column({ type: 'varchar' })
    name: string;

    /** History of prompt conversation */
    @Column({ type: 'json', default: '[]' })
    history: CoreMessage[];

    // RELATIONSHIPS

    /** ID of the agent that respone in this room */
    @Column({ type: 'uuid', nullable: true })
    agentId: string | null;

    /** The agent associated with this room */
    @ManyToOne(() => Agent, agent => agent.rooms, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'agentId' })
    agent?: Relation<Agent> | null;

    /** ID of the parent room, if this room is a sub-room */
    parentRoomId: string | null;

    /** id del messaggio a cui si aggancia questa ROOM */
    messageId: string | null;
}
