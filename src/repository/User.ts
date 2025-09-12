import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProviderRepo } from './Provider.js';



@Entity('users')
export class UserRepo {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@Column({ type: 'varchar', default: '' })
	email: string;

	@Column({ type: 'varchar', default: '' })
	name: string;

	@Column({ type: 'varchar', default: '' })
	avatarUrl: string;

	/**
	 * visibile agli LLMs
	 */
	@Column({ type: 'varchar', default: '' })
	description?: string;

	@Column({ type: 'varchar', default: '' })
	password?: string;

	@Column({ type: 'varchar', default: '' })
	salt?: string;

	/** I providers associati a questo user */
	@OneToMany(() => ProviderRepo, provider => provider.user)
	providers?: ProviderRepo[];

}
