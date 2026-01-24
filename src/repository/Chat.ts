import type { Relation } from 'typeorm';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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
    @Column({ type: 'varchar', default: '' })
    name: string;

    /** descrizione della CHAT */
    @Column({ type: 'varchar', default: '' })
    description?: string;


    /** la ROOM principale della CHAT */
    @Column({ type: 'uuid', nullable: true })
    mainRoomId?: string;

    /**
     * le ROOMs appartenenti a questa CHAT
     */
    @OneToMany(() => RoomRepo, (room) => room.chat)
    rooms: Relation<RoomRepo[]>;

}


