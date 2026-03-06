import { AccountFinderStore } from "@/stores/stacks/account/finder"
import agentSo from "@/stores/stacks/agent/repo"
import { Button, CircularLoadingCmp, FindInputHeader, OptionsCmp } from "@priolo/jack"
import { FunctionComponent, useDeferredValue, useEffect, useState } from "react"



interface Props {
	store?: AccountFinderStore
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	// useStore(store.state.group)
	// useStore(store)


	// HOOKs
	const [textSearch, setTextSearch] = useState(store.state.textSearch)
	const textSearchDeferred = useDeferredValue(textSearch)
	useEffect(() => {
		store.setTextSearch(textSearchDeferred)
	}, [textSearchDeferred])


	// HANDLER
	const handleSelect = () => store.select()


	// LOADING
	if (store.state.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}


	// RENDER
	const selectedId = store.getSelected()
	const haveButtonSelect = !!store.state.onSelected

	return <>

		<OptionsCmp
			style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
			store={agentSo}
			storeView={store}
		/>

		<FindInputHeader
			value={textSearch}
			onChange={text => setTextSearch(text)}
		/>

		<div style={{ display: "flex" }} >
			{haveButtonSelect &&
				<Button
					children="SEL"
					onClick={handleSelect}
					disabled={!selectedId}
				/>
			}
		</div>

	</>
}

export default ActionsCmp
