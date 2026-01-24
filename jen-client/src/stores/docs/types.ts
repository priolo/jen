
export enum DOC_TYPE {
	EMPTY = "empty",

	AUTH_DETAIL = "auth_detail",
	ACCOUNT_DETAIL = "account_detail",
	/** lista degli ACCOUNTs */
	ACCOUNT_LIST = "account_list",
	ACCOUNT_FINDER = "account_finder",

	
	CHAT_DETAIL = "chat",
	CHAT_LIST = "chat_list",

	ROOM_DETAIL = "room",
	ROOM_LIST = "room_list",

	
	AGENT = "agent",
	AGENT_LIST = "agent_list",

	LLM_LIST = "llm_list",
	LLM_DETAIL = "llm_detail",

	MCP_SERVER_LIST = "mcp_server_list",
	MCP_SERVER_DETAIL = "mcp_server_detail",
	MCP_TOOL_DETAIL = "mcp_tool_detail",
	MCP_TOOL_RESULT_LIST = "mcp_tool_result_list",

	TOOL_LIST = "tool_list",
	TOOL_DETAIL = "tool_detail",

	AGENT_EDITOR = "text_editor",
	CODE_EDITOR = "code_editor",

	REFLECTION = "reflection",
}

export enum EDIT_STATE {
	NEW,
	READ,
	EDIT,
}
