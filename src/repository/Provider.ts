import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm'
import { User } from './User.js';



@Entity('providers')
export class Provider {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: 'varchar', default: '' })
	type: string;

	@Column({ type: 'text' })
	token: string;

	@ManyToOne(() => User, user => user.providers, { onDelete: 'CASCADE' })
	user: Relation<User>;
}



// const repo: any = {
// 	name: "providers",
// 	class: "typeorm/repo",
// 	model: {
// 		name: "providers",
// 		// https://typeorm.io/#/separating-entity-definition
// 		columns: {
// 			id: { type: "int", primary: true, generated: true },
// 			type: { type: "varchar", default: "" },
// 			token: { type: "text" },
// 		},
// 		// https://typeorm.delightful.studio/interfaces/_entity_schema_entityschemarelationoptions_.entityschemarelationoptions.html
// 		relations: {
// 			user: {
// 				type: "many-to-one",
// 				target: "users",
// 				//cascade: true,
// 				onDelete: "CASCADE",
// 			}
// 		},
// 	},
// }
// export default repo