import { AccountFinderFixedCard } from "@/plugins/session"
import { deckCardsSo } from "@/stores/docs/cards"
import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { AccountListStore } from "@/stores/stacks/account/list"
import chatWSSo from "@/stores/stacks/chat/ws"
import { DOC_TYPE } from "@/types"
import { AccountDTO } from "@/types/account"
import { Button, CircularLoadingCmp, FindInputHeader, focusSo, TooltipWrapCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"



interface Props {
	store?: AccountListStore
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

	const handleInviteClick = (account: AccountDTO) => {
		store.invite(account.id)
	}

	const handleFindClick = async () => {
		await deckCardsSo.add({ view: AccountFinderFixedCard, anim: true })
		focusSo.focus(AccountFinderFixedCard)
	}

	const handleRemoveClick = () => {
		store.remove(selecteId)
	}


	// RENDER
	const accountInvite = useMemo(() => {
		if (!AccountFinderFixedCard) return null

		// se c'e l'ACCOUNT FINDER è in un desk, prendo da li l'ACCOUNT selezionato
		let accountSelect = AccountFinderFixedCard.getAccountSelected()

		// se non lo trovo prendo la card ACCOUNT DETAIL se ha il FOCUS
		if (!accountSelect && focusSo.state.view?.state.type == DOC_TYPE.ACCOUNT_DETAIL) {
			accountSelect = (focusSo.state.view as AccountDetailStore).state.account
		}

		return accountSelect
	}, [AccountFinderFixedCard?.state.linked, store.state.group.state.all, focusSo.state.view])

	const chat = chatWSSo.getChatById(store.state.chatId)
	const selecteId = (store.state.linked as AccountDetailStore)?.state?.accountId


	if (store.state.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}

	const tooltip = !chat ?
		"OPEN A CHAT ROOM TO ENABLE INVITE" :
		`INVITE ${accountInvite?.name?.toUpperCase()} IN CHAT ROOM`

	return <>

		<FindInputHeader
			value={store.state.textSearch}
			onChange={text => store.setTextSearch(text)}
		/>

		{!!accountInvite ? (
			<TooltipWrapCmp content={tooltip}>
				<Button
					onClick={() => handleInviteClick(accountInvite)}
				>INVITE</Button>
			</TooltipWrapCmp>
		) : (
			<Button
				onClick={handleFindClick}
			>FIND</Button>
		)}
		{!!selecteId && (
			<Button
				style={{ marginLeft: 5 }}
				onClick={handleRemoveClick}
			>DELETE</Button>
		)}
	</>

}

export default ActionsCmp
