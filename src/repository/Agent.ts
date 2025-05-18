import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Tool } from './Tool.js';



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

	@OneToMany(() => Agent, node => node.agents, { cascade: false })
	agents: Relation<Agent>[];

	@ManyToMany(() => Tool, tool => tool.agents)
    @JoinTable() // Manages the join table for the relationship
    tools: Relation<Tool>[]; // Corrected type from Relation<any>[]

}
