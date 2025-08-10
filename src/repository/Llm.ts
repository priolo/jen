import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AgentRepo } from './Agent.js';



@Entity('llm')
export class LlmRepo {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: 'varchar' })
	name: string;

	// @Column({ type: 'text' })
	// key?: string;

	/** agenti che implementano questo llm */
	@OneToMany(() => AgentRepo, agent => agent.llm, { nullable: true })
    agents?: AgentRepo[];
}
