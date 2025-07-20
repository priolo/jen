import FrameworkCard from "@/components/cards/FrameworkCard"
import { mdDecor } from "@/components/slate/decorators/mdDecor"
import PromptElement from "@/components/slate/elements/agent/PromptElement"
import PromptLeaf from "@/components/slate/elements/agent/PromptLeaf"
import { docOnKeyDown } from "@/components/slate/utils/docOnKeyDown"
import SendIcon from "@/icons/SendIcon"
import { AgentEditorStore } from "@/stores/stacks/agentEditor"
import { FloatButton } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import { Editable, Slate } from "slate-react"
import EditorIcon from "../../../icons/EditorIcon"
import clsCard from "../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import cls from "./View.module.css"
import RoleDialog from "./RoleDialog"



interface Props {
	store?: AgentEditorStore
}

const AgentEditorView: FunctionComponent<Props> = ({
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
		docOnKeyDown(event, editor)
	}

	const handleCopy = (event: React.ClipboardEvent<HTMLDivElement>) => {
		editor.onCopy(event.nativeEvent);
	}

	const handleCompleteClick = () => {
		store.execute()
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
			initialValue={editor.children}
		>
			<ActionsCmp store={store} style={{ margin: '-10px -10px 5px -10px' }} />
			<Editable
				//decorate={docDecor}
				decorate={mdDecor}

				className={`${cls.editor} code-editor`}
				style={{ flex: 1, overflowY: "auto" }}
				spellCheck={false}

				// renderElement={props => <DocElement {...props} />}
				// renderLeaf={props => <DocLeaf {...props} />}
				renderElement={props => <PromptElement {...props} store={store}/>}
				renderLeaf={props => <PromptLeaf {...props} store={store}/>}

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
			onClick={handleCompleteClick}
			disabled={false}
		><SendIcon /></FloatButton>

	</FrameworkCard>
}

export default AgentEditorView


