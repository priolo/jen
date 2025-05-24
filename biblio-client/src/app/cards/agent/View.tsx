import FrameworkCard from "@/components/cards/FrameworkCard"
import SendIcon from "@/icons/SendIcon"
import { AgentDetailStore } from "@/stores/stacks/agent"
import { codeOnKeyDown } from "@/stores/stacks/agent/utils/onkeydown"
import { Accordion, Button, FloatButton, List, ListDialog, ListMultiDialog, TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import Prism from "prismjs"
import { FunctionComponent, useMemo, useState } from "react"
import { Text } from "slate"
import { Editable, Slate } from "slate-react"
import EditorIcon from "../../../icons/EditorIcon"
import clsCard from "../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import PromptElement from "./elements/PromptElement"
import BiblioLeaf from "./leafs/BiblioLeaf"
import RoleDialog from "./RoleDialog"
import cls from "./View.module.css"
import ToolsDialog from "./ToolsDialog"
import LlmDialog from "./LlmDialog"
import llmSo from "@/stores/stacks/llm/repo"
import { Agent } from "@/types/Agent"
import agentSo from "@/stores/stacks/agent/repo"
import toolSo from "@/stores/stacks/tool/repo"
import { Tool } from "@/types/Tool"



interface Props {
	store?: AgentDetailStore
}

const AgentView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)

	// HOOKs
	const [open, setOpen] = useState(false)

	// HANDLER
	const handleFocus = () => {
		//store.setFormatOpen(true)
	}
	const handleBlur = () => {
		//store.setFormatOpen(false)
	}
	const handleStartDrag = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
	}

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		//biblioOnKeyDown(event, editor)
		codeOnKeyDown(event, editor)
	}

	const handleCopy = (event: React.ClipboardEvent<HTMLDivElement>) => {
		editor.onCopy(event.nativeEvent);
	}

	const handleLlmChange = (index: number) => {
		const llm = llmSo.state.all[index]
		store.setAgent({
			...store.state.agent,
			llm: llm
		})
	}

	const handleChangeAgentsSelect = (ids: number[]) => {
		setAgentsSelect(ids)
	}
	const handleChangeToolsSelect = (ids: number[]) => {
		setToolsSelect(ids)
	}

	
	// RENDER
	const editor = store.state.editor

	const llm = useMemo(() => llmSo.state.all?.map(llm => llm.name) ?? [], [llmSo.state.all]) 
	const indexSelect = useMemo(() =>
		llmSo.state.all?.findIndex((llm) => llm.id === store.state.agent.llm?.id) ?? -1
		, [llmSo.state.all, store.state.agent.llm?.id]
	)

	const agents = useMemo(() => agentSo.state.all ?? [], [agentSo.state.all]) 
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

		<TitleAccordion title="STATS" open={false}>

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
		</TitleAccordion>

		<Slate
			editor={editor}
			initialValue={store.state.initValue}
		>
			{/* <ActionsCmp store={store} style={{ margin: '-10px -10px 5px -10px' }} /> */}
			<Editable
				decorate={decorateMD}
				className={`${cls.editor} code-editor`}
				style={{ flex: 1, overflowY: "auto" }}
				spellCheck={false}
				renderElement={props => <PromptElement {...props} />}
				renderLeaf={props => <BiblioLeaf {...props} />}
				onKeyDown={handleKeyDown}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onDragStart={handleStartDrag}
				onCopy={handleCopy}
			/>
		</Slate>

		<RoleDialog store={store} />
		<ToolsDialog store={store} />
		<LlmDialog store={store} />

		<FloatButton
			style={{ position: "absolute", right: 20, bottom: 20 }}
			onClick={() => console.log("click float")}
			disabled={false}
		><SendIcon /></FloatButton>

	</FrameworkCard>
}

export default AgentView

const decorateMD = ([node, path]) => {
	const ranges = []
	if (!Text.isText(node)) return ranges

	// helper per calcolare lunghezza token
	const getLength = token =>
		typeof token === 'string'
			? token.length
			: typeof token.content === 'string'
				? token.content.length
				: token.content.reduce((l, t) => l + getLength(t), 0)

	// Prism tokenizza il testo in base alla grammatica Markdown
	const tokens = Prism.tokenize(node.text, Prism.languages.markdown)
	let start = 0

	for (const token of tokens) {
		const length = getLength(token)
		const end = start + length

		if (typeof token !== 'string') {
			ranges.push({
				[token.type]: true,
				anchor: { path, offset: start },
				focus: { path, offset: end }
			})
		}
		start = end
	}

	return ranges
}
