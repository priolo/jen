import HelpIcon from "@/icons/HelpIcon"
import LogIcon from "@/icons/LogIcon"
import NuiIcon from "@/icons/NuiIcon"
import SyncIcon from "@/icons/SyncIcon"
import BucketIcon from "@/icons/cards/BucketIcon"
import BucketsIcon from "@/icons/cards/BucketsIcon"
import ConnectionIcon from "@/icons/cards/ConnectionIcon"
import ConnectionsIcon from "@/icons/cards/ConnectionsIcon"
import ConsumerIcon from "@/icons/cards/ConsumerIcon"
import ConsumersIcon from "@/icons/cards/ConsumersIcon"
import KvEntriesIcon from "@/icons/cards/KvEntriesIcon"
import KvEntryIcon from "@/icons/cards/KvEntryIcon"
import MessageIcon from "@/icons/cards/MessageIcon"
import MessagesIcon from "@/icons/cards/MessagesIcon"
import StreamIcon from "@/icons/cards/StreamIcon"
import StreamsIcon from "@/icons/cards/StreamsIcon"
import { DOC_TYPE } from "@/types"
import { FunctionComponent } from "react"
import { EditorIcon } from "@priolo/jack"



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
		case DOC_TYPE.CODE_EDITOR:
			return null//<EditorIcon className={className} style={style} />

		case DOC_TYPE.ACCOUNT:
			return <SyncIcon className={className} style={style} />

		default:
			return null
	}
}


export default CardIcon