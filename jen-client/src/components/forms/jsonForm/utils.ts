import { JsonSchema } from "./types"



export const getDefaultValue = (schema: JsonSchema): any => {
    if (schema.default !== undefined) {
        return schema.default
    }

    switch (schema.type) {
        case "string":
            return ""
        case "number":
        case "integer":
            return 0
        case "boolean":
            return false
        case "array":
            return []
        case "object":
            const obj: any = {}
            if (schema.properties) {
                Object.entries(schema.properties).forEach(([key, propSchema]) => {
                    obj[key] = getDefaultValue(propSchema)
                })
            }
            return obj
        default:
            return null
    }
}
