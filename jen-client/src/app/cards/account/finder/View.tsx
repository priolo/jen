import FrameworkCard from "@/components/cards/FrameworkCard"
import ElementRow from "@/components/rows/ElementRow"
import ConnectionsIcon from "@/icons/cards/ConnectionsIcon"
import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { AccountFinderStore } from "@/stores/stacks/account/finder"
import chatWSSo from "@/stores/stacks/chat/ws"
import { AlertDialog } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { AccountDTO } from "@shared/types/AccountDTO"
import { FunctionComponent, useEffect } from "react"
import ActionsCmp from "./Actions"



interface Props {
	store?: AccountFinderStore
}

/**
 * Lista di ACCOUNT registrati nel sistema
 * Serve a cercare gli USERS
 */
const AccountFinderView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(store.state.group)
	useStore(chatWSSo)


	// HOOKs
	useEffect(() => {
		store.fetch()
	}, [])

	// HANDLER
	const handleSelect = (account: AccountDTO) => store.openDetail(account.id)

	// RENDER
	const accounts = store.state.all
	const selectId = (store.state.linked as AccountDetailStore)?.state?.accountId
	const isSelected = (account: AccountDTO) => account.id == selectId
	const isDisabled = (item: AccountDTO) => store.getParentList()?.some(t => t.id == item.id) ?? false

	return <FrameworkCard styleBody={{ padding: 0, }}
		icon={<ConnectionsIcon />}
		store={store}
		actionsRender={<ActionsCmp store={store} />}
	>
		
		{accounts.map(item => <ElementRow
			key={item.id}
			selected={isSelected(item)}
			disabled={isDisabled(item)}
			title={item.name}
			subtitle={item.email}

			onClick={() => handleSelect(item)}
		/>)}

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default AccountFinderView
