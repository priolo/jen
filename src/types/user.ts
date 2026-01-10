

export interface UserPayload {
	userId: string;
	username: string;
	email?: string;
	roles?: string[];
	[key: string]: any;
}