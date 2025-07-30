import { FunctionComponent } from "react"
import JsonSchemaField from "./JsonSchemaField"
import { getDefaultValue } from "./utils"
import { JsonSchema } from "./types"
import { Button, IconButton, TextInput } from "@priolo/jack"
import ClearIcon from "@/icons/ClearIcon"
import CloseIcon from "@/icons/CloseIcon"
import AddIcon from "@/icons/AddIcon"




interface Props {
    schema: JsonSchema
    value: any[]
    readOnly?: boolean

    onChange: (value: any[]) => void
    style?: React.CSSProperties
    className?: string

}
const ArrayField: FunctionComponent<Props> = ({
    schema,
    value,
    readOnly,

    onChange,
    style,
    className
}) => {

    // HANDLER
    const handleItemChange = (index: number, itemValue: any) => {
        const newArray = [...value]
        newArray[index] = itemValue
        onChange(newArray)
    }

    const handleAddItem = () => {
        const defaultValue = getDefaultValue(schema.items!)
        onChange([...value, defaultValue])
    }

    const handleRemoveItem = (index: number) => {
        const newArray = value.filter((_, i) => i !== index)
        onChange(newArray)
    }

    const hadleArrayStringChange = (val: string) => {
        try {
            onChange(JSON.parse(val))
        } catch {
            // Invalid JSON, keep as string for now
        }
    }


    // RENDER

    // If no items schema is defined, treat it as a simple string array
    if (!schema.items) {
        const arrayString = JSON.stringify(value ?? [])
        return <TextInput style={style} className={className}
            value={arrayString}
            onChange={hadleArrayStringChange}
            readOnly={readOnly}
            placeholder="JSON Array"
        />
    }

    return (
        <div className="jack-lyt-quote" style={style}>

            {value.map((item, index) => (




                <JsonSchemaField style={{ flex: 1 }}
                    name={`item-${index}`}
                    schema={schema.items!}
                    value={item}
                    onChange={(val) => handleItemChange(index, val)}
                    readOnly={readOnly}

                    labelEndRender={!readOnly && (
                        <IconButton effect
                            onClick={() => handleRemoveItem(index)}
                        ><CloseIcon /></IconButton>
                    )}
                />




            ))}

            {!readOnly && (
                <IconButton effect style={{ alignSelf: 'start' }}
                    onClick={handleAddItem}
                ><AddIcon /></IconButton>
            )}
        </div>
    )
}


export default ArrayField
