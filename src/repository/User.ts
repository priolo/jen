import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';



@Entity('users')
export class User {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: 'varchar', default: '' })
	email: string;

	@Column({ type: 'varchar', default: '' })
	name: string;

	@Column({ type: 'varchar', default: '' })
	password: string;

	@Column({ type: 'varchar', default: '' })
	salt: string;
}
