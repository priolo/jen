import agentSo from "@/stores/stacks/agent/repo"
import { LlmListStore } from "@/stores/stacks/llm/list"
import { EDIT_STATE } from "@/types"
import { Button, CircularLoadingCmp, FindInputHeader, OptionsCmp } from "@priolo/jack"
import { FunctionComponent, useDeferredValue, useEffect, useState } from "react"



interface Props {
	store?: LlmListStore
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
	const handleDelete = () => store.delete()
	const handleNew = () => store.create()
	const handleSelect = () => store.select()


	// LOADING
	if (store.state.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}


	// RENDER
	const inEdit = store.state.editState == EDIT_STATE.EDIT
	const selectedId = store.getSelected()
	const haveButtonSelect = store.isSelectable()
	const newSelected = store.isNewOpen()

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

		{inEdit &&
			<div style={{ display: "flex" }} >

				{haveButtonSelect &&
					<Button
						children="SEL"
						onClick={handleSelect}
						disabled={!selectedId || !!newSelected}
					/>
				}

				<Button
					children="DEL"
					onClick={handleDelete}
					disabled={!selectedId || newSelected}
				/>

				<Button
					select={newSelected}
					children="NEW"
					onClick={handleNew}
				/>

			</div>
		}
	</>
}

export default ActionsCmp
