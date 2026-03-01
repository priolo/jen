import agentSo from "@/stores/stacks/agent/repo"
import { ToolListStore } from "@/stores/stacks/tool/list"
import { Button, CircularLoadingCmp, FindInputHeader, OptionsCmp } from "@priolo/jack"
import { FunctionComponent, useDeferredValue, useEffect, useState } from "react"



interface Props {
	store?: ToolListStore
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
	const handleRemove = () => store.remove()
	const handleNew = () => store.create()
	const handleSelect = () => store.select()
	const handleAdd = () => store.add()


	// LOADING
	if (store.state.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}


	// RENDER
	const selectedId = store.getSelected()

	const haveButtonSelect = !!store.state.onSelected
	const haveButtonAddRemove = !!store.state.onToolsChange
	const haveLoader = !store.state.tools
	const haveButtonNew = !store.state.onToolsChange

	const addSelected = store.isAddSelected()
	const newSelected = store.isNewOpen()
	const removeDisabled = !selectedId || newSelected
	

	return <>

		{haveLoader &&
			<OptionsCmp
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={agentSo}
				storeView={store}
			/>
		}

		<FindInputHeader
			value={textSearch}
			onChange={text => setTextSearch(text)}
		/>

		<div style={{ display: "flex" }} >

			{haveButtonAddRemove && <>
				<Button
					children="ADD"
					onClick={handleAdd}
					select={addSelected}
				/>
				<Button
					children="REMOVE"
					onClick={handleRemove}
					disabled={removeDisabled}
				/>
			</>}

			{haveButtonSelect &&
				<Button
					children="SEL"
					onClick={handleSelect}
					disabled={!selectedId || !!newSelected}
				/>
			}

			{!haveButtonAddRemove &&
				<Button
					children="DEL"
					onClick={handleDelete}
					disabled={!selectedId || newSelected}
				/>
			}

			{haveButtonNew &&
				<Button
					select={newSelected}
					children="NEW"
					onClick={handleNew}
				/>
			}

		</div>
	</>
}

export default ActionsCmp
