import AccountViewer from "@/components/avatar/AccountViewer"
import FrameworkCard from "@/components/cards/FrameworkCard"
import { AuthDetailStore } from "@/stores/stacks/auth/detail"
import authSo from "@/stores/stacks/auth/repo"
import { Button } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import CardIcon from "../../../components/cards/CardIcon"
import { DOC_TYPE } from "../../../types"
import clsCard from "../CardWhiteDef.module.css"
import LogInView from "./LogInView"



interface Props {
	store?: AuthDetailStore
}

const AuthView: FunctionComponent<Props> = ({
	store,
}) => {


	// STORE
	useStore(store)
	useStore(authSo)

	// STATE


	// HOOKs
	useEffect(() => {
	}, [])


	// HANDLER
	const handleLogout = () => {
		authSo.logout()
	}

	// RENDER
	const user = authSo.state.user
	const isLogged = !!user

	return <FrameworkCard
		icon={<CardIcon type={DOC_TYPE.AUTH_DETAIL} />}
		className={clsCard.root}
		store={store}
		actionsRender={<>
			<div style={{ flex: 1 }} />
			{isLogged && <Button onClick={handleLogout}>
				LOGOUT
			</Button>}
		</>}
	>
		<div className="lyt-form">
			{isLogged ? (

				<AccountViewer account={user} />

			) : (

				<LogInView store={store} />

			)}
		</div>

	</FrameworkCard>
}

export default AuthView

