import { AgentDetailStore } from "@/stores/stacks/agent/detail"
import { EDIT_STATE } from "@/types"
import { Button, CircularLoadingCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import cls from "./View.module.css"
import { buildPromptDetailNew } from "@/stores/stacks/prompt/factory"



interface Props {
	store?: AgentDetailStore
	style?: React.CSSProperties
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
	style,
}) => {

	// STORE
	useStore(store.state.group)
	const agentDetailSa = useStore(store)

	// HOOKs

	// HANDLER
	const handleEditClick = async () => store.setEditState(EDIT_STATE.EDIT)
	const handleCancelClick = () => store.restore()
	const handleSaveClick = async () => store.save()
	const handlePromptClick = () => {
		const view = buildPromptDetailNew(store.state.agent?.id)
		store.state.group.addLink({ view, parent: store, anim: true })
	}


	// LOADING
	if (agentDetailSa.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}

	// RENDER
	if (agentDetailSa.editState == EDIT_STATE.NEW) {
		return <div
			className={cls.actions}
			style={style}
		>
			<Button
				children="CREATE"
				onClick={handleSaveClick}
			/>
		</div>

	} else if (agentDetailSa.editState == EDIT_STATE.READ) {
		return <div
			className={cls.actions}
			style={style}
		>
			<Button
				children="EDIT"
				onClick={handleEditClick}
			/>
			<Button
				children="PROMPT"
				onClick={handlePromptClick}
			/>
		</div>
	}

	return (<div
		className={cls.actions}
		style={style}
	>
		<Button
			children="SAVE"
			onClick={handleSaveClick}
		/>
		<Button
			children="CANCEL"
			onClick={handleCancelClick}
		/>
	</div>)
}

export default ActionsCmp
