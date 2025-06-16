import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE } from "@/types";
import { TextEditorState, TextEditorStore } from ".";
import agentSo from "../agent/repo";
import { ElementType, PROMPT_ROLES } from "@/components/slate/elements/room/types";



export function buildEditorFromAgent(agentId: string) {

	const agent = agentSo.getById(agentId)

	const initValue:ElementType[] = [
		{ 
			type: PROMPT_ROLES.SYSTEM, 
			children: [{ text: agent.systemPrompt ?? "" }] 
		},
		{ 
			type: PROMPT_ROLES.USER, 
			children: [{ text: agent.systemPrompt ?? "" }] 
		}

	];

	const store = buildStore(<TextEditorState>{
		type: DOC_TYPE.TEXT_EDITOR,
		agentId: agent.id,
		llmId: agent.llmId,
		initValue,
		
	} as TextEditorState) as TextEditorStore;
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

	const store = buildStore(<TextEditorState>{
		type: DOC_TYPE.TEXT_EDITOR,
		// agentId: agent.id,
		// llmId: agent.llmId,
		initValue,
		
	} as TextEditorState) as TextEditorStore;
	return store;
}
