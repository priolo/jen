import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { Button, CircularLoadingCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import cls from "./View.module.css"



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
	const canInvite = useMemo(() => 

	return (<div
		className={cls.actions}
		style={style}
	>
		<Button
			//onClick={() => store.openGroupSettings()}
		>INVITE</Button>
	</div>)
}

export default ActionsCmp
