import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Tool } from './Tool.js';
import { Llm } from './Llm.js';



@Entity('agents')
export class Agent {

	/** id dell'agente */
	@PrimaryGeneratedColumn("uuid")
	id: string;

	/** nome dell'agente */
	@Column({ type: 'varchar', default: '' })
	name: string;

	/** Descrive l'agent nel tool */
	@Column({ type: 'varchar', default: '' })
	description: string;

	/** imprinting */
	@Column({ type: 'varchar', default: '' })
	systemPrompt: string;

	/** contesto nel prompt iniziale */
	@Column({ type: 'varchar', default: '' })
	contextPrompt: string;

	@Column({ type: 'boolean', default: false })
	askInformation: boolean;

	@Column({ type: 'boolean', default: true })
	killOnResponse: boolean;


	// RELATIONSHIPS

	@ManyToOne(() => Llm, (llm) => llm.agents, { nullable: true, onDelete: 'SET NULL' }) // Added nullable and onDelete for flexibility
    @JoinColumn({ name: 'llmId' }) // Specifies the foreign key column
    llm: Llm | null; // Changed from Relation<Llm>

	// Replace the existing 'agents' relationship with a ManyToMany self-referencing one
    @ManyToMany(() => Agent)
    @JoinTable({
        name: "agent_relations", // Name of the pivot table for agent-to-agent relationships
        joinColumn: { // Foreign key for the first agent in the relation
            name: "agentId_1",
            referencedColumnName: "id"
        },
        inverseJoinColumn: { // Foreign key for the second agent in the relation
            name: "agentId_2",
            referencedColumnName: "id"
        }
    })
    agents: Agent[]; // Renamed for clarity, or you can keep 'agents'


	@ManyToMany(() => Tool, tool => tool.agents)
    @JoinTable() // Manages the join table for the relationship
    tools: Tool[]; // Changed from Relation<Tool[]>

}
