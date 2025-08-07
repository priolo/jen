import FrameworkCard from "@/components/cards/FrameworkCard"
import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { PromptListStore } from "@/stores/stacks/room/list"
import { Room } from "@/types/Room"
import { AlertDialog, Button, OptionsCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import EditorIcon from "../../../icons/EditorIcon"
import clsCard from "../CardCyanDef.module.css"



interface Props {
	store?: PromptListStore
}

/** NON USATO */
const RootListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(store.state.group)


	// HOOKs
	useEffect(() => {
		store.fetchIfVoid()
	}, [])


	// HANDLER
	const handleSelect = (prompt: Room) => store.select(prompt.id)
	const handleNew = () => store.create()
	const handleDelete = () => store.delete(selectId)


	// RENDER
	const selectId = (store.state.linked as RoomDetailStore)?.state?.room?.id
	const isSelected = (prompt: Room) => prompt.id == selectId
	const rooms = store.state.all

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
			{rooms?.map((room) => {
				return <div key={room.id} className={clsCard.item}>
					<div
						onClick={(e) => handleSelect(room)}
					>{room.id} {isSelected(room) ? "**" : ""}</div>
				</div>
			})}
		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default RootListView
