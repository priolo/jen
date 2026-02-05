import { ACCOUNT_STATUS, AccountDTO, EMAIL_CODE } from '@shared/types/AccountDTO.js';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';



@Entity('accounts')
export class AccountRepo {

	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@Column({ type: 'varchar', default: '' })
	name?: string;

	/** lingua preferita dell'utente */
	@Column({ type: 'varchar', nullable: true, default: 'en' })
	language?: string;

	/** Abilita le notifiche per email */
	@Column({ type: 'boolean', nullable: false, default: true })
	notificationsEnabled?: boolean;


	/** valorizzata alla registrazione oppure da accesso google */
	@Column({ type: 'varchar', nullable: true })
	email?: string;
	/** il codice di verifica dell'email */
	@Column({ type: 'varchar', default: EMAIL_CODE.UNVERIFIED, nullable: true })
	emailCode?: string;

	/** account google */
	@Column({ type: 'varchar', nullable: true })
	googleEmail?: string;

	/** ACCOUNT GITHUB that are the owner */
	@Column({ type: 'int', nullable: true })
	githubId?: number;
	/** nome utente GITHUB collegato a questo ACCOUNT */
	@Column({ type: 'varchar', nullable: true })
	githubName?: string



	/** immagine dell'avatar */
	@Column({ type: 'varchar', default: '' })
	avatarUrl?: string;



	/** description visibile agli LLMs */
	@Column({ type: 'varchar', default: '' })
	description?: string;


	status?: ACCOUNT_STATUS;
}



/**
 * Payload memorizzato nel JWT token
 */
export type JWTPayload = {
	/** id ACCOUNT */
	id: string;
	email: string;
	name: string;
};

/**
 * restituisce una versione "sendable" dell'ACCOUNT, senza campi sensibili
 */
export function AccountDTOFromAccountRepo(account: AccountRepo): AccountDTO {
	if (!account) return null;

	// 2. Accesso diretto senza destrutturazione intermedia per evitare duplicazioni
	return {
		id: account.id,
		name: account.name,
		language: account.language,
		notificationsEnabled: account.notificationsEnabled,
		email: account.email,
		emailVerified: account.emailCode === EMAIL_CODE.VERIFIED,

		googleEmail: account.googleEmail,
		githubId: account.githubId,
		githubName: account.githubName,
		avatarUrl: account.avatarUrl,

		description: account.description,

		status: account.status,
	};
}

/**
 * Restituisce una lista di ACCOUNT in versione "sendable"
 */
export function AccountDTOFromAccountRepoList(accounts: AccountRepo[]) {
	return accounts.map(account => AccountDTOFromAccountRepo(account));
}


