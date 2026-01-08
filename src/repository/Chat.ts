import type { Relation } from 'typeorm';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChatMessage } from '../types/commons/RoomActions.js';
import { AgentRepo } from './Agent.js';
import { AccountAssets } from './AccountAssets.js';
import { AccountRepo } from './Account.js';


/**
 * E' uno spazio dotato di HISTORY dove i CLIENT possono comunicare
 */
@Entity('chats')
export class ChatRepo extends AccountAssets {

    /** Unique identifier */
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToMany(() => AccountRepo)
    @JoinTable()
    accounts: Relation<AccountRepo[]>;
    
}
