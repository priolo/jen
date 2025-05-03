import { ElementCode, NODE_CODE_SIZE } from "@/stores/stacks/editor/slate/types";
import Editor, { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import { BaseEditor, Transforms } from "slate";
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlate, useSlateStatic } from "slate-react";
import { Button } from "@priolo/jack"


interface Props extends RenderElementProps {
	element: ElementCode
}

const Code: FunctionComponent<Props> = ({
	attributes,
	element,
	children,
}) => {

	// HOOK
	const [txt, setTxt] = useState(element.code ?? "")
	const editor = useSlateStatic();
	const containerRef = useRef(null)

	// HANDLER
	const toggleCollapse = () => {
		const path = ReactEditor.findPath(editor as ReactEditor, element)
		// const newShow = element.size == NODE_CODE_SIZE.COLLAPSED ? NODE_CODE_SIZE.WINDOW
		// 	: element.size == NODE_CODE_SIZE.WINDOW ? NODE_CODE_SIZE.FULL 
		// 	: element.size == NODE_CODE_SIZE.FULL ? NODE_CODE_SIZE.COLLAPSED : NODE_CODE_SIZE.FULL
		const size = element.size == NODE_CODE_SIZE.COLLAPSED ? NODE_CODE_SIZE.FULL : NODE_CODE_SIZE.COLLAPSED
		editor.setNodes(
			{ size },
			{ at: path }
		)
	}
	const handleChange = (newValue: string, ev: editor.IModelContentChangedEvent) => {
		setTxt(newValue)
		const path = ReactEditor.findPath(editor, element)
		editor.setNodes(
			{ code: newValue },
			{ at: path }
		)
	}

	const onEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {

		function updateHeight() {
			//if ( height ) return
			const lineCount = editor.getModel().getLineCount()
			const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight)
			const editorHeight = lineCount * lineHeight + 15
			containerRef.current.style.height = `${editorHeight}px`
			editor.layout()
		}
		updateHeight()

		// quando il modello nell'editor cambia
		editor.onDidChangeModelContent(() => {
			console.log("onDidChangeModelContent")
			updateHeight()
		})

		editor.onDidScrollChange((e) => {
            console.log("Scroll event detected", e);
        });

		
	}

	// RENDER
	const height = element.size == NODE_CODE_SIZE.COLLAPSED ? "200px" : undefined

	return (
		<div {...attributes}
			contentEditable={false}
		>
			<div ref={containerRef}
				onWheel={(e) => console.log("onWheel", e)}
			>
				<Button onClick={toggleCollapse}>{element.size ?? "boh"}</Button>
				<Editor
					height={height}
					language="javascript"
					theme="vs-dark"
					value={txt}
					onChange={handleChange}
					onMount={onEditorDidMount}
					options={{
						minimap: { enabled: false },
						scrollBeyondLastLine: false,
						lineNumbers: "off",
						automaticLayout: true,
					}}
				/>
			</div>

			{children}

		</div>
	)
}

export default Code

