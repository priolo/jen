import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RoomRepo } from './Room.js';
import { IToolRepo, ToolRepo } from './Tool.js';
import { LlmRepo } from './Llm.js';



export enum AGENT_TYPE {
    REACT = 'react',
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

    /** Descrive l'agent nel tool */
    @Column({ type: 'varchar', default: '' })
    description?: string;

    /** system prompt imprinting */
    @Column({ type: 'varchar', default: '' })
    systemPrompt?: string;

    /** contesto nel prompt iniziale */
    @Column({ type: 'varchar', default: '' })
    contextPrompt?: string;

    @Column({ type: 'boolean', default: false })
    askInformation?: boolean;

    @Column({ type: 'boolean', default: true })
    killOnResponse?: boolean;

    @Column({ type: 'enum', enum: AGENT_TYPE, default: AGENT_TYPE.REACT })
    type?: AGENT_TYPE;

    // RELATIONSHIPS

    // LLM
    /** il nome dell'LLM utilizzato di default */
    @ManyToOne(() => LlmRepo, llm => llm.agents, { nullable: true })
    @JoinColumn({ name: 'llmId' })
    llm?: LlmRepo | null
    @Column({ type: 'uuid', nullable: true })
    llmId?: string | null


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
    tools?: Partial<IToolRepo>[]



    // ROOMS 
    /** rooms where this agent is used */
    @ManyToMany(() => RoomRepo, room => room.agents)
    rooms?: RoomRepo[]
}

export interface IAgentRepo extends InstanceType<typeof AgentRepo> {}

