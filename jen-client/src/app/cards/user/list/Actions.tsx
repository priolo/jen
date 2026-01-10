import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { AccountListStore } from "@/stores/stacks/account/list"
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


	// LOADING
	if (store.state.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}


	// RENDER
	const accountInvite = useMemo(() => {
		const fw = focusSo.state.view
		let AccountView = fw?.state.type == DOC_TYPE.ACCOUNT_DETAIL ? fw as AccountDetailStore : null
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
				//onClick={() => store.openGroupSettings()}
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
