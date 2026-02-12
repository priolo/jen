import { AccountFinderFixedCard } from "@/plugins/session"
import { deckCardsSo } from "@/stores/docs/cards"
import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { ChatPartecipantsListStore } from "@/stores/stacks/chat/partecipantsList"
import chatRepoSo from "@/stores/stacks/chat/repo"
import { DOC_TYPE } from "@/types"
import { Button, CircularLoadingCmp, FindInputHeader, focusSo, TooltipWrapCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { AccountDTO } from "@shared/types/AccountDTO"
import { FunctionComponent, useMemo } from "react"



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

	const handleInvite = (account: AccountDTO) => {
		store.invite(account.id)
	}

	const handleFind = async () => {
		await deckCardsSo.add({ view: AccountFinderFixedCard, anim: true })
		focusSo.focus(AccountFinderFixedCard)
	}

	const handleRemove = () => {
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

	const chat = chatRepoSo.getById(store.state.chatId)
	
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
					onClick={() => handleInvite(accountInvite)}
				>INVITE</Button>
			</TooltipWrapCmp>
		) : (
			<Button
				onClick={handleFind}
			>FIND</Button>
		)}
		{!!selecteId && (
			<Button
				style={{ marginLeft: 5 }}
				onClick={handleRemove}
			>DELETE</Button>
		)}
	</>

}

export default ActionsCmp
