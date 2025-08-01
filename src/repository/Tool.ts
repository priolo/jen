import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Agent } from './Agent.js';



@Entity('tools')
export class Tool {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: 'varchar' })
	name: string;

	/** Descrive il TOOL per l'utilizzo degli AGENT */
	@Column({ type: 'varchar', default: '' })
	description: string;

	@Column({ type: 'json', nullable: true })
    parameters: object;

	@Column({ type: 'varchar', default: '' })
	code: string;
	
	
    @ManyToMany(() => Agent, agent => agent.tools)
    agents: Relation<Agent>[];
}


