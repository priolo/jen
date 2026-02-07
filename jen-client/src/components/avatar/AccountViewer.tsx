import { AccountDTO } from "@shared/types/AccountDTO"
import { TooltipWrapCmp } from '@priolo/jack';
import React from 'react';
import AvatarCmp from './AvatarCmp';



interface Props {
    account: AccountDTO;
}


/**
 * Visualizza i dati salienti di un ACCOUNT
 */
const AccountViewer: React.FC<Props> = ({
    account
}) => {

    if (!account) return <div>NO ACCOUNT SELECTED</div>

   
   

    const githubLink = account.githubName ? `https://github.com/${account.githubName}` : undefined;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AvatarCmp account={account} />
                
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontWeight: 'bold' }}>
                        {account.name}
                    </div>
                    {account.githubName &&
                        <div style={{ fontSize: '0.8em', color: 'gray' }}>
                            <a href={githubLink} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                {account.githubName}
                            </a>
                        </div>
                    }
                </div>
            </div>

            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>

                {account.googleEmail && (
                    <TooltipWrapCmp content="Google Account">
                        <Chip label="GOOGLE" color="#1976d2" />
                    </TooltipWrapCmp>
                )}

                {account.githubId && (
                    <TooltipWrapCmp content="GitHub Account">
                        <Chip label="GITHUB" color="#1976d2" />
                    </TooltipWrapCmp>
                )}
       

            </div>

        </div >
    )
};

const Chip = ({ label, color }: { label: string, color: string }) => (
    <div style={{
        backgroundColor: color,
        color: 'white',
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: '0.75rem',
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 24,
        fontFamily: 'sans-serif'
    }}>
        {label}
    </div>
)

export default AccountViewer;
