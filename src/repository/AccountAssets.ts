import { Column, JoinColumn, ManyToOne } from 'typeorm';
import { AccountRepo } from './Account.js';



/**
 * Rappresenta un entità che appartiene ad un ACCOUNT
 */
export abstract class AccountAssets {

	/** l'ACCOUNT proprietario */
	@ManyToOne(() => AccountRepo, { nullable: true })
	@JoinColumn({ name: 'accountId' })
	account?: AccountRepo

	/** l'ID dell'ACCOUNT proprietario */
	@Column({ type: 'uuid', default: null })
	accountId?: string

}
