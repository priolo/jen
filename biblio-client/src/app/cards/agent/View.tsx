import FrameworkCard from "@/components/cards/FrameworkCard"
import { AgentDetailStore } from "@/stores/stacks/agent"
import agentSo from "@/stores/stacks/agent/repo"
import llmSo from "@/stores/stacks/llm/repo"
import toolSo from "@/stores/stacks/tool/repo"
import { Agent, AGENT_TYPE } from "@/types/Agent"
import { Tool } from "@/types/Tool"
import { IconToggle, ListDialog, ListDialog2, ListMultiDialog, MarkdownEditor, StringUpRow, TextInput, TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo, useState, useEffect } from "react"
import EditorIcon from "../../../icons/EditorIcon"
import clsCard from "../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import LlmDialog from "./LlmDialog"
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
		// Fetch agents if not already loaded
		agentSo.fetchIfVoid()
	}, [])

	// HANDLER
	// const handleTypeChange = (index: number) => {
	// 	const type = Object.values(AGENT_TYPE)[index]
	// 	store.setAgent({ ...store.state.agent, type })
	// }

	const handleLlmChange = (index: number) => {
		const llm = llmSo.state.all[index]
		store.setAgent({ ...store.state.agent, llm })
	}

	const handleBaseAgentChange = (id: string) => {
		store.setAgent({ ...store.state.agent, base: { id } })
	}

	const handleNameChange = (name: string) => {
		store.setAgent({ ...store.state.agent, name })
	}

	const handleChangeAgentsSelect = (ids: number[]) => {
		setAgentsSelect(ids)
	}
	const handleChangeToolsSelect = (ids: number[]) => {
		setToolsSelect(ids)
	}

	// RENDER
	const llm = useMemo(() => llmSo.state.all?.map(llm => llm.name) ?? [], [llmSo.state.all])
	const indexSelect = useMemo(() =>
		llmSo.state.all?.findIndex((llm) => llm.id === store.state.agent.llm?.id) ?? -1
		, [llmSo.state.all, store.state.agent.llm?.id]
	)

	
	const agents = useMemo(() => agentSo.state.all ?? [], [agentSo.state.all])
	const agentBaseId = store.state.agent?.base?.id
	const [agentsSelect, setAgentsSelect] = useState<number[]>([])

	const tools = useMemo(() => toolSo.state.all ?? [], [toolSo.state.all])
	const [toolsSelect, setToolsSelect] = useState<number[]>([])



	//const agents = useMemo(() => agentSo.state.all?.map(llm => llm.name) ?? [], [llmSo.state.all]) 

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
				<ListDialog width={80}
					store={store}
					select={indexSelect}
					items={llm}
					//RenderRow={StringUpRow}
					//readOnly={inRead || !inNew}
					onSelect={handleLlmChange}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">BASE</div>
				<ListDialog2
					store={store}
					select={agentBaseId}
					items={agents}
					fnGetId={(item: Agent) => item?.id}
					fnGetString={(item: Agent) => item?.name}
					onChangeSelect={handleBaseAgentChange}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">TOOLS</div>
				<ListMultiDialog
					store={store}
					items={tools}
					selects={toolsSelect}
					onChangeSelect={handleChangeToolsSelect}
					fnGetId={(item: Tool) => item.id}
					fnGetString={(item: Tool) => item.name}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">AGENTS</div>
				<ListMultiDialog
					store={store}
					items={agents}
					selects={agentsSelect}
					onChangeSelect={handleChangeAgentsSelect}
					fnGetId={(item: Agent) => item.id}
					fnGetString={(item: Agent) => item.name}
				/>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">ASK INFORMATION</div>
				<IconToggle
					check={store.state.agent.askInformation ?? false}
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
				<MarkdownEditor
					value={store.state.agent.description ?? ""}
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

		<LlmDialog store={store} />

	</FrameworkCard>
}

export default AgentView
