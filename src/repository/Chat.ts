import type { Relation } from 'typeorm';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AccountDTOFromAccountRepo, AccountDTOFromAccountRepoList, AccountRepo } from './Account.js';
import { AccountAssets } from './AccountAssets.js';
import { RoomDTOFromRoomRepo, RoomRepo } from './Room.js';
import { AccountDTO } from '@shared/types/AccountDTO.js';
import { ChatDTO } from '@shared/types/ChatDTO.js';


/**
 * E' uno spazio dotato di HISTORY dove i CLIENT possono comunicare
 */
@Entity('chats')
export class ChatRepo extends AccountAssets {

    /** Unique identifier */
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /** nome della CHAT */
    @Column({ type: 'varchar', nullable: true })
    name?: string;

    /** descrizione della CHAT */
    @Column({ type: 'varchar', nullable: true })
    description?: string;


    /** la ROOM principale della CHAT */
    @Column({ type: 'uuid', nullable: true })
    mainRoomId: string;

    /**
     * le ROOMs appartenenti a questa CHAT
     */
    @OneToMany(() => RoomRepo, (room) => room.chat)
    rooms: Relation<RoomRepo[]>;

    /**
     * gli UTENTI che partecipano alla CHAT
     */
    @ManyToMany(() => AccountRepo)
    @JoinTable()
    users: Relation<AccountRepo[]>;

}

export function ChatDTOFromChatRepo(chat: ChatRepo): ChatDTO {
	if (!chat) return null
	return {
        accountId: chat.accountId,

		id: chat.id,
		name: chat.name,
		description: chat.description,
		mainRoomId: chat.mainRoomId,
		rooms: chat.rooms?.map(room => RoomDTOFromRoomRepo(room)) || [],
        users: AccountDTOFromAccountRepoList(chat.users),

        onlineUserIds: [],
	}
}

export function ChatDTOListFromChatRepoList(chats: ChatRepo[]): ChatDTO[] {
    if (!chats) return []
    return chats.map(chat => ChatDTOFromChatRepo(chat)) 
}