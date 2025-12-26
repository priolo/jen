import { Account } from '@/types/Account';
import { TooltipWrapCmp } from '@priolo/jack';
import React from 'react';
import Avatar from './Avatar';



interface Props {
    account?: Account
    haveTooltip?: boolean
    style?: React.CSSProperties
    className?: string
}

/**
 * Visualizza l'AVATAR di un ACCOUNT
 */
const AvatarCmp: React.FC<Props> = ({
    account,
    haveTooltip,
    style,
    className,
}) => {

    const avatar = (
        <Avatar
            style={!haveTooltip ? style : undefined}
            className={!haveTooltip ? className : undefined}
            src={account?.avatarUrl}
            alt={account?.name ?? "??"}
        />
    )

    if (haveTooltip && account?.name) {
        return (
            <TooltipWrapCmp
                content={account.name}
                style={style}
                className={className}
            >
                {avatar}
            </TooltipWrapCmp>
        )
    }

    return avatar
};

export default AvatarCmp;
