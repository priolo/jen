import Card, { sxActionCard } from '@/components/Card';
import authSo from '@/stores/auth';
import dialogSo, { DIALOG_TYPE } from '@/stores/layout/dialogStore';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, SxProps, TextField, Typography } from '@mui/material';
import { useStore } from '@priolo/jon';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MessageCmp from '../MessageCmp';



interface Props {
}

/**
 * validazione email per login e registrazione
 */
const EmailLoginCard: React.FC<Props> = ({
}) => {

    // STORES
    useStore(authSo)
    const { t } = useTranslation()

    // HOOKS
    const [emailDialogIsOpen, setEmailDialogIsOpen] = useState(false);
    const [email, setEmail] = useState(authSo.state.user?.email || '');
    const [code, setCode] = useState('');
    useEffect(() => {
        if (!emailDialogIsOpen) return;
        setCode("")
    }, [emailDialogIsOpen])


    // HANDLERS
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };
    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 5);
        setCode(value);
    };
    const handleSendEmailClick = async () => {
        if (!email) {
            dialogSo.dialogOpen({ type: DIALOG_TYPE.WARNING, text: t('cards.EmailLoginCard.alerts.send_code.empty') });
            return;
        }
        try {
            await authSo.emailSendCode(email);
            setEmailDialogIsOpen(true);
        } catch (err) {
            dialogSo.dialogOpen({ type: DIALOG_TYPE.ERROR, text: t('cards.EmailLoginCard.alerts.send_code.error') });
        }
    };
    const handleVerifyAndClose = async () => {
        if (!code) {
            dialogSo.dialogOpen({ type: DIALOG_TYPE.WARNING, text: t('cards.EmailLoginCard.alerts.verify_code.empty') });
            return;
        }
        try {
            await authSo.emailVerifyCode(code);
            dialogSo.dialogOpen({ type: DIALOG_TYPE.SUCCESS, text: t('cards.EmailLoginCard.alerts.verify_code.success') });
            setEmailDialogIsOpen(false);
        }
        catch (err) {
            dialogSo.dialogOpen({ type: DIALOG_TYPE.ERROR, text: t('cards.EmailLoginCard.alerts.verify_code.error') });
        }
    };
    const handleClose = () => {
        setEmailDialogIsOpen(false);
    };


    // RENDER
    const logged = !!authSo.state.user;
    const haveEmail = !!authSo.state.user?.email;
    const isVerified = !!authSo.state.user?.emailVerified

    let status = { status: 'register', variant: 'info' };
    if (logged) {
        if (!haveEmail) status = { status: 'none', variant: 'warn' }
        else if (!isVerified) status = { status: 'unverified', variant: 'warn' };
        else status = { status: 'done', variant: 'done' }
    }

    return <>
        <Card id="email-login-card"
            icon={<MailOutlineIcon />}
            title={t(`cards.EmailLoginCard.title`)}
        >
            <MessageCmp
                variant={status.variant as any}
                title={t(`cards.EmailLoginCard.status.${status.status}.title`)} sx={{ mb: 1 }}
            >
                <Trans i18nKey={`cards.EmailLoginCard.status.${status.status}.desc`} />
            </MessageCmp>

            <TextField fullWidth size="small"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Type your email"
                />

            <Box sx={sxActionCard} >
                <Button
                    onClick={handleSendEmailClick}
                >{isVerified ? t('cards.EmailLoginCard.actions.resend') : t('cards.EmailLoginCard.actions.send')}</Button>
            </Box>
        </Card>

        <Dialog maxWidth="xs" fullWidth
            open={emailDialogIsOpen}
            onClose={handleClose}
        >
            <DialogTitle>
                {t('cards.EmailLoginCard.dialog.title')}
            </DialogTitle>

            <DialogContent sx={sxDialogContent}>

                <Typography variant="body2" color="text.secondary">
                    <Trans i18nKey={`cards.EmailLoginCard.dialog.text`} />
                </Typography>

                <TextField fullWidth
                    value={code}
                    onChange={handleCodeChange}
                    placeholder={t('cards.EmailLoginCard.dialog.placeholder')}
                />

            </DialogContent>

            <DialogActions>
                <Button color="inherit" onClick={handleClose}>
                    {t('cards.EmailLoginCard.dialog.actions.cancel')}
                </Button>
                <Button onClick={handleVerifyAndClose} variant="contained">
                    {t('cards.EmailLoginCard.dialog.actions.verify')}
                </Button>
            </DialogActions>
        </Dialog>

    </>
};

export default EmailLoginCard;

const sxDialogContent: SxProps = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
};