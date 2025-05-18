import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';



@Entity('llm')
export class Llm {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: 'varchar', default: '' })
	name: string;

	@Column({ type: 'text' })
	key: string;
}
