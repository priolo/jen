
import { AgentDetailState, AgentDetailStore } from "@/stores/stacks/agent"
import llmSo from "@/stores/stacks/llm/repo"
import toolSo from "@/stores/stacks/tool/repo"
import { Llm } from "@/types/Llm"
import { Tool } from "@/types/Tool"
import { Dialog, List, ListMultiWithFilter, ListMultiWithFilter2 } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo, useState } from "react"



interface Props {
	store?: AgentDetailStore
}

const LlmDialog: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const state = useStore(store) as AgentDetailState

	// HOOKs

	// HANDLER
	const handleClose = () => {
		store.setLlmDialogOpen(false)
	}
	const handleSelect = (index: number, e) => {
		const llm = llmSo.state.all[index]
		store.setAgent({
			...state.agent,
			llm: llm
		})
		//store.setLlmDialogOpen(false)
	}

	// RENDER

	const llm = llmSo.state.all
	const indexSelect = useMemo(() =>
		llmSo.state.all?.findIndex((llm) => llm.id === state.agent.llm?.id) ?? -1
		, [llmSo.state.all, state.agent.llm?.id]
	)

	return (
		<Dialog
			className="var-dialog"
			store={store}
			title={"LLM"}
			width={85}
			open={state.llmDialogOpen}
			onClose={handleClose}
		>
			<div className="lyt-form">
				<List<Llm>
					items={llm}
					onSelect={handleSelect}
					select={indexSelect}
					RenderRow2={(item) => item.name}
				/>
			</div>
		</Dialog>
	)
}

export default LlmDialog

