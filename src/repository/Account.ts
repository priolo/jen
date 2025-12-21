import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';



export enum EMAIL_CODE {
	VERIFIED = "verified",
	UNVERIFIED = null,
}

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

}

/**
 * Payload memorizzato nel JWT token
 */
export type JWTPayload = {
	id: string;
	email: string;
	name: string;
}

/** 
 * restituisce una versione "sendable" dell'ACCOUNT, senza campi sensibili 
 */
export function accountSendable(account: AccountRepo) {
	if (!account) return null
	const {
		id, name, language, notificationsEnabled, 
		email, avatarUrl, googleEmail, githubId, githubName,
	} = account
	return {
		id, name, language, notificationsEnabled, 
		email, avatarUrl, googleEmail, githubId, githubName,
		// se c'e' emailCode allora non e' verificata
		emailVerified: account.emailCode == EMAIL_CODE.VERIFIED,
	}
}
/**
 * Restituisce una lista di ACCOUNT in versione "sendable"
 */
export function accountSendableList(accounts: AccountRepo[]) {
	return accounts.map(account => accountSendable(account))
}

/**
 * Metadati essenziali del repository GitHub
 * memorizzati per evitare chiamate API ripetute
 */
export interface GithubAccountMetadata {
	name: string;
	full_name: string;
	avatar_url: string; // avatar del owner
	description?: string;
	html_url?: string;
}
