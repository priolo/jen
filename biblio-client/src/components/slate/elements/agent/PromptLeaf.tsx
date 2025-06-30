import { TextType } from "@/components/slate/elements/doc/types";
import { FunctionComponent } from "react";
import { RenderLeafProps } from "slate-react";
import cls from "./PromptLeaf.module.css";



interface Props extends RenderLeafProps {
	store: any
}

const PromptLeaf: FunctionComponent<Props> = ({
	store,
	attributes,
	leaf,
	children,
}) => {
	const leafBib = leaf as TextType
	const clsBold = leafBib.bold ? cls.bold : ""
	const clsItalic = leafBib.italic? cls.italic : ""
	const clsCode = leafBib.code ? cls.code : ""
	const clsLink = leafBib.link ? cls.link : ""
	const clsTitle = leafBib.title ? cls.title : ""
	const cnRoot = `${cls.root} ${clsTitle} ${clsBold} ${clsItalic} ${clsCode} ${clsLink}`

	return <span
		{...attributes} 
		className={cnRoot}
	>
		{children}
	</span>
}

export default PromptLeaf
