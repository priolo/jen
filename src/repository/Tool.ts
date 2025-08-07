import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Agent } from './Agent.js';
import { McpServer } from './McpServer.js';



/**
 * Rappresenta un tool utilizzabile dagli agenti
 * E' collegato ad un MCP server
 */
@Entity('tools')
export class Tool {
	@PrimaryGeneratedColumn("uuid")
	id: string

	/** Il nome del tool (è univoco nello scope di MCP) */
	@Column({ type: 'varchar', default: '' })
	name: string
	
    // Il server MCP 
    @ManyToOne(() => McpServer, mcp => mcp.id)
	@JoinColumn({ name: 'mcpId' })
    mcp?: McpServer
	@Column({ type: 'uuid', nullable: true })
    mcpId: string


	// RELATIONSHIPS
	/** Agenti che utilizzano questo tool */
	@ManyToMany(() => Agent, agent => agent.tools)
	agents?: Relation<Agent[]>
}


