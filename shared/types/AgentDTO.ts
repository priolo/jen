export enum AGENT_TYPE {
    REACT = 'react',
    MOCK = 'mock',
    HUMAN = 'human',
    FINDER = 'finder'
}

export interface AgentDTO {
    id: string;
    accountId?: string;
    
    name: string;
    description?: string;
    systemPrompt?: string;
    contextPrompt?: string;
    
    askInformation?: boolean;
    killOnResponse?: boolean;
    
    type?: AGENT_TYPE;
    
    llmId?: string;

    // Relations referenziate tramite ID
    baseId?: string;
    
    // Collections
    toolsIds?: string[];
    subAgentsIds?: string[];
}
