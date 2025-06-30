import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE } from "@/types";
import { AgentEditorState, AgentEditorStore } from ".";
import agentSo from "../agent/repo";
import { ElementType, PROMPT_ROLES } from "@/components/slate/elements/agent/types";



export function buildEditorFromAgent(agentId: string) {

	const agent = agentSo.getById(agentId)

	const initValue:ElementType[] = [
		{ 
			type: PROMPT_ROLES.DESCRIPTION, 
			children: [{ text: agent.description ?? "" }] 
		},

		{ 
			type: PROMPT_ROLES.SYSTEM, 
			children: [{ text: agent.systemPrompt ?? "" }] 
		},
		{ 
			type: PROMPT_ROLES.USER, 
			children: [{ text: agent.contextPrompt ?? "" }] 
		}

	];

	const store = buildStore(<AgentEditorState>{
		type: DOC_TYPE.AGENT_EDITOR,
		agentId: agent.id,
		llmId: agent.llmId,
		initValue,
		
	} as AgentEditorState) as AgentEditorStore;
	return store;
}

export function buildEditorNew() {

	const initValue:ElementType[] = [
		{ 
			type: PROMPT_ROLES.SYSTEM, 
			children: [{ text:  "text system" }] 
		},
		{ 
			type: PROMPT_ROLES.USER, 
			children: [{ text:  "text user" }] 
		}
	];

	const store = buildStore(<AgentEditorState>{
		type: DOC_TYPE.AGENT_EDITOR,
		// agentId: agent.id,
		// llmId: agent.llmId,
		initValue,
		
	} as AgentEditorState) as AgentEditorStore;
	return store;
}
