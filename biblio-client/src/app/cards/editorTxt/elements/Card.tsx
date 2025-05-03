import CardIcon from "@/components/cards/CardIcon"
import ArrowRightIcon from "@/icons/ArrowRightIcon"
import CloseIcon from "@/icons/CloseIcon"
import { GetAllCards, deckCardsSo } from "@/stores/docs/cards"
import { buildStore } from "@/stores/docs/utils/factory"
import { getById } from "@/stores/docs/utils/manage"
import { ElementCard } from "@/stores/stacks/editor/slate/types"
import { SugarEditor } from "@/stores/stacks/editor/slate/withSugar"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { IconButton, mouseSo } from "@priolo/jack"
import { FunctionComponent } from "react"
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlate } from "slate-react"
import cls from "./Card.module.css"
import Drop from "./Drop"



export interface CardProps extends RenderElementProps {
	element: ElementCard
}

const Card: FunctionComponent<CardProps> = ({
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
		// trovo la CARD nel DECK
		let view: ViewStore = getById(GetAllCards(), element.data?.uuid)
		if (!!view) {
			view.state.group?.focus(view)
			return
		}

		// non la trovo... la creo e la metto
		view = buildStore({ 
			...element.data,
			type: element.data.type, 
			group: deckCardsSo, 
		})
		if (!view) return
		view.setSerialization(element.data)
		editor.store.state.group.addLink({ view, parent: editor.store, anim: true })
	}
	const handleRemove = () => {
		const path = ReactEditor.findPath(editor, element)
		editor.removeNodes({ at: path })
	}
	const handleClick = () => {
		const path = ReactEditor.findPath(editor, element)
		editor.select(path)
	}
	const handleDragStart: React.DragEventHandler = (e) => {
		e.preventDefault();
		const path = ReactEditor.findPath(editor, element)
		mouseSo.setPosition({ x: e.clientX, y: e.clientY })
		mouseSo.startDrag({ source: { view: editor.store, index: path?.[0] } })
	}

	// RENDER
	const clsFocus = selected && focused ? cls.focus : ''
	const clsRoot = `${cls.root} ${clsFocus} hover-container`
	const styColor = "var(--cmp-select-bg)"//`var(--var-${element.colorVar})`
	const cardType: DOC_TYPE = element.data.type as DOC_TYPE

	return <Drop
		attributes={attributes}
		element={element}
		contentEditable={false}
		draggable
		className={clsRoot}
		onDragStart={handleDragStart}
		onClick={handleClick}
	>

		<CardIcon type={cardType} style={{ color: styColor }} />

		<div className={cls.label}>
			<div className={cls.title}>
				{children}
			</div>
			<div className={cls.subtitle}>
				{element.subtitle}
			</div>
		</div>

		<IconButton
			className={`${cls.bttClose} hover-show`}
			onClick={handleRemove}
		><CloseIcon /></IconButton>

		<IconButton
			onClick={handleOpen}
		><ArrowRightIcon /></IconButton>

	</Drop>
}

export default Card