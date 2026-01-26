import type { Relation } from 'typeorm';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AccountRepo } from './Account.js';
import { AccountAssets } from './AccountAssets.js';
import { RoomRepo } from './Room.js';


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
