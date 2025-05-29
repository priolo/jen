import LogIcon from "@/icons/LogIcon"
import SyncIcon from "@/icons/SyncIcon"
import StreamIcon from "@/icons/cards/StreamIcon"
import StreamsIcon from "@/icons/cards/StreamsIcon"
import { DOC_TYPE } from "@/types"
import { FunctionComponent } from "react"



interface Props {
	type: DOC_TYPE,
	className?: string,
	style?: React.CSSProperties,
}

/** restituisce l'icona per un certo TYPE di CARD */
const CardIcon: FunctionComponent<Props> = ({
	type,
	className,
	style,
}) => {
	switch (type) {

		case DOC_TYPE.USERS:
			return <StreamsIcon className={className} style={style} />
		case DOC_TYPE.USER:
			return <StreamIcon className={className} style={style} />

		case DOC_TYPE.LOGS:
			return <LogIcon className={className} style={style} />
		case DOC_TYPE.ABOUT:
			return <div className={className} style={{ fontSize: 16, fontWeight: 700 }}>?</div>
		case DOC_TYPE.REFLECTION:
			return null

		case DOC_TYPE.TEXT_EDITOR:
			return null//<EditorIcon className={className} style={style} />


		case DOC_TYPE.PROMPT_LIST:
			return null
		case DOC_TYPE.PROMPT_DETAIL:
			return null

		case DOC_TYPE.AGENT_LIST:
			return null
		case DOC_TYPE.AGENT:
			return null

		case DOC_TYPE.LLM_LIST:
			return null
		case DOC_TYPE.LLM_DETAIL:
			return null

		case DOC_TYPE.TOOL_LIST:
			return null
		case DOC_TYPE.TOOL_DETAIL:
			return null




		case DOC_TYPE.CODE_EDITOR:
			return null//<EditorIcon className={className} style={style} />

		case DOC_TYPE.ACCOUNT:
			return <SyncIcon className={className} style={style} />

		default:
			return null
	}
}


export default CardIcon