import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';



@Entity('mcp_servers')
export class McpServer {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: 'varchar' })
	name: string;

	@Column({ type: 'varchar', default: '' })
	host: string;
	
}


