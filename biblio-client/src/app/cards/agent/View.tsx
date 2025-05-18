import FrameworkCard from "@/components/cards/FrameworkCard"
import { AgentStore } from "@/stores/stacks/agent"
import { biblioOnKeyDown, codeOnKeyDown } from "@/stores/stacks/agent/utils/onkeydown"
import { useStore } from "@priolo/jon"
import Prism from "prismjs"
import { FunctionComponent } from "react"
import { Node, Text } from "slate"
import { Editable, Slate } from "slate-react"
import EditorIcon from "../../../icons/EditorIcon"
import clsCard from "../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import cls from "./View.module.css"
import PromptElement from "./elements/PromptElement"
import BiblioLeaf from "./leafs/BiblioLeaf"
import RoleDialog from "./RoleDialog"
import { FloatButton } from "@priolo/jack"
import SendIcon from "@/icons/SendIcon"



interface Props {
	store?: AgentStore
}

const AgentView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)

	// HOOKs

	// HANDLER
	const handleFocus = () => {
		store.setFormatOpen(true)
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

	// const handleValueChange = () => {
	// 	store.onValueChange()
	// }

	// RENDER
	const editor = store.state.editor

	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		//actionsRender={<ActionsCmp store={store} />}
		iconizedRender={null}
	>
		<Slate
			editor={editor}
			initialValue={store.state.initValue}
		>
			<ActionsCmp store={store} style={{ margin: '-10px -10px 5px -10px' }} />
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
