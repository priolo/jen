import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AccountAssets } from './AccountAssets.js';



/**
 * Rappresenta un server MCP
 */
@Entity('mcp_servers')
export class McpServerRepo extends AccountAssets {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: 'varchar' })
	name: string;

	@Column({ type: 'varchar', default: '' })
	host: string;


	//#region RELATIONSHIPS

	//#endregion

}


