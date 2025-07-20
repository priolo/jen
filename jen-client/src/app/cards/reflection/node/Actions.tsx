import { Button } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import { ReflectionStore } from "../../../../stores/stacks/reflection"



interface Props {
	store?: ReflectionStore
	style?: React.CSSProperties
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
	style,
}) => {

	// STORE
	useStore(store)

	// HOOKs

	// HANDLER
	const handleOpen = () => {
	}
	const handleState = () => {
	}
	const handleExecute = () => {
	}

	// RENDER
	return <>
		<Button
			onClick={handleOpen}
		>LOGS</Button>
	
		{/* <ListDialog width={80}
			store={store}
			select={languages.indexOf(node.lang) ?? 0}
			items={languages}
			onSelect={handleLang}
		/> */}

	</>
}

export default ActionsCmp
