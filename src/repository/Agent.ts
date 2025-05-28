import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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
    /** ID LLM utilizzato per questo agente*/
    @Column({ type: 'uuid', nullable: true }) 
    llmId: string | null

    /** LLM utilizzato per questo agente*/
    @ManyToOne(() => Llm, (llm) => llm.agents, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'llmId' })
    llm: Llm | null


    // AGENT BASE (inheritance relationship)
    /** ID dell'agente base da cui è derivato questo agente */
    @Column({ type: 'uuid', nullable: true })
    baseId: string | null

    // Agente base da cui è derivato questo agente
    @ManyToOne(() => Agent, (agent) => agent.derivedAgents, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'baseId' })
    base: Agent | null

    // Agenti derivati da questo agente
    @OneToMany(() => Agent, (agent) => agent.base)
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
    subAgents: Agent[]

    // Parent agents (inverse side of subAgents)
    @ManyToMany(() => Agent, (agent) => agent.subAgents)
    parentAgents: Agent[]

    
    // TOOLS
    @ManyToMany(() => Tool, tool => tool.agents,  { cascade: true })
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
    tools: Tool[]
}