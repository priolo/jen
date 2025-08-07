import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';



/**
 * Rappresenta un server MCP
 */
@Entity('mcp_servers')
export class McpServer {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: 'varchar' })
	name: string;

	@Column({ type: 'varchar', default: '' })
	host: string;
	
}


