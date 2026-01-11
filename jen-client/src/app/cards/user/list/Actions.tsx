import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { AccountFinderStore } from "@/stores/stacks/account/finder"
import { AccountListStore } from "@/stores/stacks/account/list"
import chatSo from "@/stores/stacks/chat/repo"
import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { DOC_TYPE } from "@/types"
import { Button, CircularLoadingCmp, focusSo, TooltipWrapCmp, utils } from "@priolo/jack"
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


	// HOOKs


	// HANDLER

	const handleInviteClick = () => {
		const roomId = (store.state.parent as RoomDetailStore)?.state.roomId
		const room = chatSo.getRoomById(roomId)
		chatSo.invite({
			chatId: room?.chatId,
			accountId: accountInvite.id
		})
	}


	// LOADING
	if (store.state.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}


	// RENDER
	const accountInvite = useMemo(() => {
		const fw = focusSo.state.view
		let AccountView: AccountDetailStore = null
		if (!!fw) {
			AccountView = fw?.state.type == DOC_TYPE.ACCOUNT_FINDER && fw.state.linked?.state.type == DOC_TYPE.ACCOUNT_DETAIL ? fw.state.linked as AccountDetailStore : null
			if (!AccountView) {
				AccountView = fw?.state.type == DOC_TYPE.ACCOUNT_DETAIL ? fw as AccountDetailStore : null
			} else if (!AccountView.state.account?.email) {
				return (fw as AccountFinderStore).state.all.find(a => a.id == AccountView.state.account?.id)
			}
		}
		if (!AccountView) {
			AccountView = utils.forEachViews(
				store.state.group.state.all,
				view =>
					view.state.parent != store && view.state.type == DOC_TYPE.ACCOUNT_DETAIL ? view as AccountDetailStore : null,
			)
		}
		return AccountView?.state.account
	}, [store.state.group.state.all, focusSo.state.view])

	return (<div

		style={style}
	>
		{!!accountInvite ? (
			<TooltipWrapCmp content={`Invite ${accountInvite.name} in chat room`}>
				<Button
					onClick={handleInviteClick}
				>INVITE</Button>
			</TooltipWrapCmp>
		) : (
			<Button
			//onClick={() => store.openGroupSettings()}
			>FIND</Button>
		)}
	</div>)
}

export default ActionsCmp
