import FrameworkCard from "@/components/cards/FrameworkCard"
import { UsersStore } from "@/stores/stacks/streams"
import { User } from "@/types/User"
import { AlertDialog, FindInputHeader, OptionsCmp, Table } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"



interface Props {
	store?: UsersStore
}

const StreamsListView: FunctionComponent<Props> = ({
	store: store,
}) => {

	// STORE
	const state = useStore(store)
	useStore(store.state.group)

	// HOOKs
	useEffect(() => {
		store.fetchIfVoid()
	}, [])

	// HANDLER
	const handleSelect = (user: User) => store.select(user?.id)

	// RENDER
	const users = store.getFiltered() ?? []
	const idSelected = state.select

	return <FrameworkCard styleBody={{ padding: 0, }}
		store={store}
		actionsRender={<>
			<OptionsCmp
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={store}
			/>
			<FindInputHeader
				value={state.textSearch}
				onChange={text => store.setTextSearch(text)}
			/>
		</>}
	>
		<Table
			items={users}
			props={[
				{ label: "NAME", getValue: s => s.name, isMain: true },
				{ label: "E-MAIL", getValue: s => s.email},
			]}
			selectId={idSelected}
			onSelectChange={handleSelect}
			getId={item => item.id}
			singleRow={store.getWidth() > 430}
		/>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default StreamsListView
