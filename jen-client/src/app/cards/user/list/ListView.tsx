import CardIcon from "@/components/cards/CardIcon"
import FrameworkCard from "@/components/cards/FrameworkCard"
import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { AccountListStore } from "@/stores/stacks/account/list"
import chatSo from "@/stores/stacks/chat/repo"
import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { DOC_TYPE } from "@/types"
import { ACCOUNT_STATUS, AccountDTO } from "@/types/account"
import { AlertDialog, FindInputHeader } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import ActionsCmp from "./Actions"



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
	useStore(chatSo)

	// HOOKs
	const clients = useMemo(() => {
		const roomId = (store.state.parent as RoomDetailStore)?.state.roomId
		const room = chatSo.getRoomById(roomId)
		const chat = chatSo.getChatById(room?.chatId)
		return chat?.clients ?? []
	}, [chatSo.state])

	// HANDLER
	const handleSelect = (account: AccountDTO) => store.openDetail(account.id)

	// RENDER
	const selectId = (store.state.linked as AccountDetailStore)?.state?.account?.id
	const isSelected = (account: AccountDTO) => account.id == selectId
	

	return <FrameworkCard styleBody={{ padding: 0, }}
		icon={<CardIcon type={DOC_TYPE.ACCOUNT_LIST} />}
		store={store}
		actionsRender={<>
			{/* <OptionsCmp
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={store}
			/> */}
			<FindInputHeader
				value={store.state.textSearch}
				onChange={text => store.setTextSearch(text)}
			/>
			<ActionsCmp store={store} />
		</>}
	>
		{/* <Table
			items={accounts}
			props={[
				{ label: "NAME", getValue: s => s.name, isMain: true },
				{ label: "E-MAIL", getValue: s => s.email },
			]}
			//selectId={idSelected}
			onSelectChange={handleSelect}
			getId={item => item.id}
			//singleRow={store.getWidth() > 430}
		/> */}

		{clients.map(clients => {
			return (
				<div key={clients.id}
					onClick={() => handleSelect(clients)}
				>
					{isSelected(clients)? "***" : ""} {clients.name} - {clients.status == ACCOUNT_STATUS.ONLINE ? "ONLINE" : "OFFLINE"}
				</div>
			)
		})}

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default AccountListView
