import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from './Room.js';
import { Tool } from './Tool.js';
import { Llm } from './Llm.js';



@Entity('agents')
export class Agent {

    /** id dell'agente */
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /** nome dell'agente */
    @Column({ type: 'varchar', default: '' })
    name: string;

    /** Descrive l'agent nel tool */
    @Column({ type: 'varchar', default: '' })
    description: string;

    /** system prompt imprinting */
    @Column({ type: 'varchar', default: '' })
    systemPrompt: string;

    /** contesto nel prompt iniziale */
    @Column({ type: 'varchar', default: '' })
    contextPrompt: string;

    @Column({ type: 'boolean', default: false })
    askInformation: boolean;

    @Column({ type: 'boolean', default: true })
    killOnResponse: boolean;


    // RELATIONSHIPS

    // LLM
    /** il nome dell'LLM utilizzato di default */
    @ManyToOne(() => Llm, llm => llm.agents, { nullable: true })
    @JoinColumn({ name: 'llmId' })
    llm: Llm | null
    @Column({ type: 'uuid', nullable: true })
    llmId: string | null


    // AGENT BASE (inheritance relationship)
    // Agente base da cui è derivato questo agente
    @ManyToOne(() => Agent, agent => agent.derivedAgents, { nullable: true })
    @JoinColumn({ name: 'baseId' })
    base: Agent | null;
    @Column({ type: 'uuid', nullable: true })
    baseId: string | null;

    // * Agenti derivati da questo agente
    @OneToMany(() => Agent, (agent) => agent.base, { cascade: ['remove'] })
    derivedAgents: Agent[]


    // SUB AGENTS (composition relationship)
    @ManyToMany(() => Agent, (agent) => agent.parentAgents)
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
    subAgents?: Partial<Agent>[]
    // Parent agents (inverse side of subAgents)
    @ManyToMany(() => Agent, (agent) => agent.subAgents)
    parentAgents?: Agent[]


    // TOOLS
    @ManyToMany(() => Tool, tool => tool.agents, { cascade: true })
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
    tools?: Partial<Tool>[]



    // ROOMS 
    /** rooms where is used this agent */
    @OneToMany(() => Room, room => room.agent, { cascade: ['remove'] })
    rooms: Room[]
}