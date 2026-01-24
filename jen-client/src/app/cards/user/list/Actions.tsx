import { AccountFinderFixedCard } from "@/plugins/session"
import { deckCardsSo } from "@/stores/docs/cards"
import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { AccountListStore } from "@/stores/stacks/account/list"
import chatWSSo from "@/stores/stacks/chat/ws"
import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { DOC_TYPE } from "@/types"
import { AccountDTO } from "@/types/account"
import { Button, CircularLoadingCmp, focusSo, TooltipWrapCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"



interface Props {
	store?: AccountListStore
	style?: React.CSSProperties
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
	style,
}) => {

	// STORE
	useStore(store.state.group)
	useStore(store)
	useStore(focusSo)
	useStore(AccountFinderFixedCard)


	// HOOKs


	// HANDLER

	const handleInviteClick = (account: AccountDTO) => {
		const roomId = (store.state.parent as RoomDetailStore)?.state.roomId
		const room = chatWSSo.getRoomById(roomId)
		chatWSSo.invite({
			chatId: room?.chatId,
			accountId: account.id
		})
	}

	const handleFindClick = async () => {
		await deckCardsSo.add({ view: AccountFinderFixedCard, anim: true })
		focusSo.focus(AccountFinderFixedCard)
	}


	// RENDER
	const accountInvite = useMemo(() => {
		if ( !AccountFinderFixedCard) return null
		
		// se c'e l'ACCOUNT FINDER è in un desk, prendo da li l'ACCOUNT selezionato
		let accountSelect = AccountFinderFixedCard.getAccountSelected()

		// se non lo trovo prendo la card ACCOUNT DETAIL se ha il FOCUS
		if (!accountSelect && focusSo.state.view?.state.type == DOC_TYPE.ACCOUNT_DETAIL) {
			accountSelect = (focusSo.state.view as AccountDetailStore).state.account
		}

		return accountSelect
	}, [AccountFinderFixedCard?.state.linked, store.state.group.state.all, focusSo.state.view])


	if (store.state.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}

	return (
		<div style={style}>
			{!!accountInvite ? (
				<TooltipWrapCmp content={`INVITE ${accountInvite.name.toUpperCase()} IN CHAT ROOM`}>
					<Button
						onClick={() => handleInviteClick(accountInvite)}
					>INVITE</Button>
				</TooltipWrapCmp>
			) : (
				<Button
					onClick={handleFindClick}
				>FIND</Button>
			)}
		</div>
	)
}

export default ActionsCmp
