import FrameworkCard from "@/components/cards/FrameworkCard"
import authSo from "@/stores/auth"
import { AccountStore } from "@/stores/stacks/account"
import { useStore } from "@priolo/jon"
import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import { FunctionComponent, useEffect } from "react"
import clsCard from "../CardWhiteDef.module.css"
import CardIcon from "../../../components/cards/CardIcon"
import { DOC_TYPE } from "../../../types"
import { Button } from "@priolo/jack"



interface Props {
	store?: AccountStore
}

const UserView: FunctionComponent<Props> = ({
	store,
}) => {


	// STORE
	useStore(store)
	const authSa = useStore(authSo)


	// HOOKs
	useEffect(() => {
	}, [])


	// HANDLER
	const handleLoginSuccess = (response: CredentialResponse) => {
		console.log('Login Success:', response);
		authSo.createSession(response.credential)
	}
	const handleLoginFailure = () => {
		console.log('Login Failure:');
	}
	const handleLogout = () => {
		authSo.logout()
	}

	// RENDER
	const user = authSo.state.user

	return <FrameworkCard
		icon={<CardIcon type={DOC_TYPE.ACCOUNT} />}
		className={clsCard.root}
		store={store}
	>
		<div className="lyt-form">

			{user != null ? (
				<div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
					<div>{user.email} LOGGED</div>
					<Button
						onClick={handleLogout}
					>LOGOUT</Button>
				</div>
			) : (
				<div style={{ display: 'flex', flexDirection: "column", gap: 10, alignItems: 'center' }}>
					<div>ANONYMOUS</div>
					<GoogleOAuthProvider clientId="106027300810-0udm0cjghhjr87626qrvcoug5ahgq1bh.apps.googleusercontent.com">
						<div>
							<h2>Login with Google</h2>
							<GoogleLogin
								onSuccess={handleLoginSuccess}
								onError={handleLoginFailure}
							/>
						</div>
					</GoogleOAuthProvider>
				</div>
			)}



		</div>

	</FrameworkCard>
}

export default UserView

