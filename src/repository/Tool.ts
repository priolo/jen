import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AgentRepo } from './Agent.js';
import { McpServerRepo } from './McpServer.js';

export enum TOOL_TYPE {
	MCP = 'MCP',
	NODE = 'NODE',
	CODE = 'CODE'
}

/**
 * Rappresenta un tool utilizzabile dagli agenti
 * E' collegato ad un MCP server
 */
@Entity('tools')
export class ToolRepo {

	@PrimaryGeneratedColumn("uuid")
	id: string

	/** The type of the tool */
	@Column({ type: 'varchar', default: TOOL_TYPE.MCP })
	type?: TOOL_TYPE

	/** Il nome del tool (è univoco nello scope di MCP) */
	@Column({ type: 'varchar', default: '' })
	name?: string

	/** descrizione del TOOL (sovrascrive quella del MCP) */
	@Column({ type: 'varchar', default: '' })
	description?: string

	/** Parametri del tool in formato JSON (sovrascrive quella del MCP) */
	@Column({ type: 'json', nullable: true })
	parameters?: any


	
    /** Il server MCP */
    @ManyToOne(() => McpServerRepo, mcp => mcp.id)
	@JoinColumn({ name: 'mcpId' })
    mcp?: McpServerRepo
	@Column({ type: 'uuid', nullable: true })
    mcpId?: string

	/** Funzione per eseguire direttamente il codice */
	@Column({ type: 'varchar', nullable: true })
	code?: string

	/** Percorso per eseguire il tool in julian */
	@Column({ type: 'varchar', nullable: true })
	pathNode?: string



	// RELATIONSHIPS
	/** Agenti che utilizzano questo tool */
	@ManyToMany(() => AgentRepo, agent => agent.tools)
	agents?: AgentRepo[]
	
}
