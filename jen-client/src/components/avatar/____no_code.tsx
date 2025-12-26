import React from 'react';
import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from '@mui/material';

type AvatarProps = {
    src?: string;
    alt: string;
    size?: number;
} & Omit<MuiAvatarProps, 'src' | 'alt'>;

const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 48, sx, ...rest }) => {
    const initials = React.useMemo(() => {
        if (!alt) return '';
        const words = alt.trim().split(/\s+/);
        const first = words[0]?.[0] ?? '';
        const second = words[1]?.[0] ?? words[0]?.[1] ?? '';
        return `${first}${second}`.toUpperCase();
    }, [alt]);

    const bgColor = React.useMemo(() => {
        let hash = 0;
        for (let i = 0; i < alt.length; i++) {
            hash = alt.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 55%, 55%)`;
    }, [alt]);

    return (
        <MuiAvatar
            src={src}
            alt={alt}
            sx={{
                width: size,
                height: size,
                fontSize: size * 0.42,
                bgcolor: src ? undefined : bgColor,
                textTransform: 'uppercase',
                ...sx,
            }}
            {...rest}
        >
            {!src && initials}
        </MuiAvatar>
    );
};

export default Avatar;