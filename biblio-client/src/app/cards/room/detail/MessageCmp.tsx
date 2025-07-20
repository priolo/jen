import { ChatMessage } from "@/types/RoomActions"
import { FunctionComponent } from "react"
import cls from "./MessageCmp.module.css"

interface MessageProps {
	message: ChatMessage
}

const MessageCmp: FunctionComponent<MessageProps> = ({
	message,
}) => {

	const content = !!message
		? (Array.isArray(message?.content) ? message.content : [message.content])
		: []

	return (
		<div className={cls.historyItem}>
			<div className={cls.historyRole}>{message.role}</div>
			<div style={{ display: "flex", flexDirection: "column" }}>
				{content.map((item, index) => {

					const type = typeof item == "string" ? "string" : item.type

					return {
						"string": <div key={index} className={cls.historyText}>{item}</div>,
						"tool-call": (
							<div key={index} style={{ display: "flex", flexDirection: "column" }}>
								{message.subroomId && (
									<div className={cls.historyText}>Subroom: {message.subroomId}</div>
								)}
								<div key={item.toolCallId} className={cls.historyText}>Tool Call: {item.toolName}</div>
								{Object.entries(item?.args ?? {}).map(([key, value]: [string, string]) => (
									<div key={key} className={cls.historyText}>{key}: {value}</div>
								))}
							</div>
						),
						"tool-result": <div key={index} style={{ display: "flex", flexDirection: "column" }}>
							<div key={item.toolCallId} className={cls.historyText}>Tool Result: {item.result}</div>,
						</div>,
					}[type]
				})}
			</div>
		</div>
	)
}

export default MessageCmp
