import FrameworkCard from "@/components/cards/FrameworkCard"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import ConnectionIcon from "@/icons/cards/ConnectionIcon"
import clsGreen from "../../CardGreen.module.css"
import McpToolDetailActions from "./Actions"
import McpToolDetailForm from "./Form"
import { McpToolDetailStore } from "@/stores/stacks/mcpTool/detail"



interface Props {
	store?: McpToolDetailStore
}

const McpToolDetailView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)


	// HOOKs

	
	// HANDLER

	
	// RENDER
	return <FrameworkCard
		className={clsGreen.root}
		icon={<ConnectionIcon />}
		store={store}
		actionsRender={<McpToolDetailActions store={store} />}
		iconizedRender={
			<div className="lyt-v lyt-v-btts">
			</div>
		}
	>

		<McpToolDetailForm store={store} />

	</FrameworkCard>
}

export default McpToolDetailView
