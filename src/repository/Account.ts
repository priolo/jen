import { ACCOUNT_STATUS, EMAIL_CODE } from '@/types/account.js';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';



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


