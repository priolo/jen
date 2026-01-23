import type { Relation } from 'typeorm';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { AccountRepo } from './Account.js';
import { RoomRepo } from './Room.js';
import { AccountAssets } from './AccountAssets.js';


/**
 * E' uno spazio dotato di HISTORY dove i CLIENT possono comunicare
 */
@Entity('chats')
export class ChatRepo extends AccountAssets {

    /** Unique identifier */
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: 'uuid', nullable: true })
    mainRoomId?: string;

    @OneToMany(() => RoomRepo, (room) => room.chat)
    rooms: Relation<RoomRepo[]>;
    
}


