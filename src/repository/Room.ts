import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Agent } from './Agent.js';



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
    history: HistroyMessage[];

    // RELATIONSHIPS

    /** ID of the agent that respone in this room */
    @Column({ type: 'uuid', nullable: true })
    agentId: string | null;

    /** The agent associated with this room */
    @ManyToOne(() => Agent, agent => agent.rooms, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'agentId' })
    agent: Relation<Agent> | null;
}

export interface HistroyMessage {
    role: "user" | "assistant" | "system"
    text: string
}
