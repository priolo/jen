import AgentListView from "@/app/cards/agent/ListView"
import AgentView from "@/app/cards/agent/detail/View"
import LlmListView from "@/app/cards/llm/ListView"
import LlmDetailView from "@/app/cards/llm/detail/View"
import RootListView from "@/app/cards/room/ListView"
import RoomView from "@/app/cards/room/detail/View"
import ToolListView from "@/app/cards/tool/ListView"
import ToolDetailView from "@/app/cards/tool/detail/View"
import { AgentDetailStore } from "@/stores/stacks/agent/detail"
import { AgentListStore } from "@/stores/stacks/agent/list"
import { AgentEditorStore } from "@/stores/stacks/agentEditor"
import { EditorCodeStore } from "@/stores/stacks/editorCode"
import { LlmDetailStore } from "@/stores/stacks/llm/detail"
import { LlmListStore } from "@/stores/stacks/llm/list"
import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { PromptListStore } from "@/stores/stacks/room/list"
import { UsersStore } from "@/stores/stacks/streams"
import { UserStore } from "@/stores/stacks/streams/detail"
import { ToolDetailStore } from "@/stores/stacks/tool/detail"
import { ToolListStore } from "@/stores/stacks/tool/list"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { FunctionComponent, useMemo } from "react"
import UserView from "../../app/cards/account/View"
import EditorCodeView from "../../app/cards/editorCode/View"
import TextEditorView from "../../app/cards/agentEditor/View"
import ReflectionView from "../../app/cards/reflection/node/View"
import UserDetailView from "../../app/cards/user/detail/View"
import StreamsListView from "../../app/cards/user/list/ListView"
import { AccountStore } from "../../stores/stacks/account"
import { ReflectionStore } from "../../stores/stacks/reflection"
import McpServerListView from "@/app/cards/mcpServer/ListView"
import McpServerDetailView from "@/app/cards/mcpServer/detail/View"
import { McpServerListStore } from "@/stores/stacks/mcpServer/list"
import { McpServerDetailStore } from "@/stores/stacks/mcpServer/detail"
import McpToolDetailView from "@/app/cards/mcpTool/detail/View"
import { McpToolDetailStore } from "@/stores/stacks/mcpTool/detail"
import ToolResponseListView from "@/app/cards/mcpTool/response/ListView"
import { ToolResponseListStore } from "@/stores/stacks/mcpTool/responseList"



interface DocCmpProps {
	view: ViewStore,
}

/** Seleziona il contenuto da visualizzare in base al tipo di VIEW */
const PolymorphicCard: FunctionComponent<DocCmpProps> = ({
	view,
}) => {
	const content = useMemo(() => {
		switch (view.state.type) {

			case DOC_TYPE.USERS:
				return <StreamsListView store={view as UsersStore} />
			case DOC_TYPE.USER:
				return <UserDetailView store={view as UserStore} />

			case DOC_TYPE.REFLECTION:
				return <ReflectionView store={view as ReflectionStore} />

			case DOC_TYPE.AGENT_EDITOR:
				return <TextEditorView store={view as AgentEditorStore} />

			case DOC_TYPE.ROOM_DETAIL:
				return <RoomView store={view as RoomDetailStore} />
			case DOC_TYPE.ROOM_LIST:
				return <RootListView store={view as PromptListStore} />

			case DOC_TYPE.AGENT:
				return <AgentView store={view as AgentDetailStore} />
			case DOC_TYPE.AGENT_LIST:
				return <AgentListView store={view as AgentListStore} />

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
			case DOC_TYPE.MCP_TOOL_RESPONSES:
				return <ToolResponseListView store={view as ToolResponseListStore} />

			case DOC_TYPE.TOOL_LIST:
				return <ToolListView store={view as ToolListStore} />
			case DOC_TYPE.TOOL_DETAIL:
				return <ToolDetailView store={view as ToolDetailStore} />

			case DOC_TYPE.CODE_EDITOR:
				return <EditorCodeView store={view as EditorCodeStore} />

			case DOC_TYPE.ACCOUNT:
				return <UserView store={view as AccountStore} />

			default:
				return null
		}
	}, [view])
	return content
}

export default PolymorphicCard