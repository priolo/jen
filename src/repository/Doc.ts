import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation, OneToMany } from 'typeorm';
import { User } from './User.js'
import { History } from './History.js';



@Entity('docs')
export class Doc {
	@PrimaryGeneratedColumn("uuid")
	id: string

	// usato dal clicent per verificare se il doc è aggiornato o meno
	@Column({ type: 'integer', default: 0 })
	version: number

	@Column({ type: 'json', nullable: true })
	children: any  // 'any' per un JSON generico

	@ManyToOne(() => User, user => user.docs, { nullable: true, onDelete: 'CASCADE' })
	user: Relation<User>

	// @OneToMany(() => History, history => history.doc)
	// history: Relation<History>
}



// const repo: any = {
// 	name: "nodes",
// 	class: "typeorm/repo",
// 	model: {
// 		name: "nodes",
// 		columns: {
// 			id: { type: Number, primary: true, generated: true },
// 			label: { type: String, default: "" },
// 		},
// 		// https://typeorm.delightful.studio/interfaces/_entity_schema_entityschemarelationoptions_.entityschemarelationoptions.html
// 		relations: {
// 			parent: {
// 				type: "many-to-one",
// 				target: "nodes",
// 				nullable: true,
// 				onDelete: "CASCADE",
// 			},
// 			user: {
// 				type: "many-to-one",
// 				target: "users",
// 				nullable: true,
// 				onDelete: "CASCADE",
// 			}
// 		}
// 	}
// }
// export default repo
