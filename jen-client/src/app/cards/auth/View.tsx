import FrameworkCard from "@/components/cards/FrameworkCard"
import { AuthDetailStore } from "@/stores/stacks/auth/detail"
import authSo from "@/stores/stacks/auth/repo"
import { Button } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import { FunctionComponent, useEffect } from "react"
import CardIcon from "../../../components/cards/CardIcon"
import { DOC_TYPE } from "../../../types"
import clsCard from "../CardWhiteDef.module.css"



interface Props {
	store?: AuthDetailStore
}

const AuthView: FunctionComponent<Props> = ({
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
		icon={<CardIcon type={DOC_TYPE.AUTH_DETAIL} />}
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


					
					
					<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}>
                        <GoogleLogin
                            onSuccess={handleLoginSuccess}
                            onError={handleLoginFailure}
                            // theme="filled_black"
                            // shape="circle"
                            // text="signin"
                            // size="medium"
                            // type='standard'
                        />
                    </GoogleOAuthProvider>
				</div>
			)}



		</div>

	</FrameworkCard>
}

export default AuthView

