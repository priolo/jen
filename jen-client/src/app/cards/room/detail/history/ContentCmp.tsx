import { ContentAskTo, ContentCompleted, ContentReasoning, ContentStrategy, ContentTool, LLM_RESPONSE_TYPE, LlmResponse } from "@/types/commons/LlmResponse"
import { FunctionComponent } from "react"
import cls from "./MessageCmp.module.css"
import { Button } from "@priolo/jack"



interface Props {
	response: LlmResponse
	onAskToClick?: () => void
}

const ContentCmp: FunctionComponent<Props> = ({
	response,
	onAskToClick,
}) => {


	// HANDLER

	// RENDER
	const type = Object.keys(LLM_RESPONSE_TYPE).find(key => LLM_RESPONSE_TYPE[key as keyof typeof LLM_RESPONSE_TYPE] === response.type) || response.type

	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
			<div>{type}</div>
			{{
				[LLM_RESPONSE_TYPE.ASK_TO]:
					<div style={{ display: "flex", flexDirection: "column" }}>
						<Button onClick={onAskToClick}>open</Button>
						<div>{(response.content as ContentAskTo)?.question}</div>
						<div>{(response.content as ContentAskTo)?.result}</div>
					</div>,
				[LLM_RESPONSE_TYPE.TOOL]: <div className={cls.historyText}>
					{JSON.stringify((response.content as ContentTool)?.result)}
				</div>,
				[LLM_RESPONSE_TYPE.COMPLETED]: <div className={cls.historyText}>{(response.content as ContentCompleted)?.answer}</div>,
				[LLM_RESPONSE_TYPE.STRATEGY]: <div className={cls.historyText}>{(response.content as ContentStrategy)?.strategy}</div>,
				[LLM_RESPONSE_TYPE.REASONING]: <div className={cls.historyText}>{(response.content as ContentReasoning)?.thought}</div>,
			}[response.type] ?? null}
		</div>
	)
}

export default ContentCmp
