import Avatar from '@/components/avatar/Avatar';
import { GitHubUser } from '@/types/GitHub';
import dayjs from 'dayjs';
import React from 'react';



interface Props {
    user: GitHubUser;
    noLink?: boolean;
}

const GithubUserViewer: React.FC<Props> = ({
    user,
    noLink,
}) => {

    // RENDER

    if (!user) return <div>NO USER SELECTED</div>

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #ccc', borderRadius: 8, padding: 10 }}>

            <Avatar
                src={user.avatar_url}
                alt={user.login}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: "column", gap: .5 }}>

                <div style={{ display: "flex", alignItems: "baseline", gap: 1 }} >
                    <a href={!noLink ? user.html_url : undefined}>
                        {user.login}
                    </a>
                    <div style={{}}>
                        {user.company}
                    </div>
                </div>

                <div style={sxClips}>
                    <Chip
                        label={dayjs(user.created_at).format('MMM YYYY')}
                    />
                    {!!user.location && <Chip
                        label={user.location}
                    />}
                    {!!user.public_repos && <Chip
                        label={`Repo: ${user.public_repos}`}
                    />}
                    {!!user.followers && <Chip
                        label={`Followers: ${user.followers}`}
                    />}
                    {!!user.following && <Chip
                        label={`Following: ${user.following}`}
                    />}
                </div>

            </div>
        </div>
    )
}

export default GithubUserViewer;

export const sxClips:React.CSSProperties = {
	display: 'flex', gap: 0.5, flexWrap: 'wrap'
}

interface ChipProps {
    label: string;
}

const Chip: React.FC<ChipProps> = ({
    label,
}) => {
    return <div>{label}</div>
}