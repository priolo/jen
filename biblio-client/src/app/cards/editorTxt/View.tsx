import FrameworkCard from "@/components/cards/FrameworkCard"
import { TextEditorStore } from "@/stores/stacks/editor"
import { docOnKeyDown } from "@/components/slate/utils/docOnKeyDown"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import { Editable, Slate } from "slate-react"
import EditorIcon from "../../../icons/EditorIcon"
import clsCard from "../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import cls from "./View.module.css"
import DocElement from "../../../components/slate/elements/doc/DocElement"
import DocLeaf from "../../../components/slate/elements/doc/DocLeaf"
import { docDecor } from "@/components/slate/decorators/docDecor"
import PromptElement from "@/components/slate/elements/room/PromptElement"
import PromptLeaf from "@/components/slate/elements/room/PromptLeaf"
import { mdDecor } from "@/components/slate/decorators/mdDecor"



interface Props {
	store?: TextEditorStore
}

const EditorView: FunctionComponent<Props> = ({
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
			initialValue={[{ children: [{ text: '' }] }]}
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
				renderElement={props => <PromptElement {...props} />}
				renderLeaf={props => <PromptLeaf {...props} />}

				onKeyDown={handleKeyDown}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onDragStart={handleStartDrag}
				onCopy={handleCopy}
			/>
		</Slate>
	</FrameworkCard>
}

export default EditorView


