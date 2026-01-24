import FrameworkCard from "@/components/cards/FrameworkCard"
import ElementRow from "@/components/rows/ElementRow"
import ConnectionsIcon from "@/icons/cards/ConnectionsIcon"
import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { AccountFinderStore } from "@/stores/stacks/account/finder"
import chatSo from "@/stores/stacks/chat/ws"
import { AccountDTO } from "@/types/account"
import { AlertDialog, FindInputHeader } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"



interface Props {
	store?: AccountFinderStore
}

/**
 * Lista di ACCOUNT registrati nel sistema
 */
const AccountFinderView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(store.state.group)
	useStore(chatSo)


	// HOOKs
	useEffect(() => {
		store.fetchFiltered()
	}, [])

	// HANDLER
	const handleSelect = (account: AccountDTO) => store.openDetail(account.id)

	// RENDER
	const accounts = store.state.all
	const selectId = (store.state.linked as AccountDetailStore)?.state?.account?.id
	const isSelected = (account: AccountDTO) => account.id == selectId

	return <FrameworkCard styleBody={{ padding: 0, }}
		icon={<ConnectionsIcon />}
		store={store}
		actionsRender={<>
			<FindInputHeader
				value={store.state.textSearch}
				onChange={text => store.setTextSearch(text)}
			/>
		</>}
	>
		
		{accounts.map(account => <ElementRow
			key={account.id}
			onClick={() => handleSelect(account)}
			selected={isSelected(account)}
			title={account.name}
			subtitle={account.email}
		/>)}

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default AccountFinderView
