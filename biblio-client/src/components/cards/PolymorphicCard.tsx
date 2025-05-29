import { AboutStore } from "@/stores/stacks/about"
import { TextEditorStore } from "@/stores/stacks/editor"
import { EditorCodeStore } from "@/stores/stacks/editorCode"
import { HelpStore } from "@/stores/stacks/help"
import { ViewLogStore } from "@/stores/stacks/log"
import { UsersStore } from "@/stores/stacks/streams"
import { UserStore } from "@/stores/stacks/streams/detail"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { FunctionComponent, useMemo } from "react"
import AboutView from "../../app/cards/about/View"
import UserView from "../../app/cards/account/View"
import EditorCodeView from "../../app/cards/editorCode/View"
import TextEditorView from "../../app/cards/editorTxt/View"
import HelpView from "../../app/cards/help/View"
import LogsView from "../../app/cards/mainLogs/View"
import ReflectionView from "../../app/cards/reflection/node/View"
import UserDetailView from "../../app/cards/user/detail/View"
import StreamsListView from "../../app/cards/user/list/ListView"
import { AccountStore } from "../../stores/stacks/account"
import { ReflectionStore } from "../../stores/stacks/reflection"
import { AgentDetailStore } from "@/stores/stacks/agent/detail"
import AgentView from "@/app/cards/agent/detail/View"
import { AgentListStore } from "@/stores/stacks/agent/list"
import AgentListView from "@/app/cards/agent/ListView"
import { LlmListStore } from "@/stores/stacks/llm/list"
import LlmListView from "@/app/cards/llm/ListView"
import LlmDetailView from "@/app/cards/llm/detail/View"
import { LlmDetailStore } from "@/stores/stacks/llm/detail"
import ToolListView from "@/app/cards/tool/ListView"
import { ToolListStore } from "@/stores/stacks/tool/list"
import ToolDetailView from "@/app/cards/tool/detail/View"
import { ToolDetailStore } from "@/stores/stacks/tool/detail"
import { PromptDetailStore } from "@/stores/stacks/prompt/detail"
import { PromptListStore } from "@/stores/stacks/prompt/list"
import PromptListView from "@/app/cards/prompt/ListView"
import PromptView from "@/app/cards/prompt/detail/View"



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

			case DOC_TYPE.LOGS:
				return <LogsView store={view as ViewLogStore} />
			case DOC_TYPE.ABOUT:
				return <AboutView store={view as AboutStore} />
			case DOC_TYPE.REFLECTION:
				return <ReflectionView store={view as ReflectionStore} />

			case DOC_TYPE.TEXT_EDITOR:
				return <TextEditorView store={view as TextEditorStore} />

			case DOC_TYPE.PROMPT_DETAIL:
				return <PromptView store={view as PromptDetailStore} />
			case DOC_TYPE.PROMPT_LIST:
				return <PromptListView store={view as PromptListStore} />

			case DOC_TYPE.AGENT:
				return <AgentView store={view as AgentDetailStore} />
			case DOC_TYPE.AGENT_LIST:
				return <AgentListView store={view as AgentListStore} />

			case DOC_TYPE.LLM_LIST:
				return <LlmListView store={view as LlmListStore} />
			case DOC_TYPE.LLM_DETAIL:
				return <LlmDetailView store={view as LlmDetailStore} />

			case DOC_TYPE.TOOL_LIST:
				return <ToolListView store={view as ToolListStore} />
			case DOC_TYPE.TOOL_DETAIL:
				return <ToolDetailView store={view as ToolDetailStore} />

			case DOC_TYPE.CODE_EDITOR:
				return <EditorCodeView store={view as EditorCodeStore} />
			case DOC_TYPE.HELP:
				return <HelpView store={view as HelpStore} />

			case DOC_TYPE.ACCOUNT:
				return <UserView store={view as AccountStore} />

			default:
				return null
		}
	}, [view])
	return content
}

export default PolymorphicCard