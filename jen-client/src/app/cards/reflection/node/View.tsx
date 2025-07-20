import FrameworkCard from "@/components/cards/FrameworkCard"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import { deckCardsSo } from "../../../../stores/docs/cards"
import { buildStore } from "../../../../stores/docs/utils/factory"
import { ReflectionState, ReflectionStore } from "../../../../stores/stacks/reflection"
import { NodeStruct } from "../../../../stores/stacks/reflection/types"
import { DOC_TYPE } from "../../../../types"
import clsCard from "../../CardWhiteDef.module.css"
import ActionsCmp from "./Actions"
import NodeRenderCmp from "./NodeRenderCmp"
import ChildrenCmp from "./tree/ChildrenCmp"
import { Button, TitleAccordion } from "@priolo/jack"
import EditorCode from "../../../../components/editor"
import cls from "./View.module.css"



interface Props {
	store?: ReflectionStore
	style?: React.CSSProperties,
}

const ReflectionView: FunctionComponent<Props> = ({
	store,
	style,
}) => {

	// STORE
	useStore(store)

	// HOOKs
	useEffect(() => {
		store.fetchIfVoid()
	}, [])

	// HANDLER
	const handleSelect = (node: NodeStruct) => {
		store.setSelectedId(node.id)
	}
	const handleToggle = (node: NodeStruct) => {
		store.toggleNode(node.id)
	}

	const handlePayloadChange = (action: string, value: string) => {
		store.setActionsPayload({...store.state.actionsPayload, [action]: { value, type: "json" }})
	}
	const handleExecute = (action: string) => {
		store.sendAction(action)
	}

	const handleOpen = (node: NodeStruct) => {
		const view = buildStore({
			type: DOC_TYPE.REFLECTION,
			path: node.path,

		} as ReflectionState) as ReflectionStore
		deckCardsSo.addLink({ view, parent: store, anim: true })
	}

	// RENDER
	const nodeRoot = store.getNode()
	if (!nodeRoot) return <div>VOID</div>
	const isRoot = store.state.path === "/"
	const state = JSON.stringify(nodeRoot.state ?? "")


	return <FrameworkCard
		className={clsCard.root}
		icon={<div style={{ fontSize: 16, fontWeight: 700 }}>?</div>}
		store={store}
		actionsRender={<ActionsCmp store={store} />}
	>

		

		<div className="lyt-v">
			<div className="jack-lbl-prop">{nodeRoot.name}</div>
			<div className="jack-lbl-readonly">{nodeRoot.class ?? "undefined"}</div>
		</div>

		<TitleAccordion title="STATE" open={false}>
			<EditorCode
				className={cls.editor}
				autoFormat
				//readOnly
				//ref={ref => state.editorRef = ref}
				//format={state.format}
				value={state}
			/>
		</TitleAccordion>

		<TitleAccordion title="COMMANDS" open={false}>
			{nodeRoot.commands?.map((cmd, i) => (
				<TitleAccordion key={i} title={cmd} open={false}>
					<EditorCode
						className={cls.editorCommand}
						autoFormat
						//readOnly
						//ref={ref => state.editorRef = ref}
						//format={state.format}
						onChange={(value:string) => handlePayloadChange(cmd, value)}
						value={store.state.actionsPayload[cmd]?.value ?? ""}
					/>
					<Button onClick={() => handleExecute(cmd)}>EXECUTE</Button>
				</TitleAccordion>
			))}
		</TitleAccordion>

		{!nodeRoot.children || nodeRoot.children.length === 0 ? (
			<div className="jack-lbl-empty">NO CHILDREN</div>
		) : (
			<ChildrenCmp
				children={nodeRoot.children}
				states={store.state.nodesState}
				RenderNode={({ node }) => <NodeRenderCmp
					node={node}
					selectedId={store.state.selectedId}
					expanded={store.state.nodesState[node.id]?.expanded}
					onSelect={() => handleSelect(node)}
					onToggle={() => handleToggle(node)}
					onOpen={() => handleOpen(node)}
				/>}
			/>
		)}


	</FrameworkCard>
}

export default ReflectionView


