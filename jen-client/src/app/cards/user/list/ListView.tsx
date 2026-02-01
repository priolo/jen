import CardIcon from "@/components/cards/CardIcon"
import FrameworkCard from "@/components/cards/FrameworkCard"
import OnlineIcon from "@/components/OnlineIcon"
import ElementRow from "@/components/rows/ElementRow.js"
import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { AccountListStore } from "@/stores/stacks/account/list"
import chatWSSo from "@/stores/stacks/chat/ws"
import { DOC_TYPE } from "@/types"
import { ACCOUNT_STATUS, AccountDTO } from "@/types/account"
import { AlertDialog } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import ActionsCmp from "./Actions"
import chatRepoSo from "@/stores/stacks/chat/repo"



interface Props {
	store?: AccountListStore
}

/**
 * Lista di ACCOUNT registrati nel sistema
 */
const AccountListView: FunctionComponent<Props> = ({
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
		actionsRender={<>
			{/* <OptionsCmp
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={store}
			/> */}
			
			<ActionsCmp store={store} />
		</>}
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

export default AccountListView


// <div>
// 	{isSelected(clients)? "***" : ""} {clients.name} - {clients.status == ACCOUNT_STATUS.ONLINE ? "ONLINE" : "OFFLINE"}
// </div>
