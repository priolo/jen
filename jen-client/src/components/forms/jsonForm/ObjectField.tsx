import { FunctionComponent } from "react"
import JsonSchemaField from "./JsonSchemaField"
import { JsonSchema } from "./types"
import { TextInput } from "@priolo/jack"



interface Props {
    schema: JsonSchema
    value: any
    readOnly?: boolean
    isRoot?: boolean

    onChange: (value: any) => void
    style?: React.CSSProperties
    className?: string
}

const ObjectField: FunctionComponent<Props> = ({
    schema,
    value,
    readOnly,
    isRoot = false,

    onChange,
    style,
    className,
}) => {

    // HANDLER
    const handleFieldChange = (fieldName: string, fieldValue: any) => {
        onChange({
            ...value,
            [fieldName]: fieldValue
        })
    }

    const handleObjectStringChange = (val: string) => {
        try {
            onChange(JSON.parse(val))
        } catch {
            // Invalid JSON, keep as string for now
        }
    }


    // RENDER

    if (!schema.properties) {
        const valueStr = JSON.stringify(value || {})
        return <TextInput style={style} className={className}
            value={valueStr}
            onChange={handleObjectStringChange}
            readOnly={readOnly}
            placeholder="JSON Object"
        />
    }

    const properties = Object.entries(schema.properties)
    const rootCn = `${isRoot ? "jack-lyt-form" : "jack-lyt-quote"} ${className}`
    return (
        <div className={rootCn} style={style}>

            {properties.map(([fieldName, fieldSchema]) => (

                <JsonSchemaField
                    key={fieldName}
                    name={fieldName}
                    schema={fieldSchema}
                    value={value[fieldName]}
                    onChange={(val) => handleFieldChange(fieldName, val)}
                    readOnly={readOnly}
                    required={schema.required?.includes(fieldName)}
                />

            ))}

        </div>
    )
}

export default ObjectField
