import CardIcon from "@/components/cards/CardIcon"
import FrameworkCard from "@/components/cards/FrameworkCard"
import OnlineIcon from "@/components/OnlineIcon"
import ElementRow from "@/components/rows/ElementRow.js"
import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { ChatPartecipantsListStore } from "@/stores/stacks/chat/partecipantsList"
import chatRepoSo from "@/stores/stacks/chat/repo"
import { DOC_TYPE } from "@/types"
import { AlertDialog } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { ACCOUNT_STATUS, AccountDTO } from "@shared/types/AccountDTO"
import { FunctionComponent, useMemo } from "react"
import ActionsCmp from "./Actions"



interface Props {
	store?: ChatPartecipantsListStore
}

/**
 * Lista di ACCOUNT registrati nel sistema
 */
const ChatPartecipatsListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(store.state.group)
	useStore(chatRepoSo)

	// HOOKs
	const users = useMemo(
		() => store.getUsers(),
		[chatRepoSo.state.all]
	)

	// HANDLER
	const handleSelect = (account: AccountDTO) => store.openDetail(account.id)

	// RENDER
	const selectedId = (store.state.linked as AccountDetailStore)?.state?.accountId
	const isSelected = (account: AccountDTO) => account.id == selectedId

	return <FrameworkCard styleBody={{ padding: 0, }}
		icon={<CardIcon type={DOC_TYPE.ACCOUNT_LIST} />}
		store={store}
		actionsRender={<ActionsCmp store={store} />}
	>

		{users.map(user => <ElementRow
			key={user.id}
			icon={
				<OnlineIcon
					online={user.status == ACCOUNT_STATUS.ONLINE}
					disabled={user.status == ACCOUNT_STATUS.UNKNOWN}
				/>
			}
			selected={isSelected(user)}
			title={user.name}
			subtitle={user.email}
			onClick={() => handleSelect(user)}
		/>)}

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default ChatPartecipatsListView


// <div>
// 	{isSelected(clients)? "***" : ""} {clients.name} - {clients.status == ACCOUNT_STATUS.ONLINE ? "ONLINE" : "OFFLINE"}
// </div>
