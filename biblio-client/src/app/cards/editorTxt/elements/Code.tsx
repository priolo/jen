import { ElementCode } from "@/stores/stacks/editor/slate/types";
import { SugarEditor } from "@/stores/stacks/editor/slate/withSugar";
import { CopyButton, IconButton } from "@priolo/jack";
import { FunctionComponent } from "react";
import { Node } from "slate";
import { RenderElementProps, useFocused, useSelected, useSlate } from "slate-react";
import ArrowRightIcon from "../../../../icons/ArrowRightIcon";
import cls from "./Code.module.css";
import Drop from "./Drop";
import { buildCodeEditor } from "../../../../stores/stacks/editorCode/factory";
// import Prism from "prismjs";
// import "prismjs/themes/prism.css";


interface Props extends RenderElementProps {
	element: ElementCode
}

// const highlightCode = (code: string, language: string) => {
// 	if (Prism.languages[language]) {
// 		return Prism.highlight(code, Prism.languages[language], language);
// 	}
// 	return code;
// };

const Code: FunctionComponent<Props> = ({
	attributes,
	element,
	children,
}) => {

	// HOOKs
	const editor = useSlate() as SugarEditor
	const selected = useSelected()
	const focused = useFocused()

	// HANDLERS
	const handleOpen = () => {
		// let view: ViewStore = getById(GetAllCards(), element.data?.uuid)
		// if (!!view) {
		// 	view.state.group?.focus(view)
		// 	return
		// }
		const text = Node.string(element)
		const view = buildCodeEditor(text)
		if (!view) return
		editor.store.state.group.addLink({ view, parent: editor.store, anim: true })
	}
	const handleCopy = () => Node.string(element)

	// RENDER
	const haveFocus = selected && focused
	const clsRoot = `${cls.root} ${haveFocus ? cls.focus : ''} jack-hover-container`
	const clsBtt = `${cls.btt} jack-hover-hide`

	return <Drop 
		attributes={attributes}
		element={element}
		className={`${clsRoot} language-${element.language}`} 
	>
		<code>{children}</code>
		{/* <div className={clsBtt}>
			<CopyButton value={handleCopy} />
			<IconButton 
				onClick={handleOpen}
			><ArrowRightIcon /></IconButton>
		</div> */}
	</Drop>
}

export default Code

