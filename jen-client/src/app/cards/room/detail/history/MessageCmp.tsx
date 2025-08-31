import { LlmResponse } from "@/types/commons/LlmResponse"
import { ChatMessage } from "@/types/commons/RoomActions.js"
import { FunctionComponent } from "react"
import ContentCmp from "./ContentCmp"
import cls from "./MessageCmp.module.css"



interface Props {
	message: ChatMessage
	onAskToClick?: ()=>void

}

const MessageCmp: FunctionComponent<Props> = ({
	message,
	onAskToClick,
}) => {


	// HANDLER
	

	// RENDER
	const role = message.role
	const response = (message.content as LlmResponse)

	return (
		<div className={cls.historyItem}>
			<div className={cls.historyRole}>{role}</div>
			{ role=="user" ? (
				<div className={cls.historyText}>{message.content as string}</div>
			) : (
				<ContentCmp response={response} onAskToClick={onAskToClick}/>
			)}
			
		</div>
	)
}

export default MessageCmp
