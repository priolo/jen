import FrameworkCard from "@/components/cards/FrameworkCard"
import EditorCode from "@/components/editor"
import { EditorCodeState, EditorCodeStore } from "@/stores/stacks/editorCode"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import cls from "./View.module.css"
import clsCard from "../CardCyanDef.module.css"
import MessageIcon from "../../../icons/cards/MessageIcon"
import ActionsCmp from "./Actions"



interface Props {
	store?: EditorCodeStore
}

/** dettaglio di un messaggio */
const EditorCodeView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const state = useStore(store) as EditorCodeState

	// HOOKs

	// HANDLER

	// RENDER

	return <FrameworkCard
		className={clsCard.root}
		icon={<MessageIcon />}
		store={store}
		actionsRender={<>
			<ActionsCmp store={store} />
		</>}
	>
		<div className={`lyt-form ${cls.form}`}>

			<EditorCode autoFormat
				//readOnly
				//ref={ref => state.editorRef = ref}
				//format={state.format}
				value={store.state.code}
			/>

		</div>

		{/* <FormatDialog store={store} /> */}

	</FrameworkCard>
}

export default EditorCodeView
