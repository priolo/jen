import { Button, IconButton, TextInput, ListDialog } from "@priolo/jack"
import LinkIcon from "@/icons/LinkIcon"
import { TextEditorStore } from "@/stores/stacks/editor"
import { NODE_CODE_SIZE, NODE_TYPES, NodeType } from "@/stores/stacks/editor/slate/types"
import { SugarEditor } from "@/stores/stacks/editor/slate/withSugar"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"
import { ReactEditor, useSlate } from "slate-react"
import cls from "./View.module.css"
import { Editor, Node, Transforms } from "slate"



interface Props {
	store?: TextEditorStore
	style?: React.CSSProperties
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
	style,
}) => {

	// STORE
	const state = useStore(store)

	// HOOKs
	const editor = useSlate() as SugarEditor
	const [url, setUrl] = useState("")

	// HANDLER
	const handleFormatClose = () => {
		store.setFormatOpen(false)
	}
	const handleBold = (e) => {
		e.preventDefault()
		editor.addMark('bold', !isBold)
		ReactEditor.focus(editor)
	}
	const handleItalic = (e) => {
		e.preventDefault()
		editor.addMark('italic', !isItalic)
		ReactEditor.focus(editor)
	}
	const handleCode = (e) => {
		e.preventDefault()
		editor.addMark('code', true)
		ReactEditor.focus(editor)
	}
	const handleLink = (e) => {
		e.preventDefault()
		editor.addMark('link', !isLink)
		ReactEditor.focus(editor)
	}
	const handleUrlChange = (value: string) => {
		setUrl(value)
		editor.addMark('url', value)
	}
	const handleUrlOpen = () => {
		const url = (!/^https?:\/\//i.test(urlMark) ? 'http://' : "") + urlMark;
		window.open(url, '_blank');
	}


	const handleChapter = (e) => {
		e.preventDefault()
		editor.setTypeOnSelect(NODE_TYPES.CHAPTER)
		ReactEditor.focus(editor)
	}
	const handleParagraph = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		editor.setTypeOnSelect(NODE_TYPES.PARAGRAPH)
		ReactEditor.focus(editor)
	}
	const handleText = (e) => {
		e.preventDefault()
		editor.setTypeOnSelect(NODE_TYPES.TEXT)
		//Transforms.setNodes<NodeType>(state.editor, { type: NODE_TYPES.TEXT }, { split: false })
		ReactEditor.focus(editor)
	}
	const handleBlockCode = (e) => {
		e.preventDefault()
		editor.setTypeOnSelect(NODE_TYPES.CODE)
		ReactEditor.focus(editor)
	}

	const handleToggleCodeSize = (e) => {
		// const selectA = editor.selection.anchor.path[0]
		// const path = [selectA]
		// const currentNode = editor.children[selectA]

		const path = ReactEditor.findPath(editor, node)
		const newShow = node.size == NODE_CODE_SIZE.COLLAPSED ? NODE_CODE_SIZE.WINDOW
			: node.size == NODE_CODE_SIZE.WINDOW ? NODE_CODE_SIZE.FULL
				: node.size == NODE_CODE_SIZE.FULL ? NODE_CODE_SIZE.COLLAPSED : NODE_CODE_SIZE.FULL
		editor.setNodes(
			{ size: newShow },
			{ at: path }
		)
	}
	const handleLang = (index: number) => {
		const path = ReactEditor.findPath(editor, node)
		editor.setNodes(
			{ lang: languages[index] },
			{ at: path }
		)
	}
	// const handleImageCode = (e) => {
	// 	e.preventDefault()
	// 	editor.setTypeOnSelect(NODE_TYPES.IMAGE)
	// 	ReactEditor.focus(editor)
	// }



	const newChildren = [
		{ type: 'paragraph', children: [{ text: 'Nuovo paragrafo' }] },
		{ type: 'text', children: [{ text: 'normalissimo testo innocuo' }] },
	];
	const handleOTest = (e) => {
		e.preventDefault()
		e.stopPropagation()

		// Salva la selezione corrente
		const currentSelection = editor.selection

		const start = Editor.start(editor, []);
		const end = Editor.end(editor, []);
		const range = { anchor: start, focus: end };
		Transforms.removeNodes(editor, { at: range });
		Transforms.insertNodes(editor, newChildren, { at: [0] });


		// Ripristina la selezione originale, se esisteva
		if (currentSelection) {
			// Assicurati che la selezione sia ancora valida nel nuovo contenuto
			const lastValidPosition = Editor.end(editor, [])
			const newAnchor = {
				path: currentSelection.anchor.path,
				offset: Math.min(currentSelection.anchor.offset, lastValidPosition.offset)
			}
			const newFocus = {
				path: currentSelection.focus.path,
				offset: Math.min(currentSelection.focus.offset, lastValidPosition.offset)
			}
			const newSelection = {
				anchor: newAnchor,
				focus: newFocus
			}
			Transforms.select(editor, newSelection)
		}

		ReactEditor.focus(editor);
	}




	// RENDER
	const node = editor.selection ? editor.node(editor.selection.focus, { depth: 1 })?.[0] as NodeType : null
	const type = node?.type
	const marks = editor.getMarks()
	const isBold = marks?.["bold"] === true
	const isItalic = marks?.["italic"] === true
	const isLink = marks?.["link"] === true
	const urlMark = marks?.["url"] ?? ""

	const languages = ["javascript", "typescript", "html", "xml"]

	return (<div
		className={cls.actions}
		style={style}
	>


		{type == NODE_TYPES.CODE ? <>
			<Button
				onClick={handleToggleCodeSize}
			>T</Button>
			{/* <Button
				onClick={handleLang}
			>L</Button> */}
			<ListDialog width={80}
				store={store}
				select={languages.indexOf(node.lang) ?? 0}
				items={languages}
				onSelect={handleLang}
			/>
		</> : <>
			<Button
				onClick={handleOTest}
			>O</Button>

			<Button select={isBold}
				onClick={handleBold}
			>B</Button>
			<Button select={isItalic}
				style={{ fontStyle: "italic" }}
				onClick={handleItalic}
			>I</Button>
			<Button select={isLink}
				onClick={handleLink}
			>L</Button>
		</>}

		<div className="lbl-divider-v2" />

		<div style={{ display: "flex", flex: 1, gap: 5 }}>
			{isLink ? <>
				<TextInput style={{ flex: 1, backgroundColor: "#3f3d3d" }}
					value={urlMark}
					onChange={handleUrlChange}
				/>
				<IconButton style={{ padding: 5 }}
					onClick={handleUrlOpen}
				><LinkIcon /></IconButton>
			</> : <>
				<Button select={type == NODE_TYPES.CHAPTER}
					onClick={handleChapter}
				>CHAPTER</Button>
				<Button select={type == NODE_TYPES.PARAGRAPH}
					onClick={handleParagraph}
				>PARAGRAPH</Button>
				<Button select={type == NODE_TYPES.TEXT}
					onClick={handleText}
				>TEXT</Button>
				<Button select={type == NODE_TYPES.CODE}
					onClick={handleBlockCode}
				>CODE</Button>
				{/* <Button select={type == NODE_TYPES.IMAGE}
			onClick={handleImageCode}
			>IMAGE</Button> */}
			</>}
		</div>


	</div>)
}

export default ActionsCmp
