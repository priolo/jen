import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LlmRepo } from './Provider.js';
import { RoomRepo } from './Room.js';
import { ToolRepo } from './Tool.js';
import { LLM_MODELS } from '@/types/commons/LlmProviders.js';



export enum AGENT_TYPE {
    REACT = 'react',
    MOCK = 'mock',
    HUMAN = 'human',
    FINDER = 'finder'
}

@Entity('agents')
export class AgentRepo {

    /** id dell'agente */
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /** nome dell'agente */
    @Column({ type: 'varchar', default: '' })
    name: string;

    /** codice del PROVIDER dell'LLM */
    @Column({ type: 'varchar', nullable: true })
    llmCode?: LLM_MODELS | null

    /** Descrive l'agent nel tool */
    @Column({ type: 'varchar', default: '' })
    description?: string;

    /** system prompt imprinting */
    @Column({ type: 'varchar', default: '' })
    systemPrompt?: string;

    /** contesto nel prompt iniziale */
    @Column({ type: 'varchar', default: '' })
    contextPrompt?: string;

    /**[II] indica che puo' chiedere info al suo "creatore"*/
    @Column({ type: 'boolean', default: false })
    askInformation?: boolean;

    /**[II] quando la risposta è completa viene distrutto. Altrimenti rimane attivo per approfondimenti con la history integra */
    @Column({ type: 'boolean', default: true })
    killOnResponse?: boolean;

    /**[II] da verificare */
    @Column({ type: 'varchar', default: AGENT_TYPE.REACT })
    type?: AGENT_TYPE;

    // RELATIONSHIPS



    // // LLM
    // /** il nome dell'LLM utilizzato di default */
    // @ManyToOne(() => LlmRepo, llm => llm.agents, { nullable: true })
    // @JoinColumn({ name: 'llmId' })
    // llm?: LlmRepo | null
    // @Column({ type: 'uuid', nullable: true })
    // llmId?: string | null
    // LLM CODE
    


    // AGENT BASE (inheritance relationship)
    // Agente base da cui è derivato questo agente
    @ManyToOne(() => AgentRepo, agent => agent.derivedAgents, { nullable: true })
    @JoinColumn({ name: 'baseId' })
    base?: AgentRepo | null;
    @Column({ type: 'uuid', nullable: true })
    baseId?: string | null;

    // * Agenti derivati da questo agente
    @OneToMany(() => AgentRepo, (agent) => agent.base, { cascade: ['remove'] })
    derivedAgents?: AgentRepo[] | null


    // SUB AGENTS (composition relationship)
    @ManyToMany(() => AgentRepo, (agent) => agent.parentAgents)
    @JoinTable({
        name: "agent_relations",
        joinColumn: {
            name: "parentAgentId",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "subAgentId",
            referencedColumnName: "id"
        }
    })
    subAgents?: Partial<AgentRepo>[] 
    // Parent agents (inverse side of subAgents)
    @ManyToMany(() => AgentRepo, (agent) => agent.subAgents)
    parentAgents?: AgentRepo[]


    // TOOLS
    @ManyToMany(() => ToolRepo, tool => tool.agents, { cascade: true })
    @JoinTable({
        name: "agent_tools",
        joinColumn: {
            name: "agentId",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "toolId",
            referencedColumnName: "id"
        }
    })
    tools?: Partial<ToolRepo>[]



    // ROOMS 
    /** rooms where this agent is used */
    @ManyToMany(() => RoomRepo, room => room.agents)
    rooms?: RoomRepo[]
}
