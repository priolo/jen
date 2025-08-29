import FrameworkCard from "@/components/cards/FrameworkCard"
import { AgentDetailStore } from "@/stores/stacks/agent/detail"
import agentSo from "@/stores/stacks/agent/repo"
import llmSo from "@/stores/stacks/llm/repo"
import toolSo from "@/stores/stacks/tool/repo"
import { EDIT_STATE } from "@/types"
import { AgentLlm } from "@/types/Agent"
import { Llm } from "@/types/Llm"
import { Tool } from "@/types/Tool"
import { IconToggle, ListDialog2, ListMultiDialog, MarkdownEditor, TextInput, TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo } from "react"
import EditorIcon from "../../../../icons/EditorIcon"
import clsCard from "../../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import ToolsDialog from "./ToolsDialog"



interface Props {
	store?: AgentDetailStore
}

const AgentView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)

	// HOOKs
	useEffect(() => {
		if ( inNew ) return
		const agent = agentSo.getById(store.state.agent?.id)
		store.setAgent(agent)
	}, [])

	// [II] magari elimino il concetto di base agent
	const baseAgents = useMemo(() =>
		agentSo.getAllBaseAgents(store.state.agent?.id),
		[agentSo.state.all, store.state.agent]
	)

	// HANDLER
	// const handleTypeChange = (index: number) => {
	// 	const type = Object.values(AGENT_TYPE)[index]
	// 	store.setAgent({ ...store.state.agent, type })
	// }

	const handleLlmChange = (llmId: string) => {
		store.setAgent({ ...store.state.agent, llmId })
	}

	const handleBaseAgentChange = (baseId: string) => {
		store.setAgent({ ...store.state.agent, baseId  })
	}

	const handleNameChange = (name: string) => {
		store.setAgent({ ...store.state.agent, name })
	}

	const handleAgentsSelectChange = (ids: string[]) => {
		const subAgents: Partial<AgentLlm>[] = ids.map(id => ({ id }))
		store.setAgent({ ...store.state.agent, subAgents })
	}

	const handleToolsSelectChange = (ids: string[]) => {
		const tools: Partial<Tool>[] = ids.map(id => ({ id }))
		store.setAgent({ ...store.state.agent, tools })
	}

	// RENDER
	if ( !store.state.agent ) return null

	const llm = llmSo.state.all ?? []
	const llmSelectedId = store.state.agent.llmId

	const agents = agentSo.state.all ?? []
	const agentBaseId = store.state.agent?.baseId
	const subAgentsSelected = store.state.agent?.subAgents?.map(agent => agent.id) ?? []

	const toolsSelected = store.state.agent?.tools?.map(tool => tool.id) ?? []
	const tools = toolSo.state.all ?? []

	const inRead = store.state.editState == EDIT_STATE.READ
	const inNew = store.state.editState == EDIT_STATE.NEW


	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		actionsRender={<ActionsCmp store={store} />}
		iconizedRender={null}
	>

		<TitleAccordion title="BASE">

			<div className="lyt-v">
				<div className="jack-lbl-prop">NAME</div>
				<TextInput
					value={store.state.agent.name ?? ""}
					onChange={handleNameChange}
					placeholder="Enter agent name..."
					readOnly={inRead}
				/>
			</div>

			{/* <div className="lyt-v">
				<div className="jack-lbl-prop">TYPE</div>
				<ListDialog width={100}
					store={store}
					select={Object.values(AGENT_TYPE).indexOf(store.state.agent.type ?? AGENT_TYPE.REASONING)}
					items={Object.values(AGENT_TYPE)}
					RenderRow={StringUpRow}
					//readOnly={readOnly}
					onSelect={handleTypeChange}
				/>
			</div> */}

			<div className="lyt-v">
				<div className="jack-lbl-prop">LLM</div>
				<ListDialog2
					store={store}
					select={llmSelectedId}
					items={llm}
					readOnly={inRead}
					fnGetId={(item: Llm) => item?.id}
					fnGetString={(item: Llm) => item?.name}
					onChangeSelect={handleLlmChange}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">BASE</div>
				<ListDialog2
					store={store}
					select={agentBaseId}
					items={agents}
					readOnly={inRead}
					fnGetId={(item: AgentLlm) => item?.id}
					fnGetString={(item: AgentLlm) => item?.name}
					onChangeSelect={handleBaseAgentChange}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">TOOLS</div>
				<ListMultiDialog
					store={store}
					items={tools}
					selects={toolsSelected}
					readOnly={inRead}
					onChangeSelect={handleToolsSelectChange}
					fnGetId={(item: Tool) => item.id}
					fnGetString={(item: Tool) => item.name}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">SUB-AGENTS</div>
				<ListMultiDialog
					store={store}
					items={agents}
					selects={subAgentsSelected}
					readOnly={inRead}
					onChangeSelect={handleAgentsSelectChange}
					fnGetId={(item: AgentLlm) => item.id}
					fnGetString={(item: AgentLlm) => item.name}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">ASK INFORMATION</div>
				<IconToggle
					check={store.state.agent.askInformation ?? false}
					readOnly={inRead}
					onChange={askInformation => store.setAgent({
						...store.state.agent,
						askInformation
					})}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">KILL ON RESPONSE</div>
				<IconToggle
					check={store.state.agent.killOnResponse ?? true}
					readOnly={inRead}
					onChange={killOnResponse => store.setAgent({
						...store.state.agent,
						killOnResponse
					})}
				/>
			</div>


		</TitleAccordion>

		<TitleAccordion title="PROMPTS">

			<div className="lyt-v">
				<div className="jack-lbl-prop">DESCRIPTION</div>
				{baseAgents.map((baseAgent: AgentLlm) => (
					<div key={baseAgent.id} className="jack-lbl-prop">
						{baseAgent.name}
						<MarkdownEditor
							value={baseAgent.description ?? ""}
							readOnly={inRead}
							// onChange={text => store.setAgent({
							// 	...store.state.agent,
							// 	description: text
							// })}
							//placeholder="Enter your markdown here..."
							style={{ minHeight: '100px', marginTop: '10px' }}
						/>
					</div>
				))}

				<MarkdownEditor
					value={store.state.agent.description ?? ""}
					readOnly={inRead}
					onChange={text => store.setAgent({
						...store.state.agent,
						description: text
					})}
					//placeholder="Enter your markdown here..."
					style={{ minHeight: '100px', marginTop: '10px' }}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">SYSTEM</div>
				<MarkdownEditor
					value={store.state.agent.systemPrompt ?? ""}
					readOnly={inRead}
					onChange={text => store.setAgent({
						...store.state.agent,
						systemPrompt: text
					})}
					//placeholder="Enter your markdown here..."
					style={{ minHeight: '100px', marginTop: '10px' }}
				/>
			</div>


			<div className="lyt-v">
				<div className="jack-lbl-prop">CONTEXT</div>
				<MarkdownEditor
					value={store.state.agent.contextPrompt ?? ""}
					onChange={text => store.setAgent({
						...store.state.agent,
						contextPrompt: text
					})}
					//placeholder="Enter your markdown here..."
					style={{ minHeight: '100px', marginTop: '10px' }}
				/>
			</div>



		</TitleAccordion>

		<ToolsDialog store={store} />

		{/* <LlmDialog store={store} /> */}

	</FrameworkCard>
}

export default AgentView
