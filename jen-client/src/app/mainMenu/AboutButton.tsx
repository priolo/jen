import ArrowUpIcon from "@/icons/ArrowUpIcon"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import StoreButton from "./StoreButton"
import { docsSo, FIXED_CARD } from "@priolo/jack"



interface Props {
}

const AboutButton: FunctionComponent<Props> = ({
}) => {

	// STORE
	const store = docsSo.state.fixedViews?.[FIXED_CARD.ABOUT]
	const state = useStore(store)

	// HOOKs

	// HANDLER

	// RENDER
	if (!store) return null
	const icon = state.about?.shouldUpdate ? <ArrowUpIcon /> : null

	return (
		<StoreButton
			label="HELP"
			store={store}
			badge={icon}
		/>
	)
}

export default AboutButton
