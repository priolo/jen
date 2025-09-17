import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProviderRepo } from './Provider.js';
import { LlmRepo } from './Llm.js';



@Entity('accounts')
export class AccountRepo {

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



	/** I providers di accesso associati a questo user */
	@OneToMany(() => ProviderRepo, provider => provider.account)
	providers?: Relation<ProviderRepo[]>

	/** Le KEY degli LLM associati a questo user */
	@OneToMany(() => LlmRepo, (llm) => llm.account)
	llms?: Relation<LlmRepo[]>;

}
