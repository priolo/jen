import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AccountRepo } from './Account.js';
import { AccountAssets } from './AccountAssets.js';



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
export class ProviderRepo extends AccountAssets {

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


	//#region RELATIONSHIPS

	//#endregion

}



