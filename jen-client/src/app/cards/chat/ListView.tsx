import FrameworkCard from "@/components/cards/FrameworkCard"
import { ChatDetailStore } from "@/stores/stacks/chat/detail"
import { ChatListStore } from "@/stores/stacks/chat/list"
import { Chat } from "@/types/Chat"
import { AlertDialog, Button, OptionsCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import EditorIcon from "../../../icons/EditorIcon"
import clsCard from "../CardCyanDef.module.css"
import chatRepoSo from "@/stores/stacks/chat/repo"



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

	// HOOKs
	const chats = useMemo(() => {
		return chatRepoSo.state.all//?.sort((c1, c2) => c1.name?.localeCompare(c2.name))
	}, [chatRepoSo.state.all])

	// HANDLER
	const handleSelect = (chat: Chat) => store.select(chat.id)
	const handleNew = () => store.create()
	const handleDelete = () => store.delete(selectId)


	// RENDER
	const selectId = (store.state.linked as ChatDetailStore)?.state?.chat?.id
	const isSelected = (chat: Chat) => chat.id == selectId

	//const isNewSelect = consumersSa.linked?.state.type == DOC_TYPE.CONSUMER && (consumersSa.linked as ConsumerStore).state.editState == EDIT_STATE.NEW


	// const isNewSelect = cnnListSa.linked?.state.type == DOC_TYPE.CONNECTION && (cnnListSa.linked as CnnDetailStore).state.editState == EDIT_STATE.NEW
	// const selectId = (cnnListSa.linked as CnnDetailStore)?.state?.connection?.id
	// const isSelected = (cnn: Connection) => cnn.id == selectId
	// const isVoid = !(connections?.length > 0)
	// const loaderOpen = cnnListSa.linked?.state.type == DOC_TYPE.CNN_LOADER

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
			{!!selectId && <Button
				children="DELETE"
				onClick={handleDelete}
			/>}
			{!!selectId && <div> | </div>}
			<Button
				children="NEW"
				//select={isNewSelect}
				onClick={handleNew}
			/>
		</>}
	>
		<div className={clsCard.content}>
			{chats?.map((chat) => {
				return <div key={chat.id} className={clsCard.item}>
					<div 
						onClick={(e) => handleSelect(chat)}
					>[{chat.id}] {chat.name} {isSelected(chat) ? "**": ""}</div>
				</div>
			})}
		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default ChatListView
