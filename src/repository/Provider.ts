import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AccountRepo } from './Account.js';



/**
 * Nomi di PROVIDERs
 */
export enum PROVIDER_NAME {
	GOOGLE = "google",
	FACEBOOK = "facebook",
	AZURE = "azure",
	APPLE = "apple",
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
	@OneToOne(() => AccountRepo)
	@JoinColumn({ name: 'userId' })
	user: Relation<AccountRepo>;
}



