import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AgentRepo } from './Agent.js';
import { McpServerRepo } from './McpServer.js';



/**
 * Rappresenta un tool utilizzabile dagli agenti
 * E' collegato ad un MCP server
 */
@Entity('tools')
export class ToolRepo {

	@PrimaryGeneratedColumn("uuid")
	id: string

	/** Il nome del tool (è univoco nello scope di MCP) */
	@Column({ type: 'varchar', default: '' })
	name?: string

	/** descrizione del TOOL (sovrascrive quella del MCP) */
	@Column({ type: 'varchar', default: '' })
	description?: string

	/** Parametri del tool in formato JSON */
	@Column({ type: 'json', nullable: true })
	parameters?: any

    // Il server MCP 
    @ManyToOne(() => McpServerRepo, mcp => mcp.id)
	@JoinColumn({ name: 'mcpId' })
    mcp?: McpServerRepo
	@Column({ type: 'uuid', nullable: true })
    mcpId?: string

	// RELATIONSHIPS
	/** Agenti che utilizzano questo tool */
	@ManyToMany(() => AgentRepo, agent => agent.tools)
	agents?: AgentRepo[]


	execute?: (args:any) => Promise<any>
}

export interface IToolRepo extends InstanceType<typeof ToolRepo> {}
