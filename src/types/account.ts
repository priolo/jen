import { AccountRepo } from '@/repository/Account.js';
import { AccountDTO as IAccountDTO, ACCOUNT_STATUS, GithubAccountMetadata as IGithubAccountMetadata } from '@shared/types/account.js';

export { ACCOUNT_STATUS };
export type AccountDTO = IAccountDTO;
export type GithubAccountMetadata = IGithubAccountMetadata;


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
}

export enum EMAIL_CODE {
	VERIFIED = "verified",
	UNVERIFIED = null
}


