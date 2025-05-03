import { ElementType, NODE_TYPES } from "@/stores/stacks/editor/slate/types"
import { FunctionComponent } from "react"
import { RenderElementProps } from "slate-react"
import Card, { CardProps } from "./Card"
import Chapter from "./Chapter"
import Code from "./Code"
import Paragraph from "./Paragraph"
import Text from "./Text"



interface Props extends RenderElementProps {
}

const BiblioElement: FunctionComponent<Props> = (props) => {

	const element = props.element as ElementType
	switch (element.type) {
		case NODE_TYPES.CHAPTER:
			return <Chapter {...props} />
		case NODE_TYPES.PARAGRAPH:
			return <Paragraph {...props} />
		case NODE_TYPES.CARD:
			return <Card {...props as CardProps} />
		// case BLOCK_TYPE.IMAGE:
		// 	return <Image {...props} />
		 case NODE_TYPES.CODE:
		 	return <Code {...props} />
		case NODE_TYPES.TEXT:
		default:
			return <Text {...props} />
	}
}

export default BiblioElement