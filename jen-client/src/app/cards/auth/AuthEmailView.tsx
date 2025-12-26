import { AuthDetailStore } from "@/stores/stacks/auth/detail"
import authSo from "@/stores/stacks/auth/repo"
import { Button, Dialog, ElementDialog, MESSAGE_TYPE, TextInput } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useState } from "react"



interface Props {
	store: AuthDetailStore
}

const AuthEmailView: FunctionComponent<Props> = ({
	store,
}) => {

	// HOOKS
	const [dialogIsOpen, setDialogIsOpen] = useState(false);
	const [email, setEmail] = useState(authSo.state.user?.email || '');
	const [code, setCode] = useState('');
	useEffect(() => {
		if (!dialogIsOpen) return;
		setCode("")
	}, [dialogIsOpen])


	// STORES
	useStore(authSo)


	// HANDLERS
	const handleEmailChange = (value: string) => {
		setEmail(value);
	};
	const handleCodeChange = (value: string) => {
		value = value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 5);
		setCode(value);
	};
	const handleSendEmailClick = async () => {
		if (!email) {
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.WARNING, timeout: 5000,
				body: "Please enter your email before requesting a verification code.",
			})
			return;
		}
		try {
			await authSo.emailSendCode(email);
			setDialogIsOpen(true);
		} catch (err) {
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.ERROR, timeout: 5000,
				body: "Errore nell'invio codice",
			})
		}
	};
	const handleVerifyAndClose = async () => {
		if (!code) {
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.WARNING, timeout: 5000,
				body: 'cards.EmailLoginCard.alerts.verify_code.empty',
			})
			return;
		}
		try {
			await authSo.emailVerifyCode(code);
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				body: 'cards.EmailLoginCard.alerts.verify_code.success',
			})
			setDialogIsOpen(false);
		}
		catch (err) {
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.ERROR, timeout: 5000,
				body: 'cards.EmailLoginCard.alerts.verify_code.error',
			})
		}
	};
	const handleClose = () => {
		setDialogIsOpen(false);
	};


	// RENDER
	return <>
		<div className="lyt-v">
			<div className="jack-lbl-prop">EMAIL</div>
			<TextInput
				value={email}
				onChange={handleEmailChange}
				placeholder="Type your email"
			/>
			<Button
				onClick={handleSendEmailClick}
			>VERIFY</Button>
		</div>
		<Dialog store={store}
			title="CODE"
			width={280}
			open={dialogIsOpen}
			onClose={handleClose}
		>
			<TextInput
				value={code}
				onChange={handleCodeChange}
				placeholder={'placeholder'}
			/>
			<Button onClick={handleClose}>
				cancel
			</Button>
			<Button onClick={handleVerifyAndClose}>
				verify
			</Button>
		</Dialog>
	</>
}

export default AuthEmailView
