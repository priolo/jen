import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation } from 'typeorm';
import { Doc } from './Doc.js'; // Assicurati di avere una classe Node definita per la relazione one-to-many
import { Provider } from './Provider.js'; // Assicurati di avere una classe Provider definita per la relazione one-to-many



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

	@OneToMany(() => Doc, node => node.user, { cascade: true })
	docs: Relation<Doc>[];

	@OneToMany(() => Provider, provider => provider.user, { cascade: true })
	providers: Relation<Provider>[];
}



// const repo: any = {
// 	name: "users",
// 	class: "typeorm/repo",
// 	model: {
// 		name: "users",
// 		// https://typeorm.io/#/separating-entity-definition
// 		columns: {
// 			id: { type: Number, primary: true, generated: true },
// 			email: { type: String, default: "" },
// 			name: { type: String, default: "" },
// 			password: { type: String, default: "" },
// 			salt: { type: String, default: "" },
// 		},
// 		// https://typeorm.delightful.studio/interfaces/_entity_schema_entityschemarelationoptions_.entityschemarelationoptions.html
// 		relations: {
// 			nodes: {
// 				type: "one-to-many",
// 				target: "nodes",
// 				cascade: true,
// 				inverseSide: 'user',
// 			},
// 			providers: {
// 				type: "one-to-many",
// 				target: "providers",
// 				cascade: true,
// 				inverseSide: 'user',
// 			}
// 		},
// 	},
// }
// export default repo