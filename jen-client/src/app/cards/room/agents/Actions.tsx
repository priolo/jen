import { RoomAgentsListStore } from "@/stores/stacks/room/detail/roomAgentsList"
import { EDIT_STATE } from "@/types"
import { Button, CircularLoadingCmp, OptionsCmp } from "@priolo/jack"
import { FunctionComponent } from "react"
import cls from "../View.module.css"



interface Props {
	store?: RoomAgentsListStore
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	// useStore(store.state.group)
	// useStore(store)


	// HOOKs


	// HANDLER
	const handleEdit = () => store.edit()
	const handleCancel = () => store.cancel()
	const handleSave = () => store.save()



	// LOADING
	if (store.state.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}


	// RENDER
	const inEdit = store.state.editState != EDIT_STATE.READ

	return (<div
		className={cls.actions}
	>
		<OptionsCmp
			style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
			store={store}
			storeView={store}
		/>
		<div style={{ flex: 1 }} />

		{inEdit && <>
			<Button
				children="CANCEL"
				onClick={handleCancel}
			/>
			<Button
				children="SAVE"
				onClick={handleSave}
			/>
		</>}

		{!inEdit && <Button
			children="EDIT"
			onClick={handleEdit}
		/>}
	</div>)
}

export default ActionsCmp
