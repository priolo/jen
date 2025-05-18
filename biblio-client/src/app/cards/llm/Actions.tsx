import { AgentStore } from "@/stores/stacks/agent"
import { Button } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import cls from "./View.module.css"



interface Props {
	store?: AgentStore
	style?: React.CSSProperties
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
	style,
}) => {

	// STORE
	const state = useStore(store)

	// HOOKs

	// HANDLER
	const handleRoleOpen = (e) => {
		store.setRoleDialogOpen(true)
	}

	// RENDER

	return (<div
		className={cls.actions}
		style={style}
	>
		<div style={{ display: "flex", flex: 1, gap: 5 }}>
			<Button 
				onClick={handleRoleOpen}
			>ROLE</Button>
		</div>
	</div>)
}

export default ActionsCmp
