import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { Button, CircularLoadingCmp, docsSo, utils } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import cls from "./View.module.css"
import { DOC_TYPE } from "@/types"



interface Props {
	store?: RoomDetailStore
	style?: React.CSSProperties
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
	style,
}) => {

	// STORE
	useStore(store.state.group)
	useStore(store)


	// HOOKs


	// HANDLER


	// LOADING
	if (store.state.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}


	// RENDER
	const canInvite = useMemo(() => {
		const result = utils.forEachViews(
			store.state.group.state.all,
			view => view.state.type == DOC_TYPE.ACCOUNT_DETAIL,
		)
		return result
	}, [store.state.group.state.all])

	return (<div
		className={cls.actions}
		style={style}
	>
		{canInvite && <Button
		//onClick={() => store.openGroupSettings()}
		>INVITE</Button>}
	</div>)
}

export default ActionsCmp
