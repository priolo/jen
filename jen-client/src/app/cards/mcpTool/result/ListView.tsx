import FrameworkCard from "@/components/cards/FrameworkCard"
import EditorIcon from "@/icons/EditorIcon"
import { ToolResultListStore } from "@/stores/stacks/mcpTool/resultList"
import toolResultsSo from "@/stores/stacks/mcpTool/resultsRepo"
import { AlertDialog } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import clsCard from "../../CardCyanDef.module.css"
import ToolResultCmp from "../ToolResultCmp"
import ToolRequestCmp from "../ToolRequestCmp"
import { ToolResult } from "@/stores/stacks/mcpTool/types"




interface Props {
	store?: ToolResultListStore
}


/**
 * CARD che visualizza la lista dei risultati delle esecuzioni di uno specifico TOOL
 */
const ToolResultListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(toolResultsSo)


	// HOOKs
	const toolResults = useMemo(() => {
		return toolResultsSo.state.all
			.filter((result => result.mcpServerId == store?.state.mcpServerId && result.mcpToolName == store?.state.toolName))
	}, [toolResultsSo.state.all, store?.state.mcpServerId])


	// HANDLER
	const handleResultClick = (result: ToolResult) => {
		store?.onParentSelect(result)
	}


	// RENDER
	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		iconizedRender={null}
		actionsRender={<></>}
	>
		<div className={clsCard.content}>
			{toolResults?.map((result, index) => {
				return <div key={index} className={clsCard.item}>

					<div
						onClick={() => handleResultClick(result)}
					>{result.mcpToolName}</div>

					<ToolRequestCmp
						request={result.request}
					/>

					{result.response?.content?.map((content, idx) => (
						<ToolResultCmp
							key={idx}
							content={content}
						/>
					))}

				</div>
			})}
		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default ToolResultListView


