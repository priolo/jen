import { SugarEditor } from "@/stores/stacks/editor/slate/withSugar";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import { FunctionComponent, useCallback } from "react";
import { RenderElementProps, useFocused, useSelected, useSlate } from "slate-react";
import Drop from "./Drop";
import { ElementCode, NODE_TYPES } from "../../../../stores/stacks/editor/slate/types";
import { Editor, Element, Node, NodeEntry } from "slate";
import { normalizeTokens } from "../utils/normalize-tokens";



interface Props extends RenderElementProps {
	element: ElementCode
}

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

	// RENDER
	const haveFocus = selected && focused


	return <Drop 
		attributes={attributes}
		element={element}
		style={{ position: 'relative' }}
        spellCheck={false} 
	>
		{children}
	</Drop>
}

export default Code



export const useDecorate = (editor: Editor) => {
	return useCallback(
	  ([node, path]) => {
		if (Element.isElement(node) && node.type === NODE_TYPES.CODE) {
		  const ranges = editor.nodeToDecorations.get(node) || []
		  return ranges
		}
  
		return []
	  },
	  [editor.nodeToDecorations]
	)
  }
  
  const getChildNodeToDecorations = ([
	block,
	blockPath,
  ]: NodeEntry<any>) => {
	const nodeToDecorations = new Map<Element, Range[]>()
  
	const text = block.children.map(line => Node.string(line)).join('\n')
	const language = block.language ?? 'javascript'
	const tokens = Prism.tokenize(text, Prism.languages[language])
	const normalizedTokens = normalizeTokens(tokens) // make tokens flat and grouped by line
	const blockChildren = block.children as Element[]
  
	for (let index = 0; index < normalizedTokens.length; index++) {
	  const tokens = normalizedTokens[index]
	  const element = blockChildren[index]
  
	  if (!nodeToDecorations.has(element)) {
		nodeToDecorations.set(element, [])
	  }
  
	  let start = 0
	  for (const token of tokens) {
		const length = token.content.length
		if (!length) {
		  continue
		}
  
		const end = start + length
  
		const path = [...blockPath, index, 0]
		const range = {
		  anchor: { path, offset: start },
		  focus: { path, offset: end },
		  token: true,
		  ...Object.fromEntries(token.types.map(type => [type, true])),
		}
  
		nodeToDecorations.get(element)!.push(range)
  
		start = end
	  }
	}
  
	return nodeToDecorations
  }
  
  // precalculate editor.nodeToDecorations map to use it inside decorate function then
  export const SetNodeToDecorations = () => {
	const editor = useSlate()
  
	const blockEntries = Array.from(
	  Editor.nodes(editor, {
		at: [],
		mode: 'highest',
		match: n => Element.isElement(n) && n.type === NODE_TYPES.CODE,
	  })
	)
  
	const nodeToDecorations = mergeMaps(
	  ...blockEntries.map(getChildNodeToDecorations)
	)
  
	editor.nodeToDecorations = nodeToDecorations
  
	return null
  }

  
const mergeMaps = <K, V>(...maps: Map<K, V>[]) => {
	const map = new Map<K, V>()
  
	for (const m of maps) {
	  for (const item of m) {
		map.set(...item)
	  }
	}
  
	return map
  }
  
//   const toChildren = (content: string) => [{ text: content }]
//   const toCodeLines = (content: string): Element[] =>
// 	content
// 	  .split('\n')
// 	  .map(line => ({ type: NODE_TYPES.CODE, children: toChildren(line) }))
  