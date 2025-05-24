import FrameworkCard from "@/components/cards/FrameworkCard"
import { ToolDetailStore } from "@/stores/stacks/tool/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ConnectionIcon from "../../../../icons/cards/ConnectionIcon"
import clsGreen from "../../CardGreen.module.css"
import ToolDetailActions from "./Actions"
import ToolDetailForm from "./Form"



interface Props {
	store?: ToolDetailStore
}

const ToolDetailView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)


	// HOOKs
	useEffect(() => {
		store.fetchIfVoid()
	}, [])


	// HANDLER

	
	// RENDER
	return <FrameworkCard
		className={clsGreen.root}
		icon={<ConnectionIcon />}
		store={store}
		actionsRender={<ToolDetailActions store={store} />}
		iconizedRender={
			<div className="lyt-v lyt-v-btts">
			</div>
		}
	>

		<ToolDetailForm store={store} />

	</FrameworkCard>
}

export default ToolDetailView
