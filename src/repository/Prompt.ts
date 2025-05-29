import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Agent } from './Agent.js';

export interface HistoryItem {
    role: "user" | "llm";
    text: string;
}

@Entity('prompts')
export class Prompt {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    /** History of prompt conversation */
    @Column({ type: 'json', default: '[]' })
    history: HistoryItem[];

    // RELATIONSHIPS

    /** ID of the agent this prompt belongs to */
    @Column({ type: 'uuid', nullable: true })
    agentId: string | null;

    /** Agent this prompt belongs to */
    @ManyToOne(() => Agent, agent => agent.prompts, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'agentId' })
    agent: Relation<Agent> | null;
}
