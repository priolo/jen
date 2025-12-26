import React from 'react';
import styles from './Avatar.module.css';

interface Props {
    src?: string;
    alt?: string;
    className?: string;
    style?: React.CSSProperties;
}


/**
 * Visualizza l'AVATAR tramite il suo url oppure le iniziali con colore generato dalla stringa
 */
const Avatar: React.FC<Props> = ({ src, alt, className, style }) => {

    // RENDER

    if (src) {
        return (
            <div className={`${styles.root} ${className || ''}`} style={style}>
                <img src={src} alt={alt} className={styles.img} />
            </div>
        );
    }

    const initials = getInitials(alt || "");
    const backgroundColor = stringToColor(alt || "");

    return (
        <div
            className={`${styles.root} ${className || ''}`}
            style={{ ...style, backgroundColor }}
        >
            {initials}
        </div>
    );
};

export default Avatar;


function stringToColor(string: string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).slice(-2);
    }
    return color;
}

function getInitials(name: string) {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
