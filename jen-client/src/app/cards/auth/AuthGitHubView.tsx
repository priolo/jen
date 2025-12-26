import gitHubApi from "@/api/githubService"
import { AuthDetailStore } from "@/stores/stacks/auth/detail"
import authSo from "@/stores/stacks/auth/repo"
import { GitHubUser } from "@/types/GitHub"
import { Button, MESSAGE_TYPE } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useState } from "react"
import GithubUserViewer from "./GithubUserViewer"



interface Props {
	store?: AuthDetailStore
}

const AuthGitHubView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORES
	useStore(authSo)
	const userId = authSo.state.user?.githubId

	// HOOKS
	const [user, setUser] = useState<GitHubUser>(null)
	useEffect(() => {
		if (!userId) {
			setUser(null)
			return
		}
		async function load() {
			const user = await gitHubApi.getUserById(userId)
			setUser(user)
		}
		load()
	}, [userId])


	// HANDLERS
	const handleLogin = async () => {
		await authSo.loginWithGithub()
	};
	const handleAttach = async () => {
		await authSo.attachGithub()
	}
	const handleDetach = async () => {
		if (!await store.alertOpen({
			title: "WARNING",
			body: 'cards.GithubLoginCard.alerts.detach.check',
		})) return

		authSo.detachGithub()

		store.setSnackbar({
			open: true, type: MESSAGE_TYPE.SUCCESS,
			body: `cards.GithubLoginCard.alerts.detach.succes`,
		})
	}


	// RENDER
	const logged = !!authSo.state.user;
	const haveGithub = !!authSo.state.user?.githubId
	const status = haveGithub ? 'done' : 'warn'

	return (
		<div style={{ display: 'flex', flexDirection: "column", gap: 10, alignItems: 'center' }}>

			{!!haveGithub && (
				<GithubUserViewer user={user} />
			)}

			<div>
				{!!logged && !haveGithub ? (
					<Button
						onClick={handleAttach}
					>attach</Button>
				) : !!logged && haveGithub ? (
					<Button
						onClick={handleDetach}
					>detach</Button>
				) : (
					<Button
						onClick={handleLogin}
					>login</Button>
				)}
			</div>

		</div>
	)
}

export default AuthGitHubView
