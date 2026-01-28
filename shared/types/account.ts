
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
	ONLINE,
	UNKNOWN,
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
