import FrameworkCard from "@/components/cards/FrameworkCard"
import EditorIcon from "@/icons/EditorIcon"
import { ToolMessageListStore } from "@/stores/stacks/mcpTool/messageList"
import toolMessageSo from "@/stores/stacks/mcpTool/messageRepo"
import { AlertDialog } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import clsCard from "../../CardCyanDef.module.css"
import ToolResponseContentCmp from "../ToolResponseContentCmp"
import ToolRequestCmp from "../ToolRequestCmp"



interface Props {
	store?: ToolMessageListStore
}

const ToolMessageListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(toolMessageSo)

	
	// HOOKs
	const toolMessages = useMemo(() => {
		return toolMessageSo.state.all
	}, [toolMessageSo.state.all])


	// HANDLER


	// RENDER

	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		iconizedRender={null}
		actionsRender={<></>}
	>
		<div className={clsCard.content}>
			{toolMessages?.map((message, index) => {
				return <div key={index} className={clsCard.item}>
					
					<div>{message.mcpTool.name}</div>
					
					<ToolRequestCmp
						request={message.request}
					/>

					{message.response?.content?.map((content, idx) => (
						<ToolResponseContentCmp
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

export default ToolMessageListView


