
export enum DOC_TYPE {
	EMPTY = "empty",

	USERS = "users",
	USER = "user",

	LOGS = "logs",
	ABOUT = "about",

	TEXT_EDITOR = "text_editor",
	CODE_EDITOR = "code_editor",
	AGENT = "agent",
	
	LLM_LIST = "llm_list",
	LLM_DETAIL = "llm_detail",

	TOOL_LIST = "tool_list",
	TOOL_DETAIL = "tool_detail",

	REFLECTION = "reflection",
	HELP = "help",

	ACCOUNT = "account",
}

export enum EDIT_STATE {
	NEW,
	READ,
	EDIT,
}
