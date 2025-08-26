import { ChatMessage } from "@/types/commons/RoomActions.js"
import { FunctionComponent } from "react"
import cls from "./MessageCmp.module.css"
import { ContentAskTo, ContentCompleted, ContentReasoning, ContentStrategy, ContentTool, LLM_RESPONSE_TYPE, LlmResponse } from "@/types/commons/LlmResponse"

interface MessageProps {
	message: ChatMessage
}

const MessageCmp: FunctionComponent<MessageProps> = ({
	message,
}) => {

	const response = (message.content as LlmResponse)
	if (!(response?.content)) return null

	return (
		<div className={cls.historyItem}>
			<div className={cls.historyRole}>{message.role}</div>
			<div style={{ display: "flex", flexDirection: "column" }}>
				<div>{response.type}</div>
				{{
					[LLM_RESPONSE_TYPE.ASK_TO]: <div className={cls.historyText}>{(response.content as ContentAskTo)?.question}</div>,
					[LLM_RESPONSE_TYPE.TOOL]: <div className={cls.historyText}>
						{JSON.stringify((response.content as ContentTool)?.result)}
					</div>,
					[LLM_RESPONSE_TYPE.COMPLETED]: <div className={cls.historyText}>{(response.content as ContentCompleted)?.answer}</div>,
					[LLM_RESPONSE_TYPE.STRATEGY]: <div className={cls.historyText}>{(response.content as ContentStrategy)?.strategy}</div>,
					[LLM_RESPONSE_TYPE.REASONING]: <div className={cls.historyText}>{(response.content as ContentReasoning)?.thought}</div>,
				}[response.type] ?? null}
			</div>
		</div>
	)
}

export default MessageCmp
