import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';



@Entity('llm')
export class Llm {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: 'varchar' })
	name: string;

	@Column({ type: 'text' })
	key?: string;

	// /** agenti che implementano questo llm */
	// @OneToMany(() => Agent, (agent) => agent.llm)
    // agents?: Agent[];
}
