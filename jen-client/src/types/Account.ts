import { Uuid } from "./global.js"



export interface Account {
	id: Uuid
	name: string
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
