import HelpIcon from "@/icons/HelpIcon"
import { ClearSession, EndSession, StartSession } from "@/plugins/session"
import docsSo, { FIXED_CARD } from "@/stores/docs"
import { deckCardsSo } from "@/stores/docs/cards"
import { menuSo } from "@/stores/docs/links"
import { buildAgentList } from "@/stores/stacks/agent/factory"
import { buildEditorNew } from "@/stores/stacks/agentEditor/factory"
import { buildAuthDetailCard } from "@/stores/stacks/auth/factory"
import { buildLlmList } from "@/stores/stacks/llm/factory"
import { buildMcpServerList } from "@/stores/stacks/mcpServer/factory"
import { buildMcpToolDetail } from "@/stores/stacks/mcpTool/factory"
import { buildToolList } from "@/stores/stacks/tool/factory"
import { Button } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import { buildStore } from "../../stores/docs/utils/factory"
import { buildCodeEditor } from "../../stores/stacks/editorCode/factory"
import { ReflectionState, ReflectionStore } from "../../stores/stacks/reflection"
import { buildUsers } from "../../stores/stacks/streams/utils/factory"
import { DOC_TYPE } from "../../types"
import AboutButton from "./AboutButton"
import cls from "./MainMenu.module.css"
import MenuButton from "./MenuButton"
import StoreButton from "./StoreButton"



interface Props {
	style?: React.CSSProperties
}

const MainMenu: FunctionComponent<Props> = ({
	style,
}) => {

	// STORE
	useStore(menuSo)
	useStore(docsSo)

	// HOOKS

	// HANDLERS
	const handleMcpServerList = () => {
		const view = buildMcpServerList()
		deckCardsSo.add({ view, anim: true })
	}

	const handleLlmList = () => {
		const view = buildLlmList()
		deckCardsSo.add({ view, anim: true })
	}
	const handleToolList = () => {
		const view = buildToolList()
		deckCardsSo.add({ view, anim: true })
	}
	const handleAgentList = () => {
		const view = buildAgentList()
		deckCardsSo.add({ view, anim: true })
	}





	const handleUser = () => {
		//const view = buildUserCard()
		//deckCardsSo.add({ view, anim: true })
	}
	const handleUsers = () => {
		const view = buildUsers()
		deckCardsSo.add({ view, anim: true })
	}
	const handleAuth = () => {
		const view = buildAuthDetailCard()
		deckCardsSo.add({ view, anim: true })
	}

	const handleEdit = () => {
		const view = buildCodeEditor("pippo")
		deckCardsSo.add({ view, anim: true })
	}


	const handleDoc = () => {
		const view = buildEditorNew()
		deckCardsSo.add({ view, anim: true })
	}

	const handleReflection = () => {
		const view = buildStore({
			type: DOC_TYPE.REFLECTION,
		} as ReflectionState) as ReflectionStore
		deckCardsSo.add({ view, anim: true })
	}

	const JsonShema = () => {
		const view = buildMcpToolDetail({
			// mcpServerId: store.state.mcpServer.id,
			// mcpTool: tool,
		})
		deckCardsSo.add({ view, anim: true })

	}

	// const handleDocDev = () => {
	// 	const view = buildStore({
	// 		type: DOC_TYPE.TEXT_EDITOR,
	// 		initValue: [{ type: NODE_TYPES.CODE, children: [{ text: "var c = 67" }] }]
	// 	} as TextEditorState) as TextEditorStore
	// 	deckCardsSo.add({ view, anim: true })
	// }

	// RENDER
	return <div style={style} className={cls.root}>

		{/* <Button children="DOC NEW" onClick={handleDocNew} /> */}
		{/* <Button children="DOC" onClick={handleDoc} /> */}
		{/* <Button children="EDIT" onClick={handleEdit} /> */}
		{/* <Button children="REF" onClick={handleReflection} /> */}
		{/* <Button children="DOC DEV" onClick={handleDocDev} /> */}
		<Button children="AUTH" onClick={handleAuth} /> 
		<Button children="MCP" onClick={handleMcpServerList} />
		<Button children="LLM" onClick={handleLlmList} />
		<Button children="TOOLS" onClick={handleToolList} />
		<Button children="AGENTS" onClick={handleAgentList} />
		{/* <Button children="ROOM" onClick={handleRoom} /> */}


		{/* *** DEBUG *** */}
		{process.env.NODE_ENV === 'development' && <>
			<Button children="JSON" onClick={() => JsonShema()} />
			<Button children="SAVE" onClick={() => EndSession()} />
			<Button children="LOAD" onClick={() => StartSession()} />
			<Button children="RESET" onClick={() => ClearSession()} />
		</>}
		{/* *** DEBUG *** */}

		<MenuButton
			title={"USER"}
			subtitle={"SEI TU!"}
			onClick={handleUser}
		>
			<HelpIcon style={{ width: 20 }} />
		</MenuButton>

		<MenuButton
			title={"USERS"}
			subtitle={"TUTTI GLI ALTRI"}
			onClick={handleUsers}
		>
			<HelpIcon style={{ width: 20 }} />
		</MenuButton>

		<StoreButton
			label="LOG"
			store={docsSo.state.fixedViews?.[FIXED_CARD.LOGS]}
		/>

		<AboutButton />

	</div>
}

export default MainMenu
