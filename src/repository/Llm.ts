import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AccountAssets } from './AccountAssets.js';
import { AgentRepo } from './Agent.js';




/**
 * Tabella per memorizzare le KEY degli LLM
 */
@Entity('llms')
export class LlmRepo  extends AccountAssets {

	@PrimaryGeneratedColumn("uuid")
	id?: string;

	/**
	 * Nome del modello (es: gpt-3.5-turbo, gpt-4, ...)
	 */
	@Column({ type: 'varchar', nullable: true })
	code?: string;

	/**
	 * l'API KEY
	 */
	@Column({ type: 'text', nullable: true })
	key?: string;


	//#region RELATIONSHIPS

	/**
	 * Agents that use this LLM
	 */
	@OneToMany(() => AgentRepo, (agent) => agent.llm)
	agents?: AgentRepo[];

	//#endregion

}



