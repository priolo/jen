import { AccountRepo } from '@/repository/Account.js';


/**
 * Dati di trasferimento
 */
export interface AccountDTO {
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
	emailVerified?: boolean;
}

export enum ACCOUNT_STATUS {
	OFFLINE = 0,
	ONLINE
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
export function AccountDTO(account: AccountRepo): AccountDTO | null {
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
export function AccountDTOList(accounts: AccountRepo[]) {
	return accounts.map(account => AccountDTO(account));
}export enum EMAIL_CODE {
	VERIFIED = "verified",
	UNVERIFIED = null
}


