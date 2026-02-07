import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AccountAssets } from './AccountAssets.js';
import { AgentRepo } from './Agent.js';
import { McpServerRepo } from './McpServer.js';
import { TOOL_TYPE, ToolDTO } from '@shared/types/ToolDTO.js';
export { TOOL_TYPE } from '@shared/types/ToolDTO.js';

/**
 * Rappresenta un tool utilizzabile dagli agenti
 * E' collegato ad un MCP server
 */
@Entity('tools')
export class ToolRepo extends AccountAssets {

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



	/** 
	 * Server MCP 
	 * Se non c'e' magari è un tool di tipo CODE
	 */
	@ManyToOne(() => McpServerRepo, mcp => mcp.id)
	@JoinColumn({ name: 'mcpId' })
	mcp?: McpServerRepo
	@Column({ type: 'uuid', nullable: true })
	mcpId?: string

	/** 
	 * Funzione per eseguire direttamente il codice 
	 * alternativa al server MCP
	 */
	@Column({ type: 'varchar', nullable: true })
	code?: string

	/** 
	 * Percorso per eseguire il tool in julian 
	 * alternativa al server MCP
	 */
	@Column({ type: 'varchar', nullable: true })
	pathNode?: string



	//#region RELATIONSHIPS

	/** Agenti che utilizzano questo tool */
	@ManyToMany(() => AgentRepo, agent => agent.tools)
	agents?: AgentRepo[]

	//#endregion

}


export function ToolDTOFromToolRepo(tool: ToolRepo): ToolDTO {
	if (!tool) return null;
	return {
		id: tool.id,
		accountId: tool.accountId,

		type: tool.type,
		name: tool.name,
		description: tool.description,
		parameters: tool.parameters,

		mcpId: tool.mcpId,
		code: tool.code,
		pathNode: tool.pathNode,

		agentsIds: tool.agents?.map(agent => agent.id).filter(Boolean) as string[] || [],
	};
}

export function ToolDTOFromToolRepoList(tools: ToolRepo[]) {
	return tools.map(tool => ToolDTOFromToolRepo(tool));
}
