import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { EDIT_STATE } from "@/types"
import { Button, CircularLoadingCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import cls from "./View.module.css"



interface Props {
	store?: RoomDetailStore
	style?: React.CSSProperties
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
	style,
}) => {

	// STORE
	useStore(store.state.group)
	const roomDetailSa = useStore(store)


	// HOOKs


	// HANDLER
	const handleEditClick = async () => store.setEditState(EDIT_STATE.EDIT)
	const handleCancelClick = () => store.restore()
	const handleSaveClick = async () => store.save()
	

	// LOADING
	if (roomDetailSa.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}

	
	// RENDER
	if (roomDetailSa.editState == EDIT_STATE.NEW) {
		return <div
			className={cls.actions}
			style={style}
		>
			{store.state.roomState}
			<Button
				children="CREATE"
				onClick={handleSaveClick}
			/>
		</div>

	} else if (roomDetailSa.editState == EDIT_STATE.READ) {
		return <div
			className={cls.actions}
			style={style}
		>
			<Button
				children="EDIT"
				onClick={handleEditClick}
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
