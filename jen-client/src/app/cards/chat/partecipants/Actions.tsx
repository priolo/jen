import { AccountFinderFixedCard } from "@/plugins/session"
import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { ChatPartecipantsListStore } from "@/stores/stacks/chat/partecipantsList"
import { Button, CircularLoadingCmp, FindInputHeader, focusSo } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: ChatPartecipantsListStore
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store.state.group)
	useStore(store)
	useStore(focusSo)
	useStore(AccountFinderFixedCard)


	// HOOKs


	// HANDLER
	const handleAdd = async () => store.openFind()
	const handleRemove = () => store.remove(selecteId)


	// RENDER
	const addSelected = store.isAddSelected()
	const selecteId = (store.state.linked as AccountDetailStore)?.state?.accountId

	if (store.state.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}

	return <>

		<FindInputHeader
			value={store.state.textSearch}
			onChange={text => store.setTextSearch(text)}
		/>

		<div style={{ display: "flex" }} >
			<Button
				children="ADD"
				onClick={handleAdd}
				select={addSelected}
			/>
			{!!selecteId && (
				<Button
					children="DEL"
					onClick={handleRemove}
				/>
			)}
		</div>

	</>
}

export default ActionsCmp
