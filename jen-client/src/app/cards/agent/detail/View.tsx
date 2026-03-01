import FrameworkCard from "@/components/cards/FrameworkCard"
import ArrowRightIcon from "@/icons/ArrowRightIcon"
import { deckCardsSo } from "@/stores/docs/cards"
import { AgentDetailStore } from "@/stores/stacks/agent/detail"
import agentSo from "@/stores/stacks/agent/repo"
import { buildLlmList } from "@/stores/stacks/llm/factory"
import llmSo from "@/stores/stacks/llm/repo"
import toolSo from "@/stores/stacks/tool/repo"
import { EDIT_STATE } from "@/types"
import { AgentLlm } from "@/types/Agent"
import { Component, IconToggle, ListMultiDialog, MarkdownEditor, TextInput, TitleAccordion } from "@priolo/jack"
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
		store.fetchIfVoid()
	}, [])

	// [II] magari elimino il concetto di base agent
	const baseAgents = useMemo(() =>
		agentSo.getAllBaseAgents(store.state.agent?.id),
		[agentSo.state.all, store.state.agent]
	)


	// HANDLER
	const handleLlmChange = (llmId: string) => {
		store.setAgent({ ...store.state.agent, llmId })
	}
	const handleBaseAgentChange = (baseId: string) => {
		store.setAgent({ ...store.state.agent, baseId })
	}
	const handleNameChange = (name: string) => {
		store.setAgent({ ...store.state.agent, name })
	}
	const handleAgentsSelectChange = (subAgentsIds: string[]) => {
		store.setAgent({ ...store.state.agent, subAgentsIds })
	}
	const handleToolsSelectChange = (toolsIds: string[]) => {
		store.setAgent({ ...store.state.agent, toolsIds })
	}


	// RENDER
	const inRead = store.state.editState == EDIT_STATE.READ
	const inNew = store.state.editState == EDIT_STATE.NEW

	if (!store.state.agent) return null

	const llm = llmSo.state.all ?? []
	const llmSelectedId = store.state.agent.llmId
	const llmSelected = llm.find(item => item.id == llmSelectedId)

	const agents = agentSo.state.all ?? []
	const agentBaseId = store.state.agent?.baseId
	const subAgentsSelected = store.state.agent?.subAgentsIds ?? []

	const toolsSelected = store.state.agent?.toolsIds ?? []
	const tools = toolSo.state.all ?? []

	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		actionsRender={<ActionsCmp store={store} />}
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
				
				<div className="jack-lbl-prop"
					onClick={() => {
						const view = buildLlmList()
						deckCardsSo.add({ view, anim: true })
					}}
				>LLM</div>

				<Component
					onClick={()=> store.openLlmCard()}
					enterRender={<ArrowRightIcon style={{ opacity: 0.5 }} />}
				>{llmSelected?.code}</Component>


				{/* <ListDialog2
					store={store}
					select={llmSelectedId}
					items={llm}
					readOnly={inRead}
					fnGetId={(item: LlmDTO) => item?.id}
					fnGetString={(item: LlmDTO) => item?.code}
					onChangeSelect={handleLlmChange}
				/> */}
			</div>
{/* 
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
			</div> */}

			<div className="lyt-v">
				<div className="jack-lbl-prop">TOOLS</div>
				{/* <ListMultiDialog
					store={store}
					items={tools}
					selects={toolsSelected}
					readOnly={inRead}
					onChangeSelect={handleToolsSelectChange}
					fnGetId={(item: Tool) => item.id}
					fnGetString={(item: Tool) => item?.name}
				/> */}
				<Component
					onClick={()=> store.openToolsCard()}
					enterRender={<ArrowRightIcon style={{ opacity: 0.5 }} />}
				>{toolsSelected?.join(", ") ?? "--"}</Component>
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
					fnGetString={(item: AgentLlm) => item?.name}
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
