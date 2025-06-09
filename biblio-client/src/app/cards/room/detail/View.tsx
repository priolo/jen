import FrameworkCard from "@/components/cards/FrameworkCard"
import { mdDecor } from "@/components/slate/decorators/mdDecor"
import SendIcon from "@/icons/SendIcon"
import agentSo from "@/stores/stacks/agent/repo"
import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { mdOnKeyDown } from "@/components/slate/utils/mdOnKeyDown"
import { EDIT_STATE } from "@/types"
import { Agent } from "@/types/Agent"
import { FloatButton, ListDialog2, TextInput, TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import { Editable, Slate } from "slate-react"
import EditorIcon from "../../../../icons/EditorIcon"
import clsCard from "../../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import PromptElement from "@/components/slate/elements/room/PromptElement"
import PromptLeaf from "@/components/slate/elements/room/PromptLeaf"
import RoleDialog from "./RoleDialog"
import cls from "./View.module.css"



interface Props {
	store?: RoomDetailStore
}

const RoomView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)


	// HOOKs
	useEffect(() => {
		store.fetchIfVoid()
	}, [])


	// HANDLER
	const handleFocus = () => {
		//store.setFormatOpen(true)
	}
	const handleBlur = () => {
		//store.setFormatOpen(false)
	}
	const handleStartDrag = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
	}

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		//biblioOnKeyDown(event, editor)
		mdOnKeyDown(event, editor)
	}

	const handleCopy = (event: React.ClipboardEvent<HTMLDivElement>) => {
		editor.onCopy(event.nativeEvent);
	}

	const handleAgentChange = (agentId: string) => {
		store.setRoom({ ...store.state.room, agentId })
	}

	const handleCompleteClick = () => {
		store.execute()
	}


	// RENDER
	const editor = store.state.editor
	const agents = agentSo.state.all ?? []
	const selectedAgentId = store.state.room?.agentId
	const inRead = store.state.editState === EDIT_STATE.READ

	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		actionsRender={<ActionsCmp store={store} />}
		iconizedRender={null}
	>

		<TitleAccordion title="BASE" open={false}>
			<div className="lyt-v">
				<div className="jack-lbl-prop">AGENT</div>
				<ListDialog2
					store={store}
					select={selectedAgentId}
					items={agents}
					readOnly={inRead}
					fnGetId={(item: Agent) => item?.id}
					fnGetString={(item: Agent) => item?.name}
					onChangeSelect={handleAgentChange}
				/>
			</div>
		</TitleAccordion>

		<Slate
			editor={editor}
			initialValue={store.state.initValue}
		>
			<Editable
				readOnly={true}
				decorate={mdDecor}
				className={`${cls.editor} code-editor`}
				style={{ flex: 1, overflowY: "auto" }}
				spellCheck={false}
				renderElement={props => <PromptElement {...props} />}
				renderLeaf={props => <PromptLeaf {...props} />}
				onKeyDown={handleKeyDown}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onDragStart={handleStartDrag}
				onCopy={handleCopy}
			/>
		</Slate>

		<TextInput
			value={store.state.prompt}
			onChange={v => store.setPrompt(v)}
			placeholder="Test input"
		/>

		<RoleDialog store={store} />

		<FloatButton
			style={{ position: "absolute", right: 20, bottom: 20 }}
			onClick={handleCompleteClick}
			disabled={false}
		><SendIcon /></FloatButton>

	</FrameworkCard>
}

export default RoomView

