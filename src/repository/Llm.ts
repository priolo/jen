import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Agent } from './Agent.js'; // Import Agent entity



@Entity('llm')
export class Llm {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: 'varchar' })
	name: string;

	@Column({ type: 'text' })
	key: string;

	/** agenti che implementano questo llm */
	@OneToMany(() => Agent, (agent) => agent.llm)
    agents: Agent[];
}
