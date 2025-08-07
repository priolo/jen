import FrameworkCard from "@/components/cards/FrameworkCard"
import { McpServerDetailStore } from "@/stores/stacks/mcpServer/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ConnectionIcon from "../../../../icons/cards/ConnectionIcon"
import clsGreen from "../../CardGreen.module.css"
import McpServerDetailActions from "./Actions"
import McpServerDetailForm from "./Form"
import mcpServerSo from "@/stores/stacks/mcpServer/repo"



interface Props {
	store?: McpServerDetailStore
}

const McpServerDetailView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(mcpServerSo)


	// HOOKs
	useEffect(() => {
		const mcpServer = store.getMcpServer()
		if (mcpServer.tools?.length > 0) return
		mcpServerSo.fetchResources(store.state.mcpServer?.id)
	}, [])


	// HANDLER


	// RENDER
	return <FrameworkCard
		className={clsGreen.root}
		icon={<ConnectionIcon />}
		store={store}
		actionsRender={<McpServerDetailActions store={store} />}
		iconizedRender={
			<div className="lyt-v lyt-v-btts">
			</div>
		}
	>

		<McpServerDetailForm store={store} />

	</FrameworkCard>
}

export default McpServerDetailView
