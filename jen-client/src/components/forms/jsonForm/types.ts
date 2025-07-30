
export interface JsonSchema {
    type: string
    properties?: { [key: string]: JsonSchema} 
    required?: string[]
    items?: JsonSchema
    format?: string
    minimum?: number
    maximum?: number
    enum?: any[]
    title?: string
    description?: string
    default?: any
    additionalProperties?: boolean
    $schema?: string
}
