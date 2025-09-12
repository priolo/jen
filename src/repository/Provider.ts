import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserRepo } from './User.js';



/**
 * Tipi di PROVIDERs
 */
export enum PROVIDER_TYPE {
	/** è un accesso ad un LLM */
	LLM = 1,
	/** Serve ad accedere ad un account */
	ACCOUNT = 2,
}
/**
 * Nomi di PROVIDERs
 */
export enum PROVIDER_NAME {
	GOOGLE = "google",
	OPENAI = "openai",
	FACEBOOK = "facebook",
	AZURE = "azure",
	ANTHROPIC = "anthropic",
	COHERE = "cohere",
}



@Entity('providers')
export class ProviderRepo {

	@PrimaryGeneratedColumn("uuid")
	id?: string;

	/**
	 * Nome del PROVIDER (GOOGLE, OPENAI, AZURE, ...)
	 */
	@Column({ type: 'varchar' })
	name: PROVIDER_NAME;

	/**
	 * Indica se è una KEY per un LLM o un ACCOUNT
	 */
	@Column({ type: 'integer', default: PROVIDER_TYPE.ACCOUNT })
	type: PROVIDER_TYPE;

	/**
	 * Codice ... per gli LLM Nome del modello (es: gpt-3.5-turbo, gpt-4, ...)
	 */
	@Column({ type: 'varchar', nullable: true })
	code?: string;

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
	@OneToOne(() => UserRepo)
	@JoinColumn({ name: 'userId' })
	user: UserRepo;
}



