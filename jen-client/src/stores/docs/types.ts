
export enum DOC_TYPE {
	EMPTY = "empty",

	ROOM_DETAIL = "room",
	ROOM_LIST = "room_list",

	AGENT = "agent",
	AGENT_LIST = "agent_list",

	LLM_LIST = "llm_list",
	LLM_DETAIL = "llm_detail",

	MCP_SERVER_LIST = "mcp_server_list",
	MCP_SERVER_DETAIL = "mcp_server_detail",
	MCP_TOOL_DETAIL = "mcp_tool_detail",
	MCP_TOOL_RESPONSES = "mcp_tool_responses",


	TOOL_LIST = "tool_list",
	TOOL_DETAIL = "tool_detail",

	AGENT_EDITOR = "text_editor",
	CODE_EDITOR = "code_editor",

	REFLECTION = "reflection",
	ACCOUNT = "account",
	USERS = "users",
	USER = "user",
}

export enum EDIT_STATE {
	NEW,
	READ,
	EDIT,
}
