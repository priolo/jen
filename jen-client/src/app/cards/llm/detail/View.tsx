import FrameworkCard from "@/components/cards/FrameworkCard"
import { LlmDetailStore } from "@/stores/stacks/llm/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ConnectionIcon from "../../../../icons/cards/ConnectionIcon"
import clsGreen from "../../CardGreen.module.css"
import LlmDetailForm from "./Form"
import LlmDetailActions from "./Actions"



interface Props {
	store?: LlmDetailStore
}

const LlmDetailView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)


	// HOOKs
	useEffect(() => {
		store.fetchIfVoid()
	}, [])


	// HANDLER

	
	// RENDER
	return <FrameworkCard
		className={clsGreen.root}
		icon={<ConnectionIcon />}
		store={store}
		actionsRender={<LlmDetailActions store={store} />}
		iconizedRender={
			<div className="lyt-v lyt-v-btts">
			</div>
		}
	>

		<LlmDetailForm store={store} />

	</FrameworkCard>
}

export default LlmDetailView
