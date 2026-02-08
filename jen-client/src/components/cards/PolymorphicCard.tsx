import RoomAgentListView from "@/app/cards/room/agents/RoomAgentListView"
import AgentView from "@/app/cards/agent/detail/View"
import ChatListView from "@/app/cards/chat/ListView"
import LlmListView from "@/app/cards/llm/ListView"
import LlmDetailView from "@/app/cards/llm/detail/View"
import McpServerListView from "@/app/cards/mcpServer/ListView"
import McpServerDetailView from "@/app/cards/mcpServer/detail/View"
import McpToolDetailView from "@/app/cards/mcpTool/detail/View"
import ToolResultListView from "@/app/cards/mcpTool/result/ListView"
import RootListView from "@/app/cards/room/ListView"
import RoomView from "@/app/cards/room/detail/View"
import ToolListView from "@/app/cards/tool/ListView"
import ToolDetailView from "@/app/cards/tool/detail/View"
import AccountFinderView from "@/app/cards/user/finder/ListView"
import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { AccountFinderStore } from "@/stores/stacks/account/finder"
import { AgentDetailStore } from "@/stores/stacks/agent/detail"
import { AgentListStore } from "@/stores/stacks/agent/list"
import { AgentEditorStore } from "@/stores/stacks/agentEditor"
import { AuthDetailStore } from "@/stores/stacks/auth/detail"
import { ChatListStore } from "@/stores/stacks/chat/list"
import { EditorCodeStore } from "@/stores/stacks/editorCode"
import { LlmDetailStore } from "@/stores/stacks/llm/detail"
import { LlmListStore } from "@/stores/stacks/llm/list"
import { McpServerDetailStore } from "@/stores/stacks/mcpServer/detail"
import { McpServerListStore } from "@/stores/stacks/mcpServer/list"
import { McpToolDetailStore } from "@/stores/stacks/mcpTool/detail"
import { ToolResultListStore } from "@/stores/stacks/mcpTool/resultList"
import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { PromptListStore } from "@/stores/stacks/room/list"
import { ToolDetailStore } from "@/stores/stacks/tool/detail"
import { ToolListStore } from "@/stores/stacks/tool/list"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { FunctionComponent, useMemo } from "react"
import TextEditorView from "../../app/cards/agentEditor/View"
import AuthView from "../../app/cards/auth/View"
import EditorCodeView from "../../app/cards/editorCode/View"
import ReflectionView from "../../app/cards/reflection/node/View"
import AccountDetailView from "../../app/cards/user/detail/View"
import AccountListView from "../../app/cards/user/list/ListView"
import { AccountListStore } from "../../stores/stacks/account/list"
import { ReflectionStore } from "../../stores/stacks/reflection"
import ChatDetailView from "@/app/cards/chat/detail/View"
import { ChatDetailStore } from "@/stores/stacks/chat/detail"
import { RoomAgentsListStore } from "@/stores/stacks/room/detail/roomAgentsList"



interface DocCmpProps {
	view: ViewStore,
}

/** Seleziona il contenuto da visualizzare in base al tipo di VIEW */
const PolymorphicCard: FunctionComponent<DocCmpProps> = ({
	view,
}) => {
	const content = useMemo(() => {
		switch (view.state.type) {

			case DOC_TYPE.AUTH_DETAIL:
				return <AuthView store={view as AuthDetailStore} />

			case DOC_TYPE.ACCOUNT_FINDER:
				return <AccountFinderView store={view as AccountFinderStore} />
			case DOC_TYPE.ACCOUNT_LIST:
				return <AccountListView store={view as AccountListStore} />
			case DOC_TYPE.ACCOUNT_DETAIL:
				return <AccountDetailView store={view as AccountDetailStore} />



			case DOC_TYPE.CHAT_DETAIL:
				return <ChatDetailView store={view as ChatDetailStore} />
			case DOC_TYPE.CHAT_LIST:
				return <ChatListView store={view as ChatListStore} />

			case DOC_TYPE.ROOM_DETAIL:
				return <RoomView store={view as RoomDetailStore} />
			case DOC_TYPE.ROOM_LIST:
				return <RootListView store={view as PromptListStore} />
			case DOC_TYPE.ROOM_AGENT_LIST:
				return <RoomAgentListView store={view as RoomAgentsListStore} />



			case DOC_TYPE.REFLECTION:
				return <ReflectionView store={view as ReflectionStore} />

			case DOC_TYPE.AGENT_EDITOR:
				return <TextEditorView store={view as AgentEditorStore} />

			case DOC_TYPE.AGENT:
				return <AgentView store={view as AgentDetailStore} />

			case DOC_TYPE.LLM_LIST:
				return <LlmListView store={view as LlmListStore} />
			case DOC_TYPE.LLM_DETAIL:
				return <LlmDetailView store={view as LlmDetailStore} />

			case DOC_TYPE.MCP_SERVER_LIST:
				return <McpServerListView store={view as McpServerListStore} />
			case DOC_TYPE.MCP_SERVER_DETAIL:
				return <McpServerDetailView store={view as McpServerDetailStore} />
			case DOC_TYPE.MCP_TOOL_DETAIL:
				return <McpToolDetailView store={view as McpToolDetailStore} />
			case DOC_TYPE.MCP_TOOL_RESULT_LIST:
				return <ToolResultListView store={view as ToolResultListStore} />

			case DOC_TYPE.TOOL_LIST:
				return <ToolListView store={view as ToolListStore} />
			case DOC_TYPE.TOOL_DETAIL:
				return <ToolDetailView store={view as ToolDetailStore} />

			case DOC_TYPE.CODE_EDITOR:
				return <EditorCodeView store={view as EditorCodeStore} />


			default:
				return null
		}
	}, [view])
	return content
}

export default PolymorphicCard