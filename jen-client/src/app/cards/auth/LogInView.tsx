import { AuthDetailStore } from "@/stores/stacks/auth/detail"
import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import { FunctionComponent } from "react"
import AuthEmailView from "./AuthEmailView"
import AuthGitHubView from "./AuthGitHubView"



interface Props {
	store?: AuthDetailStore
}

const LogInView: FunctionComponent<Props> = ({
	store,
}) => {

	// HANDLER
	const handleLoginSuccess = (response: CredentialResponse) => {
		console.log('Login Success:', response);
		//authSo.createSession(response.credential)
	}
	const handleLoginFailure = () => {
		console.log('Login Failure:');
	}

	return (
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

			<AuthEmailView store={store} />

			<AuthGitHubView store={store} />

		</div>
	)
}

export default LogInView
