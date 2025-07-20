import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { CircularLoadingCmp } from "@priolo/jack"
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
	const roomDetailSa = useStore(store)


	// HOOKs


	// HANDLER
	

	// LOADING
	if (roomDetailSa.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}

	
	// RENDER
	return (<div
		className={cls.actions}
		style={style}
	>
		
	</div>)
}

export default ActionsCmp
