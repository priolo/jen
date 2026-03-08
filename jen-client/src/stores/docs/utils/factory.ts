import accountDetailSetup from "@/stores/stacks/account/detail";
import accountFinderSetup from "@/stores/stacks/account/finder";
import agentDetailSetup from "@/stores/stacks/agent/detail";
import agentListSetup from "@/stores/stacks/agent/list";
import agentEditorSetup from "@/stores/stacks/agentEditor";
import authDetailSetup from "@/stores/stacks/auth/detail";
import chatDetailSetup from "@/stores/stacks/chat/detail";
import chatListSetup from "@/stores/stacks/chat/list";
import chatPartecipantsListSetup from "@/stores/stacks/chat/partecipantsList";
import editCodeSetup from "@/stores/stacks/editorCode";
import llmDetailSetup from "@/stores/stacks/llm/detail";
import llmListSetup from "@/stores/stacks/llm/list";
import mcpServerDetailSetup from "@/stores/stacks/mcpServer/detail";
import mcpServerListSetup from "@/stores/stacks/mcpServer/list";
import mcpToolDetailSetup from "@/stores/stacks/mcpTool/detail";
import toolResultListSetup from "@/stores/stacks/mcpTool/resultList";
import roomDetailSetup from "@/stores/stacks/room/detail";
import roomAgentsListSetup from "@/stores/stacks/room/roomAgentsList";
import toolDetailSetup from "@/stores/stacks/tool/detail";
import toolListSetup from "@/stores/stacks/tool/list";
import { DOC_TYPE } from "@/types";
import { createStore } from "@priolo/jon";
import reflectionSetup from "../../stacks/reflection";
import { ViewState, ViewStore } from "../../stacks/viewBase";



/** genera un uuid per un DOC */
export function createUUID(): string {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
		/[xy]/g,
		(c) => {
			let r = (dt + (Math.random() * 16)) % 16 | 0;
			dt = Math.floor(dt / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		}
	)
	return uuid;
}

/** 
 * crea lo STORE alo "state" passato
 * eventualmente lo popola con la serializzazione "stateSerializzation"
*/
export function buildStore(state: Partial<ViewState>, stateSerializzation?: Partial<ViewState>): ViewStore {
	const setup = {

		[DOC_TYPE.AUTH_DETAIL]: authDetailSetup,
		[DOC_TYPE.CHAT_PARTECIPANTS_LIST]: chatPartecipantsListSetup,
		[DOC_TYPE.ACCOUNT_FINDER]: accountFinderSetup,
		[DOC_TYPE.ACCOUNT_DETAIL]: accountDetailSetup,

		
		[DOC_TYPE.AGENT_EDITOR]: agentEditorSetup,


		[DOC_TYPE.CHAT_DETAIL]: chatDetailSetup,
		[DOC_TYPE.CHAT_LIST]: chatListSetup,

		[DOC_TYPE.ROOM_DETAIL]: roomDetailSetup,
		//[DOC_TYPE.ROOM_LIST]: null/*promptListSetup*/,
		[DOC_TYPE.ROOM_AGENT_LIST]: roomAgentsListSetup,

		[DOC_TYPE.AGENT]: agentDetailSetup,
		[DOC_TYPE.AGENT_LIST]: agentListSetup,

		[DOC_TYPE.LLM_LIST]: llmListSetup,
		[DOC_TYPE.LLM_DETAIL]: llmDetailSetup,

		[DOC_TYPE.MCP_SERVER_LIST]: mcpServerListSetup,
		[DOC_TYPE.MCP_SERVER_DETAIL]: mcpServerDetailSetup,
		[DOC_TYPE.MCP_TOOL_DETAIL]: mcpToolDetailSetup,
		[DOC_TYPE.MCP_TOOL_RESULT_LIST]: toolResultListSetup,

		[DOC_TYPE.TOOL_LIST]: toolListSetup,
		[DOC_TYPE.TOOL_DETAIL]: toolDetailSetup,

		[DOC_TYPE.CODE_EDITOR]: editCodeSetup,
		[DOC_TYPE.REFLECTION]: reflectionSetup,
		
	}[state?.type]
	if (!setup) return
	const store: ViewStore = <ViewStore>createStore(setup)
	store.state = { ...store.state, ...state };
	// se non c'e' l'uuid lo creo IO!
	//if (store.state.uuid == null) store.state.uuid = createUUID()
	if (stateSerializzation) store.setSerialization(stateSerializzation);
	(<any>store).onCreated?.()
	return store
}
