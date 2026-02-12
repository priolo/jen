import FrameworkCard from "@/components/cards/FrameworkCard"
import OnlineIcon from "@/components/OnlineIcon"
import ElementRow from "@/components/rows/ElementRow"
import { ChatDetailStore } from "@/stores/stacks/chat/detail"
import { ChatListStore } from "@/stores/stacks/chat/list"
import chatRepoSo from "@/stores/stacks/chat/repo"
import chatWSSo from "@/stores/stacks/chat/ws"
import { getShortUuid } from "@/utils/object"
import { AlertDialog, Button, OptionsCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import EditorIcon from "../../../icons/EditorIcon"
import clsCard from "../CardCyanDef.module.css"
import { ChatDTO } from "@shared/types/ChatDTO"



interface Props {
	store?: ChatListStore
}

const ChatListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(store.state.group)
	useStore(chatRepoSo)
	useStore(chatWSSo)


	// HOOKs
	const chats = useMemo(() => {
		return chatRepoSo.state.all//?.sort((c1, c2) => c1.name?.localeCompare(c2.name))
	}, [chatRepoSo.state.all])


	// HANDLER
	const handleSelect = (chat: ChatDTO) => store.select(chat.id)
	const handleNew = () => store.create()
	const handleDelete = () => store.delete(selectedId)


	// RENDER
	const selectedId = (store.state.linked as ChatDetailStore)?.state?.chatId
	const isSelected = (chat: ChatDTO) => chat.id == selectedId
	const getName = (chat: ChatDTO) => chat?.name ?? getShortUuid(chat.id) ?? "<no name>"
	const isOnline = (chatId: string) => !!chatWSSo.isOnline(chatId)

	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		iconizedRender={null}
		actionsRender={<>
			<OptionsCmp
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={store}
				storeView={store}
			/>
			<div style={{ flex: 1 }} />
			{!!selectedId && <Button
				children="DELETE"
				onClick={handleDelete}
			/>}
			{!!selectedId && <div> | </div>}
			<Button
				children="NEW"
				//select={isNewSelect}
				onClick={handleNew}
			/>
		</>}
	>
		<div style={cssListContainer}>
			{chats?.map((chat) => {
				return <ElementRow key={chat.id}
					icon={<OnlineIcon online={isOnline(chat.id)} />}
					onClick={() => handleSelect(chat)}
					selected={isSelected(chat)}
					title={getName(chat)}
					subtitle={"esperimanto mentale"}
				/>
			})}
		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default ChatListView

const cssListContainer:React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
}