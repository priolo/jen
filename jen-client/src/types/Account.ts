import { Uuid } from "./global.js"



export enum ACCOUNT_STATUS {
	OFFLINE = 0,
	ONLINE,
}

export interface Account {
	id: Uuid
	name: string
	status: ACCOUNT_STATUS
	email: string
	emailVerified?: boolean
	avatarUrl?: string
	language?: string
	notificationsEnabled?: boolean
	preferredCurrency?: string

	googleEmail?: string
	
	githubId?: number
	githubName?: string

	/** 
	 * STRIPE for CONTRIBUTOR
	 * who put the moneys
	 */
	//stripeCustomerId?: string
	
	/** 
	 * STRIPE payment method 
	 */
	//stripePaymentMethodId?: string
	//stripeHaveCard?: boolean

	/** 
	 * STRIPE for AUTHOR
	 * who receive the moneys
	 */
	//stripeAccountId?: string

	//stripeAccountStatus?: "pending" | "ready";
}
