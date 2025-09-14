import CardIcon from "@/components/cards/CardIcon"
import FrameworkCard from "@/components/cards/FrameworkCard"
import { AccountListStore } from "@/stores/stacks/account/list"
import accountSo from "@/stores/stacks/account/repo"
import { DOC_TYPE } from "@/types"
import { Account } from "@/types/User"
import { AlertDialog, Table } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"



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
	useStore(accountSo)
	useStore(store.state.group)

	// HOOKs
	useEffect(() => {
		accountSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleSelect = (account: Account) => store.openDetail(account.id)

	// RENDER
	const accounts = store.getFiltered() ?? []

	return <FrameworkCard styleBody={{ padding: 0, }}
		icon={<CardIcon type={DOC_TYPE.ACCOUNT_LIST} />}
		store={store}
		actionsRender={<>
			{/* <OptionsCmp
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={store}
			/>
			<FindInputHeader
				value={state.textSearch}
				onChange={text => store.setTextSearch(text)}
			/> */}
		</>}
	>
		<Table
			items={accounts}
			props={[
				{ label: "NAME", getValue: s => s.name, isMain: true },
				{ label: "E-MAIL", getValue: s => s.email },
			]}
			//selectId={idSelected}
			onSelectChange={handleSelect}
			getId={item => item.id}
			//singleRow={store.getWidth() > 430}
		/>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default AccountListView
