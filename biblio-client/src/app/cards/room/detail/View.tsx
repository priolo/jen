import FrameworkCard from "@/components/cards/FrameworkCard"
import SendIcon from "@/icons/SendIcon"
import agentSo from "@/stores/stacks/agent/repo"
import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { codeOnKeyDown } from "@/stores/stacks/room/detail/utils/onkeydown"
import { EDIT_STATE } from "@/types"
import { Agent } from "@/types/Agent"
import { FloatButton, ListDialog2, TextInput, TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import Prism from "prismjs"
import { FunctionComponent, useEffect } from "react"
import { Text } from "slate"
import { Editable, Slate } from "slate-react"
import EditorIcon from "../../../../icons/EditorIcon"
import clsCard from "../../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import PromptElement from "./elements/PromptElement"
import BiblioLeaf from "./leafs/BiblioLeaf"
import RoleDialog from "./RoleDialog"
import cls from "./View.module.css"



interface Props {
	store?: RoomDetailStore
}

const RoomView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)


	// HOOKs
	useEffect(() => {
		store.fetchIfVoid()
	}, [])


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

	const handleAgentChange = (agentId: string) => {
		store.setRoom({ ...store.state.room, agentId })
	}

	const handleCompleteClick = () => {
		store.execute()
	}


	// RENDER
	const editor = store.state.editor
	const agents = agentSo.state.all ?? []
	const selectedAgentId = store.state.room?.agentId
	const inRead = store.state.editState === EDIT_STATE.READ

	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		actionsRender={<ActionsCmp store={store} />}
		iconizedRender={null}
	>

		<TitleAccordion title="BASE" open={false}>
			<div className="lyt-v">
				<div className="jack-lbl-prop">AGENT</div>
				<ListDialog2
					store={store}
					select={selectedAgentId}
					items={agents}
					readOnly={inRead}
					fnGetId={(item: Agent) => item?.id}
					fnGetString={(item: Agent) => item?.name}
					onChangeSelect={handleAgentChange}
				/>
			</div>
		</TitleAccordion>

		<Slate
			editor={editor}
			initialValue={store.state.initValue}
		>
			<Editable
				readOnly={true}
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

		<TextInput
			value={store.state.prompt}
			onChange={v => store.setPrompt(v)}
			placeholder="Test input"
		/>

		<RoleDialog store={store} />

		<FloatButton
			style={{ position: "absolute", right: 20, bottom: 20 }}
			onClick={handleCompleteClick}
			disabled={false}
		><SendIcon /></FloatButton>

	</FrameworkCard>
}

export default RoomView

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