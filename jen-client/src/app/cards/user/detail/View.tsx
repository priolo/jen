import clsCard from "@/app/cards/CardMintDef.module.css"
import CardIcon from "@/components/cards/CardIcon"
import FrameworkCard from "@/components/cards/FrameworkCard"
import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { DOC_TYPE } from "@/types"
import { TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"



interface Props {
	store?: AccountDetailStore
}

const AccountDetailView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(store.state.group)

	// HOOKs
	useEffect(() => {
		store.fetchIfVoid()
	}, [])

	// HANDLER

	// RENDER

	return <FrameworkCard
		icon={<CardIcon type={DOC_TYPE.ACCOUNT_DETAIL} />}
		className={clsCard.root}
		store={store}
	>
		<TitleAccordion title="BASE">

			<div className="lyt-v">
				<div className="lbl-prop">NAME</div>
				<div className="jack-lbl-readonly">
					{store.state.account?.name ?? "--"}
				</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">E-MAIL</div>
				<div className="jack-lbl-readonly">
					{store.state.account?.email ?? "--"}
				</div>
			</div>

		</TitleAccordion>
	</FrameworkCard>
}

export default AccountDetailView
