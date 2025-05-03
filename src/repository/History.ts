import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Doc } from './Doc.js';
import { User } from './User.js';



@Entity('history')
export class History {
	@PrimaryGeneratedColumn("uuid")
	id: string

	/** documento a cui fa riferimento la history */
	@ManyToOne(() => Doc)
	doc: Relation<Doc>

	/** json che contiene l'azione di modifica effettuata */
	@Column({ type: 'json', nullable: true })
	action: any

	@CreateDateColumn()
	createdAt: Date

	@Column()
	user: Relation<User>
}
