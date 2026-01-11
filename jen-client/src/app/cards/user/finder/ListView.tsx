import CardIcon from "@/components/cards/CardIcon"
import FrameworkCard from "@/components/cards/FrameworkCard"
import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { AccountFinderStore } from "@/stores/stacks/account/finder"
import chatSo from "@/stores/stacks/chat/repo"
import { DOC_TYPE } from "@/types"
import { AccountDTO, ACCOUNT_STATUS } from "@/types/account"
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

		{accounts.map(account => {
			return (
				<div key={account.id}
					onClick={() => handleSelect(account)}
				>
					{isSelected(account)? "***" : ""} {account.name} - {account.status == ACCOUNT_STATUS.ONLINE ? "ONLINE" : "OFFLINE"}
				</div>
			)
		})}

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default AccountFinderView
