import { ElementType } from "@/components/slate/elements/doc/types"
import { FunctionComponent } from "react"
import { Node } from "slate"
import { RenderElementProps, useFocused, useSelected } from "slate-react"
import Drop from "./Drop"
import styles from "./PromptElement.module.css"



const PromptElement: FunctionComponent<RenderElementProps> = ({
	attributes,
	element,
	children,
}) => {

	// HOOKS
	const selected = useSelected()
	const focused = useFocused()

	// RENDER
	const elementType = element as ElementType
	const text = Node.string(elementType)
	const cssFormat = text.startsWith("#") ? styles.chapter : ""
	const cnRoot = `${styles.root} ${selected && focused ? styles.focus : ''}`

	return <Drop
		attributes={attributes}
		element={element}
		className={cnRoot}
	>
		{children}
	</Drop>
}

export default PromptElement