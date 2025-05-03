import { SugarEditor } from "@/stores/stacks/editor/slate/withSugar"
import { mouseSo } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, HTMLProps } from "react"
import { ReactEditor, RenderElementProps, useSlate } from "slate-react"
import cls from "./Drop.module.css"



const Drop: FunctionComponent<RenderElementProps & HTMLProps<HTMLDivElement>> = ({
	attributes,
	element,
	children,
	className,
	...props
}) => {

	// STORES
	const mouseSa = useStore(mouseSo)

	// HOOKs
	const editor = useSlate() as SugarEditor

	// HANDLERS
	const handleMouseOver = (_: React.DragEvent<HTMLDivElement>) => {
		if (!mouseSo.state.drag?.source?.view) return
		const path = ReactEditor.findPath(editor, element)
		mouseSo.setDrag({ ...mouseSo.state.drag, destination: { view: editor.store, index: path?.[0] } })
	}
	const handleMouseLeave = () => {
		if (!mouseSo.state.drag?.source?.view) return
		mouseSo.setDrag({ ...mouseSo.state.drag, destination: null })
	}

	// RENDER
	const clsDrag = !!mouseSa.drag?.source ? cls.drag : ""
	const cnRoot = `${clsDrag} ${className}`

	return <div {...attributes}
		className={cnRoot}
		onMouseOver={handleMouseOver}
		onMouseLeave={handleMouseLeave}
		{...props}
	>
		{children}
	</div>
}

export default Drop