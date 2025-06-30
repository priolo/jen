import { mouseSo } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, HTMLProps } from "react"
import { ReactEditor, RenderElementProps, useSlate } from "slate-react"
import cls from "./Drop.module.css"



interface Props extends RenderElementProps {
	store: any
}

const Drop: FunctionComponent<Props & HTMLProps<HTMLDivElement>> = ({
	store,
	attributes,
	element,
	children,
	className,
	...props
}) => {

	// STORES
	const mouseSa = useStore(mouseSo)

	// HOOKs
	const editor = useSlate()

	// HANDLERS
	const handleMouseOver = (_: React.DragEvent<HTMLDivElement>) => {
		if (!mouseSo.state.drag?.source?.view) return
		const path = ReactEditor.findPath(editor as ReactEditor, element)
		console.log( path)
		mouseSo.setDrag({ ...mouseSo.state.drag, destination: { view: store, index: path?.[0] } })
	}
	const handleMouseLeave = () => {
		if (!mouseSo.state.drag?.source?.view) return
		mouseSo.setDrag({ ...mouseSo.state.drag, destination: null })
	}
	const handleGripClick = () => {
		store.setRoleDialogOpen(true)
	}

	// RENDER
	const clsDrag = !!mouseSa.drag?.source ? cls.drag : ""
	const cnRoot = `${cls.root} ${clsDrag} ${className}`

	return <div {...attributes}
		className={cnRoot}
		onMouseOver={handleMouseOver}
		onMouseLeave={handleMouseLeave}
		{...props}
	>
		<div className={`${cls.grip} ${cls[element.type]}`} contentEditable={false}
			onClick={handleGripClick}
		>
		</div>
		<div>
			{children}
		</div>
	</div>
}

export default Drop