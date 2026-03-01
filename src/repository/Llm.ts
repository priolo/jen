import { LlmDTO } from '@shared/types/LlmDTO.js';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AccountAssets } from './AccountAssets.js';
import { AgentRepo } from './Agent.js';



/**
 * Memorizza un modello di LLM (p.e. GPT-4, Mistral Large, ecc.)
 * e, eventualmente, la api key associata
 */
@Entity('llms')
export class LlmRepo extends AccountAssets {

	@PrimaryGeneratedColumn("uuid")
	id?: string;

	/**
	 * Nome del modello (es: gpt-3.5-turbo, gpt-4, ...)
	 */
	@Column({ type: 'varchar', nullable: true })
	code?: string;

	/**
	 * l'API KEY
	 */
	@Column({ type: 'text', nullable: true })
	key?: string;


	//#region RELATIONSHIPS

	/**
	 * Agents that use this LLM
	 */
	@OneToMany(() => AgentRepo, (agent) => agent.llm)
	agents?: AgentRepo[];

	//#endregion

}

export function LlmDTOFromLlmRepo(llm: LlmRepo): LlmDTO {
	if (!llm) return null
	return {
		id: llm.id,
		accountId: llm.accountId,

		code: llm.code,
		key: llm.key, // da criptare?

		agentsIds: llm.agents?.map(a => a.id).filter(Boolean) as string[] || [],
	}
}

/**
 * Restituisce una lista 
 */
export function LlmDTOFromLlmRepoList(llm: LlmRepo[]) {
	return llm.map(llm => LlmDTOFromLlmRepo(llm));
}
