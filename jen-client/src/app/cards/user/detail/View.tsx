import clsCard from "@/app/cards/CardYellow.module.css"
import CardIcon from "@/components/cards/CardIcon"
import FrameworkCard from "@/components/cards/FrameworkCard"
import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { DOC_TYPE } from "@/types"
import { TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import AccauntDetailActions from "./Actions"
import Avatar from "@/components/avatar/Avatar"
import AvatarCmp from "@/components/avatar/AvatarCmp"



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
		actionsRender={<AccauntDetailActions store={store} />}
	>
		
		{/* <TitleAccordion title="BASE"> */}

			<div className="jack-lyt-form">

				<AvatarCmp account={store.state.account} style={{ alignSelf: "center"}}/>

				<div className="jack-cmp-v">
					<div className="jack-lbl-prop">NAME</div>
					<div className="jack-lbl-readonly">
						{store.state.account?.name ?? "--"}
					</div>
				</div>

				<div className="jack-cmp-v">
					<div className="jack-lbl-prop">E-MAIL</div>
					<div className="jack-lbl-readonly">
						{store.state.account?.email ?? "--"}
					</div>
				</div>

			</div>

		{/* </TitleAccordion> */}
	</FrameworkCard>
}

export default AccountDetailView
