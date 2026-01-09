import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';



export enum EMAIL_CODE {
	VERIFIED = "verified",
	UNVERIFIED = null,
}

export enum ACCOUNT_STATUS {
	OFFLINE = 0,
	ONLINE,
}

@Entity('accounts')
export class AccountRepo {

	status?: ACCOUNT_STATUS;

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





/** 
 * restituisce una versione "sendable" dell'ACCOUNT, senza campi sensibili 
 */
export function accountSendable(account: AccountRepo): AccountDto | null {
    if (!account) return null;
    
    // 2. Accesso diretto senza destrutturazione intermedia per evitare duplicazioni
    return {
        id: account.id,
        name: account.name,
        language: account.language,
        notificationsEnabled: account.notificationsEnabled,
        email: account.email,
        avatarUrl: account.avatarUrl,
        googleEmail: account.googleEmail,
        githubId: account.githubId,
        githubName: account.githubName,
        status: account.status,
        //description: account.description,
        
        emailVerified: account.emailCode === EMAIL_CODE.VERIFIED, 
    };
}
/**
 * Restituisce una lista di ACCOUNT in versione "sendable"
 */
export function accountSendableList(accounts: AccountRepo[]) {
	return accounts.map(account => accountSendable(account))
}

export interface AccountDto {
    id?: string;
    name?: string;
    language?: string;
    notificationsEnabled?: boolean;
    email?: string;
    avatarUrl?: string;
    googleEmail?: string;
    githubId?: number;
    githubName?: string;
    status?: ACCOUNT_STATUS;
    //description?: string; 
    emailVerified: boolean;
}