
import { AgentDetailState, AgentDetailStore } from "@/stores/stacks/agent/detail"
import toolSo from "@/stores/stacks/tool/repo"
import { Tool } from "@/types/Tool"
import { Dialog, ListMultiWithFilter2 } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"



interface Props {
	store?: AgentDetailStore
}

const ToolsDialog: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store) as AgentDetailState

	// HOOKs

	// HANDLER
	const handleClose = () => {
		store.setToolsDialogOpen(false)
	}
	const handleSelect = (ids: string[]) => {
		store.setAgent({ ...store.state.agent, 
			tools: ids.map((id) => toolSo.state.all.find((tool) => tool.id === id))
		})
	}

	// RENDER

	const tools = toolSo.state.all
	const ids = store.state.agent?.tools?.map((tool) => tool.id) ?? []

	return (
		<Dialog
			className="var-dialog"
			store={store}
			title={"TOOLS"}
			width={85}
			open={store.state.toolsDialogOpen}
			onClose={handleClose}
		>
			<div className="lyt-form">
				<ListMultiWithFilter2
					items={tools}
					selects={ids}
					onChangeSelects={handleSelect}
					fnGetId={(item: Tool) => item.id}
					fnGetString={(item: Tool) => item.name}
				/>
			</div>
		</Dialog>
	)
}

export default ToolsDialog

