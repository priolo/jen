/** @jsxImportSource @emotion/react */
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
import ElementRow from "@/components/rows/ElementRow"
import { getShortUuid } from "@/utils/object"
import OnlineIcon from "@/components/OnlineIcon"
import chatWSSo from "@/stores/stacks/chat/ws"
import { css } from '@emotion/react';



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
	const handleDelete = () => store.delete(selectedId)


	// RENDER
	const selectedId = (store.state.linked as ChatDetailStore)?.state?.chat?.id
	const isSelected = (chat: Chat) => chat.id == selectedId
	const getName = (chat: Chat) => chat?.name ?? getShortUuid(chat.id) ?? "<no name>"
	const isOnline = (chatId: string) => !!chatWSSo.getChatById(chatId)


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
		<div css={cssListContainer}>
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


const cssListContainer = css({
	display: "flex",
	flexDirection: "column",
})