import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User.js';



/**
 * Tipo di provider
 */
export enum PROVIDER_TYPE {
	/** è un accesso ad un LLM */
    LLM = 1,
	/** Serve ad accedere ad un account */
    ACCOUNT = 2,
}



@Entity('providers')
export class LlmRepo {
	
	@PrimaryGeneratedColumn("uuid")
	id: string;

	/**
	 * Nome del PROVIDER (GOOGLE, OPENAI, AZURE, ...)
	 */
	@Column({ type: 'varchar' })
	name: string;

	/**
	 * Codice ... per gli LLM Nome del modello (es: gpt-3.5-turbo, gpt-4, ...)
	 * Uses LlmProviderType enum values (1=OPENAI, 2=GOOGLE, 3=MISTRAL, etc.)
	 */
	@Column({ 
		type: 'integer',
		default: PROVIDER_TYPE.ACCOUNT 
	})
	type: PROVIDER_TYPE;

	/**
	 * Codice ... per gli LLM Nome del modello (es: gpt-3.5-turbo, gpt-4, ...)
	 */
	@Column({ type: 'varchar' })
	code: string;

	/**
	 * l'API KEY
	 */
	@Column({ type: 'text', nullable: true })
	key?: string;

	/** 
	 * ID dell'USER a cui appartiene la KEY 
	 * */
	@Column({ type: 'varchar', nullable: true })
	userId?: string;

	/** 
	 * l'USER a cui appartiene la KEY 
	 * */
	@OneToOne(() => User, { nullable: true })
	@JoinColumn({ name: 'userId' })
    user?: User;
}



