import FrameworkCard from "@/components/cards/FrameworkCard"
import { TextEditorStore } from "@/stores/stacks/editor"
import { biblioOnKeyDown } from "@/stores/stacks/editor/utils/onkeydown"
import { useStore } from "@priolo/jon"
import Prism from "prismjs"
import { FunctionComponent } from "react"
import { Node } from "slate"
import { Editable, Slate } from "slate-react"
import EditorIcon from "../../../icons/EditorIcon"
import clsCard from "../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import cls from "./View.module.css"
import BiblioElement from "./elements/BiblioElement"
import BiblioLeaf from "./leafs/BiblioLeaf"



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
		biblioOnKeyDown(event, editor)
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
				decorate={decorateCode}
				className={`${cls.editor} code-editor`}
				style={{ flex: 1, overflowY: "auto" }}
				spellCheck={false}
				renderElement={props => <BiblioElement {...props} />}
				renderLeaf={props => <BiblioLeaf {...props} />}
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

const decorateCode = ([node, path]) => {
	const ranges = []
	if (node.type === 'code') {
		console.log("decorateCode")
		const text = Node.string(node)
		const tokens = Prism.tokenize(text, Prism.languages.javascript)
		let start = 0

		for (const token of tokens) {
			const length = token.length
			const end = start + length

			if (typeof token !== 'string') {
				ranges.push({
					anchor: { path, offset: start },
					focus: { path, offset: end },
					className: `token ${token.type}`,
				})
			}

			start = end
		}
	}
	return ranges
}

// const decorateCode = ([node, path]) => {
// 	const ranges = []
// 	if (node.type === 'code') {
// 	  const text = Node.string(node)
// 	  const language = 'javascript' // Cambia questa riga per supportare altri linguaggi
// 	  const { value } = hljs.highlight(text, { language })
// 	  const tokens = value.split(/\r\n|\r|\n/
	  
// 	  let start = 0
// 	  for (const token of tokens) {
// 		const length = token.length
// 		const end = start + length
  
// 		const tokenClasses = token.match(/class="([^"]+)"/)?.[1]
// 		if (tokenClasses) {
// 		  ranges.push({
// 			anchor: { path, offset: start },
// 			focus: { path, offset: end },
// 			className: tokenClasses,
// 		  })
// 		}
  
// 		start = end + 1 // +1 per il carattere di nuova riga
// 	  }
// 	}
// 	return ranges
//   }