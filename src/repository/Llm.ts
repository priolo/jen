import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AgentRepo } from './Agent.js';
import { AccountRepo } from './Account.js';




/**
 * Tabella per memorizzare le KEY degli LLM
 */
@Entity('llms')
export class LlmRepo {

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


	/** 
	 * l'USER a cui appartiene la KEY 
	 * */
	@ManyToOne(() => AccountRepo, (user) => user.llms)
	@JoinColumn({ name: 'userId' })
	user?: Relation<AccountRepo>;

	/** 
	 * ID dell'USER a cui appartiene la KEY 
	 * */
	@Column({ type: 'varchar', nullable: true })
	userId?: string;


	/**
	 * Agents that use this LLM
	 */
	@OneToMany(() => AgentRepo, (agent) => agent.llm)
	agents?: AgentRepo[];
}



