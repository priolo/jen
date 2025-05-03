import { FunctionComponent } from "react"
import { RenderElementProps, useFocused, useSelected } from "slate-react"
import Drop from "./Drop"
import styles from "./Paragraph.module.css"



interface Props extends RenderElementProps {
}

const Paragraph: FunctionComponent<Props> = ({
	attributes,
	element,
	children,
}) => {

	// HOOKs
	const selected = useSelected()
	const focused = useFocused()

	// RENDER
	const clsRoot = `${styles.root} ${selected && focused ? styles.focus : ''}`

	return <Drop
		attributes={attributes}
		element={element}
		className={clsRoot}
	>
		{children}
	</Drop>
}

export default Paragraph