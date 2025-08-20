import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AgentRepo } from './Agent.js';
import { LLM_MODELS } from '@/types/commons/LlmProviders.js';



@Entity('llm')
export class LlmRepo {
	
	@PrimaryGeneratedColumn("uuid")
	id: string;

	/**
	 * Nome del modello LLM
	 */
	@Column({ type: 'varchar' })
	name: LLM_MODELS;

	/**
	 * l'API KEY di questo LLM
	 */
	@Column({ type: 'text', nullable: true })
	key?: string;

	/** agenti che implementano questo llm */
	@OneToMany(() => AgentRepo, agent => agent.llm, { nullable: true })
    agents?: AgentRepo[];
}



